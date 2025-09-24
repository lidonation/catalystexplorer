<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fund ID mapping from CatalystFunds enum (old numeric ID => new UUID)
        $fundMapping = [
            '95' => '8aee7892-b6b8-4c26-b413-96b16fd1a382', // Fund 2
            '91' => '0dbcc13d-294f-4a0d-b3cf-ed6997babf48', // Fund 3
            '84' => '11bc609d-00ba-4d08-9a81-a902d7c313eb', // Fund 4
            '32' => 'bf4496d8-6472-41ac-ab05-ccdd92960ee0', // Fund 5
            '21' => '00278789-c0ab-4298-9928-31bf35b09e40', // Fund 6
            '58' => '1389b51c-4320-49a6-9385-eb860e7189b9', // Fund 7
            '61' => '2fbb9439-c74a-4c33-ac37-e8a28a9a2e2c', // Fund 8
            '97' => '9031ef94-1d7b-4b29-b921-de73b9dadbce', // Fund 9
            '113' => '4890007c-d31c-4561-870f-14388d6b6d2c', // Fund 10
            '129' => '72c34fba-3665-4dfa-b6b1-ff72c916dc9c', // Fund 11
            '139' => 'e4e8ea34-867e-4f19-aea6-55d83ecb4ecd', // Fund 12
            '146' => 'f7ab84cf-504a-43d7-b2fe-c4acd4113528', // Fund 13
            '147' => 'b77b307e-2e83-4f9d-8be1-ba9f600299f3', // Fund 14
            '0' => '0', // Fund 0
            '1' => '1', // Fund 1
        ];

        // Sample data structure - replace this with actual data loading logic
        // This is a placeholder - you should replace this with the actual data source
        $sampleTallies = [
            // Fund 10 samples
            ['hash' => 'proposal_1', 'tally' => 1234, 'context_id' => '113', 'updated_at' => '2023-09-26 15:38:10'],
            ['hash' => 'proposal_2', 'tally' => 2345, 'context_id' => '113', 'updated_at' => '2023-09-26 15:38:11'],
            
            // Fund 11 samples  
            ['hash' => 'proposal_3', 'tally' => 3456, 'context_id' => '129', 'updated_at' => '2023-09-26 15:38:12'],
            ['hash' => 'proposal_4', 'tally' => 4567, 'context_id' => '129', 'updated_at' => '2023-09-26 15:38:13'],
            
            // Fund 12 samples
            ['hash' => 'proposal_5', 'tally' => 5678, 'context_id' => '139', 'updated_at' => '2023-09-26 15:38:14'],
            ['hash' => 'proposal_6', 'tally' => 6789, 'context_id' => '139', 'updated_at' => '2023-09-26 15:38:15'],
        ];
        
        foreach ($sampleTallies as $tally) {
            // Map context_id using fund mapping
            $contextId = $tally['context_id'];
            if (isset($fundMapping[$contextId])) {
                $contextId = $fundMapping[$contextId];
            }
            
            DB::table('catalyst_tallies')->insert([
                'id' => Str::uuid()->toString(),
                'hash' => $tally['hash'],
                'tally' => $tally['tally'],
                'model_type' => 'App\\Models\\Proposal', // default model type
                'model_id' => Str::uuid()->toString(),
                'context_id' => $contextId,
                'created_at' => $tally['updated_at'],
                'updated_at' => $tally['updated_at'],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('catalyst_tallies')->truncate();
    }
};