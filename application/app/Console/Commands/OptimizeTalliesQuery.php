<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\CatalystTally;
use App\Models\Fund;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class OptimizeTalliesQuery extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'optimize:tallies-query {--analyze} {--recommend-indexes} {--clear-cache}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyze and optimize the tallies query performance';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Tallies Query Optimization Tool');
        $this->info('=====================================');

        if ($this->option('clear-cache')) {
            $this->clearTalliesCache();
        }

        if ($this->option('analyze')) {
            $this->analyzeQueryPerformance();
        }

        if ($this->option('recommend-indexes')) {
            $this->recommendDatabaseIndexes();
        }

        if (! $this->option('analyze') && ! $this->option('recommend-indexes') && ! $this->option('clear-cache')) {
            $this->showUsage();
        }

        return Command::SUCCESS;
    }

    private function clearTalliesCache(): void
    {
        $this->info('\n🗑️  Clearing tallies cache...');

        $patterns = [
            'tallies_*',
            'fund_*_total_votes',
        ];

        foreach ($patterns as $pattern) {
            if (method_exists(\Cache::store(), 'flush')) {
                // For Redis/Memcached stores that support patterns
                try {
                    $keys = \Cache::getRedis()->keys($pattern);
                    if (! empty($keys)) {
                        \Cache::getRedis()->del($keys);
                        $this->info('   ✅ Cleared '.count($keys)." keys matching '{$pattern}'");
                    }
                } catch (\Exception $e) {
                    $this->warn("   ⚠️  Could not clear pattern '{$pattern}': ".$e->getMessage());
                }
            }
        }

        $this->info('   ✅ Cache clearing completed');
    }

    private function analyzeQueryPerformance(): void
    {
        $this->info('\n📊 Analyzing Query Performance...');

        // Get sample fund for analysis
        $fund = Fund::orderBy('id', 'desc')->first();
        if (! $fund) {
            $this->error('No funds found for analysis');

            return;
        }

        $this->info("   📁 Using fund: {$fund->title} (ID: {$fund->id})");

        // Analyze table sizes
        $this->analyzeTableSizes();

        // Analyze query patterns
        $this->analyzeQueryPatterns($fund);

        // Check for missing indexes
        $this->checkExistingIndexes();
    }

    private function analyzeTableSizes(): void
    {
        $this->info('\n📈 Table Size Analysis:');

        $tables = [
            'catalyst_tallies' => 'Catalyst Tallies',
            'proposals' => 'Proposals',
            'campaigns' => 'Campaigns',
            'metas' => 'Metadata',
            'teams' => 'Teams',
        ];

        foreach ($tables as $table => $name) {
            try {
                $count = DB::table($table)->count();
                $this->info(sprintf('   %-20s %s rows', $name.':', number_format($count)));
            } catch (\Exception $e) {
                $this->warn("   ⚠️  Could not analyze table '{$table}'");
            }
        }
    }

    private function analyzeQueryPatterns(Fund $fund): void
    {
        $this->info('\n🔍 Query Pattern Analysis:');

        // Test basic count query performance
        $start = microtime(true);
        $count = CatalystTally::where('context_id', $fund->id)->count();
        $basicTime = microtime(true) - $start;
        $this->info(sprintf('   Basic count query: %.3fs (%s tallies)', $basicTime, number_format($count)));

        // Test join query performance
        $start = microtime(true);
        $joinCount = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->where('catalyst_tallies.context_id', $fund->id)
            ->count();
        $joinTime = microtime(true) - $start;
        $this->info(sprintf('   Join count query: %.3fs (%s tallies)', $joinTime, number_format($joinCount)));

        // Test complex query performance
        $start = microtime(true);
        $complexQuery = CatalystTally::join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
            ->join('campaigns', 'proposals.campaign_id', '=', 'campaigns.id')
            ->where('catalyst_tallies.context_id', $fund->id)
            ->limit(10)
            ->get();
        $complexTime = microtime(true) - $start;
        $this->info(sprintf('   Complex join query (10 rows): %.3fs', $complexTime));

        // Performance recommendations
        if ($basicTime > 0.1) {
            $this->warn('   ⚠️  Basic count query is slow - consider indexing context_id');
        }
        if ($joinTime > 0.2) {
            $this->warn('   ⚠️  Join query is slow - consider composite indexes');
        }
    }

    private function checkExistingIndexes(): void
    {
        $this->info('\n🔧 Existing Index Analysis:');

        try {
            // Check for PostgreSQL indexes
            $indexes = DB::select("SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('catalyst_tallies', 'proposals', 'campaigns', 'metas') ORDER BY tablename, indexname");

            $tableIndexes = collect($indexes)->groupBy('tablename');

            foreach ($tableIndexes as $tableName => $tableIndexList) {
                $this->info("   📄 {$tableName}:");
                foreach ($tableIndexList as $index) {
                    $this->info("      - {$index->indexname}");
                }
            }
        } catch (\Exception $e) {
            $this->warn('   ⚠️  Could not analyze existing indexes: '.$e->getMessage());
        }
    }

    private function recommendDatabaseIndexes(): void
    {
        $this->info('\n💡 Database Index Recommendations:');

        $recommendations = [
            'catalyst_tallies' => [
                'context_id' => 'Speeds up fund-based filtering',
                '(context_id, tally)' => 'Composite index for sorting by votes within fund',
                'model_id' => 'Speeds up joins with proposals',
                '(context_id, model_id)' => 'Composite for fund + proposal lookups',
            ],
            'proposals' => [
                'campaign_id' => 'Speeds up campaign filtering',
                'fund_id' => 'Speeds up fund-based queries',
                'title' => 'Speeds up text search (consider GIN index for ILIKE)',
                '(fund_id, campaign_id)' => 'Composite for common filtering',
            ],
            'metas' => [
                '(metable_type, metable_id, key)' => 'Essential for metadata lookups',
                'key' => 'Speeds up filtering by metadata key',
            ],
            'campaigns' => [
                'title' => 'Speeds up campaign name search',
            ],
        ];

        foreach ($recommendations as $table => $indexes) {
            $this->info("\n   📊 {$table}:");
            foreach ($indexes as $index => $description) {
                $this->info("      CREATE INDEX idx_{$table}_{$index} ON {$table} ({$index});");
                $this->line("         Purpose: {$description}");
            }
        }

        $this->info('\n🎯 High Priority Recommendations:');
        $this->warn('   1. CREATE INDEX idx_catalyst_tallies_context_id ON catalyst_tallies (context_id);');
        $this->warn('   2. CREATE INDEX idx_catalyst_tallies_context_tally ON catalyst_tallies (context_id, tally DESC);');
        $this->warn('   3. CREATE INDEX idx_metas_lookup ON metas (metable_type, metable_id, key);');
        $this->warn('   4. CREATE INDEX idx_proposals_title_gin ON proposals USING gin (title gin_trgm_ops);');
    }

    private function showUsage(): void
    {
        $this->info('\nUsage examples:');
        $this->line('  php artisan optimize:tallies-query --analyze');
        $this->line('  php artisan optimize:tallies-query --recommend-indexes');
        $this->line('  php artisan optimize:tallies-query --clear-cache');
        $this->line('  php artisan optimize:tallies-query --analyze --recommend-indexes --clear-cache');
    }
}
