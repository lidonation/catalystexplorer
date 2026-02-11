<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Fund;
use App\Models\Proposal;
use App\Services\ProposalContentParserService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BackfillProposalStructuredData extends Command
{
    protected $signature = 'proposals:backfill-structured-data
                            {--limit= : Maximum number of proposals to process}
                            {--fund= : Fund to process - accepts title, slug, or UUID (e.g., "Fund 10", fund-10)}
                            {--field= : Specific field to backfill (project_details, pitch, category_questions, theme)}
                            {--dry-run : Preview what would be updated without making changes}
                            {--force : Process even if JSONB fields already have data}
                            {--popular : Process proposals ordered by vote count (most popular first)}';

    // protected $description = 'Backfill structured content fields (project_details, pitch, etc.) by parsing markdown content';

    private int $processed = 0;

    private int $updated = 0;

    private int $skipped = 0;

    private int $failed = 0;

    public function handle(): int
    {
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $fundId = $this->option('fund');
        $field = $this->option('field');
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');
        $popular = $this->option('popular');

        $fields = $field ? [$field] : ['project_details', 'pitch', 'category_questions', 'theme'];

        $validFields = ['project_details', 'pitch', 'category_questions', 'theme'];
        foreach ($fields as $f) {
            if (! in_array($f, $validFields)) {
                $this->error("Invalid field: {$f}. Valid fields are: ".implode(', ', $validFields));

                return Command::FAILURE;
            }
        }

        $this->info('Starting structured data backfill...');
        $this->info('Fields: '.implode(', ', $fields));

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        $parser = app(ProposalContentParserService::class);

        // Build query
        $query = Proposal::query()
            ->whereNotNull('content')
            ->whereRaw("content::text != ''")
            ->withoutGlobalScopes();

        // Filter by fund if specified
        if ($fundId) {
            $fund = Fund::withoutGlobalScopes()
                ->where('id', $fundId)
                ->orWhere('slug', $fundId)
                ->orWhere('title', 'ILIKE', "%{$fundId}%")
                ->first();

            if (! $fund) {
                $this->error("Fund not found: {$fundId}");
                $this->line('Available funds:');
                Fund::withoutGlobalScopes()->orderBy('title')->each(
                    fn ($f) => $this->line("  - {$f->title} (slug: {$f->slug}, id: {$f->id})")
                );

                return Command::FAILURE;
            }

            $query->where('fund_id', $fund->id);
            $this->info("Filtering by fund: {$fund->title} ({$fund->id})");
        }

        // process proposals without existing data
        if (! $force) {
            $query->where(function ($q) use ($fields) {
                foreach ($fields as $f) {
                    $q->orWhereNull($f);
                }
            });
        }

        // Order by popularity if requested
        if ($popular) {
            $query->orderByDesc('yes_votes_count');
            $this->info('Processing in order of popularity (most votes first)');
        }

        // Apply limit
        if ($limit) {
            $query->limit($limit);
            $this->info("Limiting to {$limit} proposals");
        }

        $total = (clone $query)->count();
        $this->info("Found {$total} proposals to process");

        if ($total === 0) {
            $this->info('No proposals to process.');

            return Command::SUCCESS;
        }

        $this->newLine();
        $progressBar = $this->output->createProgressBar($limit ?? $total);
        $progressBar->start();

        // Process in chunks to manage memory
        $query->chunk(100, function ($proposals) use ($parser, $fields, $dryRun, $force, $progressBar) {
            foreach ($proposals as $proposal) {
                $this->processProposal($proposal, $parser, $fields, $dryRun, $force);
                $progressBar->advance();
            }
        });

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info('Backfill complete!');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Processed', $this->processed],
                ['Updated', $this->updated],
                ['Skipped (no parseable content)', $this->skipped],
                ['Failed', $this->failed],
            ]
        );

        if ($dryRun) {
            $this->warn('This was a dry run. Run without --dry-run to apply changes.');
        }

        return Command::SUCCESS;
    }

    private function processProposal(
        Proposal $proposal,
        ProposalContentParserService $parser,
        array $fields,
        bool $dryRun,
        bool $force
    ): void {
        $this->processed++;

        $content = $this->getProposalContent($proposal);

        if (empty($content)) {
            $this->skipped++;

            return;
        }

        $allParsed = $parser->parseAll($content);

        $updates = [];

        foreach ($fields as $field) {
            $currentValue = $proposal->getRawOriginal($field);
            if (! $force && ! empty($currentValue)) {
                continue;
            }

            try {
                $parsed = $allParsed[$field] ?? null;

                if ($parsed !== null && ! empty($parsed)) {
                    $updates[$field] = $parsed;
                }
            } catch (\Exception $e) {
                Log::warning("Failed to parse {$field} for proposal {$proposal->id}: ".$e->getMessage());
                $this->failed++;
            }
        }

        if (empty($updates)) {
            return;
        }

        if ($dryRun) {
            $this->updated++;

            if ($this->output->isVerbose()) {
                $this->newLine();
                $this->info("Would update proposal {$proposal->id} ({$proposal->title}):");
                foreach ($updates as $field => $data) {
                    $this->line("  - {$field}: ".json_encode(array_keys($data)));
                }
            }

            return;
        }

        try {
            $dbUpdates = [];
            foreach ($updates as $field => $data) {
                $dbUpdates[$field] = json_encode($data);
            }

            DB::table('proposals')
                ->where('id', $proposal->id)
                ->update($dbUpdates);

            $this->updated++;

            Log::info('Backfilled structured data for proposal', [
                'proposal_id' => $proposal->id,
                'fields' => array_keys($updates),
            ]);
        } catch (\Exception $e) {
            $this->failed++;
            Log::error("Failed to update proposal {$proposal->id}: ".$e->getMessage());
        }
    }

    private function getProposalContent(Proposal $proposal): ?string
    {
        $content = $proposal->getOriginal('content');

        if (empty($content)) {
            return null;
        }

        // Handle translated content (stored as JSON like {"en": "...", "es": "..."})
        if (is_array($content)) {
            $content = $content['en'] ?? array_values($content)[0] ?? null;
        }
        if (is_string($content) && str_starts_with(trim($content), '{')) {
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $content = $decoded['en'] ?? array_values($decoded)[0] ?? $content;
            }
        }

        return is_string($content) ? $content : null;
    }
}
