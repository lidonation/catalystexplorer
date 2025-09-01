<?php

use App\Models\Fund;
use App\Models\Campaign;
use App\Models\Proposal;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Enums\ProposalFundingStatus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\RequestException;
use Illuminate\Database\Migrations\Migration;

use function PHPUnit\Framework\throwException;
use Laravel\Nova\Testing\Browser\Pages\Update;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(
            function () {

                $proposalIds = [
                    21977,
                    22070,
                    12977,
                    20965,
                    21714,
                    9255,
                    13315,
                    12621,
                    2026,
                    21201,
                    21717,
                    13680,
                    13431,
                    21553,
                    14267,
                    20673,
                    20802,
                    21277,
                    21740,
                    21337,
                    21523,
                    21570,
                    21891,
                    21976,
                    22117,
                    21530,
                    13993,
                    22136,
                    21182,
                    13097,
                    21932
                ];

                // update or create proposal

                collect($proposalIds)->each(
                    function ($id) {
                        return $this->createProposal($id);
                    }
                );
            }
        );
    }

    public function  createProposal(int $proposalId)
    {
        $baseUrl = config('services.lido.api_base_url');

        try {
            $response = Http::timeout(10)->get("{$baseUrl}/catalyst-explorer/proposals", [
                'search' => $proposalId,
            ]);

            if (! $response->successful()) {
                throw new RequestException($response);
            }

            $data = $response->json();


            if (! isset($data['data']) || ! is_array($data['data'])) {
                throw new \UnexpectedValueException("Invalid API response structure");
            }

            $proposals = collect($data['data']);
            $proposal = $proposals->firstWhere('id', $proposalId);


            if (! $proposal) {
                return [
                    'error' => "Proposal with ID {$proposalId} not found",
                ];
            }

            $proposal = toFluentDeep($proposal);

            $fund = Fund::where('title', $proposal->fund->label)->first();

            if (! $fund) {
                return [
                    'error' => "Fund  not found",
                ];
            }

            $campaign = Campaign::where('title', $proposal->campaign->label)->first();

            $proposal = Proposal::updateOrCreate(
                [
                    'fund_id' => $fund->id,
                    'slug' => $proposal->slug
                ],
                [
                    'title' => $proposal->title,
                    'status'           => $proposal->status ?? null,
                    'funding_status'   => $proposal->funding_status ?? null,
                    'problem'          => $proposal->problem ?? null,
                    'solution'         => $proposal->solution ?? null,
                    'content'          => $proposal->content ?? null,
                    'amount_requested' => $proposal->amount_requested ?? null,
                    'currency' => $proposal->currency,
                    'amount_received' => $proposal->amount_received,
                    'ideascale_link' => $proposal->ideascale_link,
                    'no_votes_count' => $proposal->no_votes_count,
                    'yes_votes_count' => $proposal->yes_votes_count,
                    'abstain_votes_count' => $proposal->abstain_votes_count,
                    'campaign_id' => $campaign?->id,
                    'type' => 'proposal',
                    'quickPitch' => $proposal->quickPitch,
                    'quickpitch_length' => $proposal->quickpitch_length,
                    'opensource' => $proposal->opensource
                ]
            );
        } catch (\Throwable $e) {
            throw $e;
        }
    }


    public function updateDependancies($newProposal, $oldProposal, $oldValues)
    {
        // authors
        DB::table('proposal_profiles')->where('proposal_id', '=', $oldProposal->id)->update(
            [
                'proposal_id' => $newProposal->id,
            ],

        );

        // metas
        DB::table('metas')->where([
            'model_id' => $oldProposal->id,
            'key' => 'applicant_type'
        ])->update(
            [
                'model_id' => $newProposal->id,
            ],

        );

        $metas = DB::table('metas')
            ->where('model_id', $oldProposal->id)
            ->whereIn('key', ['opensource', 'project_length'])
            ->get();

        foreach ($metas as $meta) {
            DB::table('metas')->insert([
                'model_type' => $meta->model_type,
                'model_id'   => $newProposal->id,
                'key'        => $meta->key,
                'content'      => $meta->content,
            ]);
        }

        // tags
        $tags = DB::table('model_tag')
            ->where([
                'model_type' => $oldProposal->id,
                'model_id'   => 'App\\Models\\Proposal',
            ])
            ->get();

        foreach ($tags as $tag) {
            DB::table('model_tag')->updateOrInsert(
                [
                    'model_id' => $newProposal->id,
                    'tag_id' => $tag->id,
                    'model_type' => 'App\\Models\\Proposal',
                ],
                [
                    'id' => (string) Str::uuid(),
                ]
            );
        }

        $oldProposal->update($oldValues);

        $newProposal->searchable();

        $oldProposal->searchable();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
