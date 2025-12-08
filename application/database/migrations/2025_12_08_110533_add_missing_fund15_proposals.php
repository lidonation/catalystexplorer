<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!app()->environment('production')) {
            \Illuminate\Support\Facades\Log::info('Migration skipped: delete_orphaned_catalyst_document_id_metas only runs in production environment');
            return;
        }

        $fund15Id = '019a9c61-7d7a-7277-b082-bd4137a5a936';

        // Missing proposals data from API
        $missingProposals = [
            [
                'pr_id' => '019a8c5f-3390-7c65-83c8-ddd47b9d8ff9',
                'title' => 'CARDANO EDUCATION FOOTPRINT-FOR 3 NEGLECTED REGIONS IN GHANA',
                'summary' => "How can we bridge the awareness gap about the Cardano blockchain among young people in Ghana's deprived regions, where access to blockchain education remains continously limited?",
                'solution' => "To educate students, young professionals, and youth across Ghana's Central, Eastern, and Western regions on Cardano & blockchain fundamentals,wallets, NFTs, and participation in Project Catalyst.",
                'proposer_name' => 'David A Mensah',
                'funds' => 49000,
                'tags' => 'Education',
            ],
            [
                'pr_id' => '019ac0ad-12d4-70b4-b95f-3b93af21f905',
                'title' => 'X150-Valkyrie: Offline, one-touch & Hydra L2 payments',
                'summary' => "Cardano users face mnemonic attack risks, high L1 fees for micro-payments, and the inability to transact without an internet connection (offline).",
                'solution' => "We will develop an Android wallet running on mainnet featuring mnemonic attack resistance, offline payments (BLE), one-touch (NFC), and Hydra head integration for instant, near-zero fee transactions.",
                'proposer_name' => 'NEX',
                'funds' => 100000,
                'tags' => 'Wallet',
            ],
            [
                'pr_id' => '019ac014-a56a-790e-ae44-1670f02fbfdd',
                'title' => '2,000 SMEs Cardano Business Incubator (WACBI)',
                'summary' => "70% of West African SMEs use manual records, suffering 40% invoice fraud & zero transaction traceability.Cardano's digital tools remain at 0% adoption despite solving these \$2B+ annual business losses",
                'solution' => "10-month program training 2,000 Nigerian SMEs through 6 workshops & 4 masterclasses. Participants adopt Cardano powered digital business tools, driving real business utility and sustainable adoption.",
                'proposer_name' => 'LAZARUS CHRISTIAN CHINAZA',
                'funds' => 58000,
                'tags' => 'Community Outreach',
            ],
        ];

        $now = now();

        foreach ($missingProposals as $proposalData) {
            // Generate UUID for the proposal
            $proposalId = Str::uuid();

            // Create slug from title
            $slug = Str::slug($proposalData['title']);

            // Insert the proposal (with translatable fields as JSON)
            DB::table('proposals')->insert([
                'id' => $proposalId,
                'title' => json_encode(['en' => $proposalData['title']]),
                'slug' => "{$slug}-f15",
                'problem' => json_encode(['en' => $proposalData['summary']]),
                'solution' => json_encode(['en' => $proposalData['solution']]),
                'amount_requested' => $proposalData['funds'],
                'fund_id' => $fund15Id,
                'currency' => 'ADA',
                'status' => 'pending',
                'type' => 'proposal',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Create meta entry for catalyst_document_id
            DB::table('metas')->insert([
                'id' => Str::uuid(),
                'key' => 'catalyst_document_id',
                'content' => $proposalData['pr_id'],
                'model_type' => 'App\\Models\\Proposal',
                'model_id' => $proposalId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Create CatalystProfile and link via proposal_profiles if available
            if (!empty($proposalData['proposer_name'])) {
                $proposerName = $proposalData['proposer_name'];

                // Check if CatalystProfile already exists with this name
                $existingProfile = DB::table('catalyst_profiles')
                    ->where('name', $proposerName)
                    ->first();

                if (!$existingProfile) {
                    // Create new CatalystProfile
                    $profileId = Str::uuid();

                    DB::table('catalyst_profiles')->insert([
                        'id' => $profileId,
                        'name' => $proposerName,
                        'username' => Str::slug($proposerName),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                } else {
                    $profileId = $existingProfile->id;
                }

                // Check if proposal_profile relationship already exists
                $existingRelation = DB::table('proposal_profiles')
                    ->where('proposal_id', $proposalId)
                    ->where('profile_id', $profileId)
                    ->where('profile_type', 'App\\Models\\CatalystProfile')
                    ->first();

                if (!$existingRelation) {
                    // Create proposal_profile relationship
                    DB::table('proposal_profiles')->insert([
                        'id' => Str::uuid(),
                        'proposal_id' => $proposalId,
                        'profile_id' => $profileId,
                        'profile_type' => 'App\\Models\\CatalystProfile',
                    ]);
                }
            }

            // Create Tags and link via model_tag if available
            if (!empty($proposalData['tags'])) {
                // Parse tags (assuming comma-separated or single tag)
                $tagNames = array_map('trim', explode(',', $proposalData['tags']));

                foreach ($tagNames as $tagName) {
                    if (empty($tagName)) continue;

                    // Check if Tag already exists
                    $existingTag = DB::table('tags')
                        ->where('title', $tagName)
                        ->first();

                    if (!$existingTag) {
                        // Create new Tag
                        $tagId = Str::uuid();

                        DB::table('tags')->insert([
                            'id' => $tagId,
                            'title' => $tagName,
                            'slug' => Str::slug($tagName),
                            'type' => 'tag',
                            'status' => 'published',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    } else {
                        $tagId = $existingTag->id;
                    }

                    // Check if model_tag relationship already exists
                    $existingTagRelation = DB::table('model_tag')
                        ->where('model_id', $proposalId)
                        ->where('tag_id', $tagId)
                        ->where('model_type', 'App\\Models\\Proposal')
                        ->first();

                    if (!$existingTagRelation) {
                        // Create model_tag relationship
                        DB::table('model_tag')->insert([
                            'model_id' => $proposalId,
                            'tag_id' => $tagId,
                            'model_type' => 'App\\Models\\Proposal',
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Find proposals by their catalyst_document_id meta entries
        $prIds = [
            '019a8c5f-3390-7c65-83c8-ddd47b9d8ff9',
            '019ac0ad-12d4-70b4-b95f-3b93af21f905',
            '019ac014-a56a-790e-ae44-1670f02fbfdd',
        ];

        // Get proposal IDs from metas table
        $proposalIds = DB::table('metas')
            ->where('key', 'catalyst_document_id')
            ->whereIn('content', $prIds)
            ->pluck('model_id');

        // Remove model_tag relationships for these proposals
        DB::table('model_tag')
            ->whereIn('model_id', $proposalIds)
            ->where('model_type', 'App\\Models\\Proposal')
            ->delete();

        // Remove proposal_profiles relationships for these proposals
        DB::table('proposal_profiles')
            ->whereIn('proposal_id', $proposalIds)
            ->delete();

        // Delete metas for these proposals
        DB::table('metas')
            ->whereIn('model_id', $proposalIds)
            ->where('model_type', 'App\\Models\\Proposal')
            ->delete();

        // Delete the proposals
        DB::table('proposals')
            ->whereIn('id', $proposalIds)
            ->delete();
    }
};
