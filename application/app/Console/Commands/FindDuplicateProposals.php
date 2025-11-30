<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Proposal;
use Illuminate\Console\Command;

class FindDuplicateProposals extends Command
{
    protected $signature = 'proposals:find-duplicates {--output=duplicate_proposals.csv : Output CSV filename}';

    protected $description = 'Find duplicate proposals and generate a CSV report';

    public function handle()
    {
        $this->info('Starting duplicate proposal analysis...');

        // First check for UUID duplicates
        $this->info('Checking for UUID duplicates...');
        $totalProposals = Proposal::count();
        $uniqueIds = Proposal::distinct('id')->count();

        if ($totalProposals !== $uniqueIds) {
            $this->error('UUID DUPLICATES DETECTED!');
            $this->error("Total proposals: {$totalProposals}");
            $this->error("Unique IDs: {$uniqueIds}");
            $this->error('Duplicate count: '.($totalProposals - $uniqueIds));

            // Find the actual duplicate UUIDs
            $duplicateIds = Proposal::select('id', \DB::raw('COUNT(*) as count'))
                ->groupBy('id')
                ->having('count', '>', 1)
                ->get();

            $this->error('Duplicate UUIDs:');
            foreach ($duplicateIds as $duplicate) {
                $this->line("- {$duplicate->id} appears {$duplicate->count} times");
            }
        } else {
            $this->info('No UUID duplicates found.');
        }

        // Get all proposals with key identifying fields
        $proposals = Proposal::select([
            'id',
            'title',
            'ideascale_link',
            'fund_id',
            'campaign_id',
            'amount_requested',
            'created_at',
            'updated_at',
        ])
            ->orderBy('created_at')
            ->get();

        $this->info("Found {$proposals->count()} total proposals");

        $duplicates = [];
        $seen = [];

        // Group by potential duplicate criteria
        foreach ($proposals as $proposal) {
            // Create keys for different types of duplicates
            $keys = [
                'title' => trim(strtolower($proposal->title ?? '')),
                'ideascale_link' => $proposal->ideascale_link,
                'title_fund' => trim(strtolower($proposal->title ?? '')).'|'.$proposal->fund_id,
            ];

            foreach ($keys as $keyType => $key) {
                if (empty($key) || $key === '|') {
                    continue;
                }

                if (! isset($seen[$keyType][$key])) {
                    $seen[$keyType][$key] = [];
                }

                $seen[$keyType][$key][] = $proposal;
            }
        }

        // Find actual duplicates
        foreach ($seen as $keyType => $groups) {
            foreach ($groups as $key => $proposalGroup) {
                if (count($proposalGroup) > 1) {
                    foreach ($proposalGroup as $proposal) {
                        $duplicates[] = [
                            'id' => $proposal->id,
                            'title' => $proposal->title,
                            'ideascale_link' => $proposal->ideascale_link,
                            'fund_id' => $proposal->fund_id,
                            'campaign_id' => $proposal->campaign_id,
                            'amount_requested' => $proposal->amount_requested,
                            'created_at' => $proposal->created_at,
                            'updated_at' => $proposal->updated_at,
                            'duplicate_type' => $keyType,
                            'duplicate_key' => $key,
                            'duplicate_count' => count($proposalGroup),
                        ];
                    }
                }
            }
        }

        // Remove exact duplicates from the duplicates array
        $uniqueDuplicates = [];
        foreach ($duplicates as $duplicate) {
            $uniqueKey = $duplicate['id'].'|'.$duplicate['duplicate_type'];
            if (! isset($uniqueDuplicates[$uniqueKey])) {
                $uniqueDuplicates[$uniqueKey] = $duplicate;
            }
        }

        $duplicates = array_values($uniqueDuplicates);

        $this->info('Found '.count($duplicates).' duplicate proposal entries');

        // Generate CSV
        $csvFile = $this->option('output');
        if (! str_contains($csvFile, '_')) {
            $csvFile = 'duplicate_proposals_'.date('Y-m-d_H-i-s').'.csv';
        }

        $handle = fopen($csvFile, 'w');

        // CSV headers
        $headers = [
            'ID',
            'Title',
            'Ideascale Link',
            'Fund ID',
            'Campaign ID',
            'Amount Requested',
            'Created At',
            'Updated At',
            'Duplicate Type',
            'Duplicate Key',
            'Duplicate Count',
        ];

        fputcsv($handle, $headers);

        // Write duplicate data
        foreach ($duplicates as $duplicate) {
            fputcsv($handle, [
                $duplicate['id'],
                $duplicate['title'],
                $duplicate['ideascale_link'],
                $duplicate['fund_id'],
                $duplicate['campaign_id'],
                $duplicate['amount_requested'],
                $duplicate['created_at'],
                $duplicate['updated_at'],
                $duplicate['duplicate_type'],
                $duplicate['duplicate_key'],
                $duplicate['duplicate_count'],
            ]);
        }

        fclose($handle);

        $this->info('Duplicate analysis complete!');
        $this->info("CSV report saved as: $csvFile");

        // Summary statistics
        $duplicateTypes = [];
        foreach ($duplicates as $duplicate) {
            $type = $duplicate['duplicate_type'];
            if (! isset($duplicateTypes[$type])) {
                $duplicateTypes[$type] = 0;
            }
            $duplicateTypes[$type]++;
        }

        $this->info("\nDuplicate Summary:");
        foreach ($duplicateTypes as $type => $count) {
            $this->line("- $type: $count entries");
        }

        // Show some examples
        $this->info("\nExample duplicates:");
        $examples = array_slice($duplicates, 0, 5);
        foreach ($examples as $example) {
            $this->line("- ID {$example['id']}: {$example['title']} (Type: {$example['duplicate_type']})");
        }

        return Command::SUCCESS;
    }
}
