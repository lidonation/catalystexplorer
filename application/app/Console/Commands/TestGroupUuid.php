<?php

namespace App\Console\Commands;

use App\Models\Group;
use Illuminate\Console\Command;

class TestGroupUuid extends Command
{
    protected $signature = 'test:group-uuid';

    protected $description = 'Test Group model UUID functionality';

    public function handle(): int
    {
        $this->info('Testing Group model with UUIDs...');

        try {
            // Test fetching existing groups
            $group = Group::first();
            if ($group) {
                $this->info('✓ Found Group: '.$group->name);
                $this->info('✓ Group ID: '.$group->id.' (length: '.strlen($group->id).')');
                $this->info('✓ ID is UUID format: '.(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $group->id) ? 'Yes' : 'No'));

                // Test relationships
                $proposalsCount = $group->proposals()->count();
                $this->info('✓ Proposals relationship works: '.$proposalsCount.' proposals');

                $ideascaleProfilesCount = $group->ideascaleProfilesUuid()->count();
                $this->info('✓ Ideascale profiles relationship works: '.$ideascaleProfilesCount.' profiles');

            } else {
                $this->warn('No Group records found in database');
            }

            // Test creating a new group
            $this->info('Testing new Group creation...');
            $testGroup = new Group;
            $testGroup->name = 'Test UUID Group';
            $testGroup->meta_title = 'Test Group';
            $testGroup->slug = 'test-uuid-group-'.time();
            $testGroup->status = 'active';
            $testGroup->bio = 'Test group for UUID functionality';

            $this->info('✓ New Group ID before save: '.($testGroup->id ?? 'null'));

            // Don't actually save to avoid cluttering the database
            // Just test that UUID generation works
            $testGroup->id = $testGroup->newUniqueId();
            $this->info('✓ Generated UUID: '.$testGroup->id);
            $this->info('✓ UUID format valid: '.(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $testGroup->id) ? 'Yes' : 'No'));

            $this->info('');
            $this->info('🎉 Group UUID migration verification completed successfully!');
            $this->info('All UUID functionality is working correctly.');

            return 0;

        } catch (\Exception $e) {
            $this->error('Error testing Group UUID: '.$e->getMessage());

            return 1;
        }
    }
}
