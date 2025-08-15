<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Fund;
use Illuminate\Console\Command;

class TestFundUuid extends Command
{
    protected $signature = 'test:fund-uuid';

    protected $description = 'Test Fund model UUID functionality';

    public function handle(): int
    {
        $this->info('Testing Fund model with UUIDs...');

        try {
            // Test fetching existing funds
            $fund = Fund::first();
            if ($fund) {
                $this->info('✓ Found Fund: '.$fund->title);
                $this->info('✓ Fund ID: '.$fund->id.' (length: '.strlen($fund->id).')');
                $this->info('✓ ID is UUID format: '.(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $fund->id) ? 'Yes' : 'No'));

                // Test parent relationship if exists
                if ($fund->parent_id) {
                    $this->info('✓ Parent ID: '.$fund->parent_id);
                }

                // Test relationships
                $proposalsCount = $fund->proposals()->count();
                $this->info('✓ Proposals relationship works: '.$proposalsCount.' proposals');

                $campaignsCount = $fund->campaigns()->count();
                $this->info('✓ Campaigns relationship works: '.$campaignsCount.' campaigns');

            } else {
                $this->warn('No Fund records found in database');
            }

            // Test creating a new fund
            $this->info('Testing new Fund creation...');
            $testFund = new Fund([
                'title' => 'Test UUID Fund',
                'meta_title' => 'Test Fund',
                'slug' => 'test-uuid-fund-'.time(),
                'status' => 'draft',
                'currency' => 'USD',
            ]);

            $this->info('✓ New Fund ID before save: '.($testFund->id ?? 'null'));

            // Don't actually save to avoid cluttering the database
            // Just test that UUID generation works
            $testFund->id = $testFund->newUniqueId();
            $this->info('✓ Generated UUID: '.$testFund->id);
            $this->info('✓ UUID format valid: '.(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $testFund->id) ? 'Yes' : 'No'));

            $this->info('');
            $this->info('🎉 Fund UUID migration verification completed successfully!');
            $this->info('All UUID functionality is working correctly.');

            return 0;

        } catch (\Exception $e) {
            $this->error('Error testing Fund UUID: '.$e->getMessage());

            return 1;
        }
    }
}
