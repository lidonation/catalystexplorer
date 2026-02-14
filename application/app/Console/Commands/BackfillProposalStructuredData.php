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
    private const VALID_FIELDS = ['project_details', 'pitch', 'category_questions', 'theme'];

    protected $signature = 'proposals:backfill-structured-data
                            {--limit= : Maximum number of proposals to process}
                            {--fund= : Fund title, slug, or UUID}
                            {--field= : Specific field to backfill (project_details, pitch, category_questions, theme)}
                            {--dry-run : Preview without making changes}
                            {--force : Overwrite existing data}';

    private int $processed = 0;

    private int $updated = 0;

    private int $skipped = 0;

    private int $failed = 0;

    public function handle(): int
    {
        $field = $this->option('field');
        $fields = $field ? [$field] : self::VALID_FIELDS;
        $dryRun = (bool) $this->option('dry-run');
        $force = (bool) $this->option('force');

        foreach ($fields as $f) {
            if (! in_array($f, self::VALID_FIELDS)) {
                $this->error("Invalid field: {$f}. Valid: ".implode(', ', self::VALID_FIELDS));

                return Command::FAILURE;
            }
        }

        $query = $this->buildQuery($fields, $force);
        if ($query === null) {
            return Command::FAILURE;
        }

        $total = (clone $query)->count();
        $this->info("Found {$total} proposals to process".($dryRun ? ' (dry run)' : ''));

        if ($total === 0) {
            return Command::SUCCESS;
        }

        $parser = app(ProposalContentParserService::class);
        $progressBar = $this->output->createProgressBar($total);
        $progressBar->start();

        $query->chunk(100, function ($proposals) use ($parser, $fields, $dryRun, $force, $progressBar) {
            foreach ($proposals as $proposal) {
                $this->processProposal($proposal, $parser, $fields, $dryRun, $force);
                $progressBar->advance();
            }
        });

        $progressBar->finish();
        $this->newLine(2);

        $this->table(
            ['Metric', 'Count'],
            [
                ['Processed', $this->processed],
                ['Updated', $this->updated],
                ['Skipped', $this->skipped],
                ['Failed', $this->failed],
            ]
        );

        return Command::SUCCESS;
    }

    private function buildQuery(array $fields, bool $force)
    {
        $query = Proposal::query()
            ->whereNotNull('content')
            ->whereRaw("content::text != ''")
            ->withoutGlobalScopes();

        if ($fundId = $this->option('fund')) {
            $fund = Fund::withoutGlobalScopes()
                ->where('id', $fundId)
                ->orWhere('slug', $fundId)
                ->orWhere('title', 'ILIKE', "%{$fundId}%")
                ->first();

            if (! $fund) {
                $this->error("Fund not found: {$fundId}");

                return null;
            }

            $query->where('fund_id', $fund->id);
        }

        if (! $force) {
            $query->where(function ($q) use ($fields) {
                foreach ($fields as $f) {
                    $q->orWhereNull($f);
                }
            });
        }

        if ($limit = $this->option('limit')) {
            $query->limit((int) $limit);
        }

        return $query;
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
            if (! $force && ! empty($proposal->getRawOriginal($field))) {
                continue;
            }

            $parsed = $allParsed[$field] ?? null;
            if (! empty($parsed)) {
                $updates[$field] = $parsed;
            }
        }

        if (empty($updates)) {
            return;
        }

        if ($dryRun) {
            $this->updated++;

            return;
        }

        try {
            DB::table('proposals')
                ->where('id', $proposal->id)
                ->update(array_map('json_encode', $updates));

            $this->updated++;
        } catch (\Exception $e) {
            $this->failed++;
            Log::error("Backfill failed for proposal {$proposal->id}: ".$e->getMessage());
        }
    }

    private function getProposalContent(Proposal $proposal): ?string
    {
        $content = $proposal->getOriginal('content');
        if (empty($content)) {
            return null;
        }

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
