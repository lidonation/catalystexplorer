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

                Proposal::where('fund_id', 'b77b307e-2e83-4f9d-8be1-ba9f600299f3')
                    ->whereNotNull('ideascale_link')
                    ->each(function ($p) {
            
                        $attributes = $p->toArray();
                        unset($attributes['yes_votes_count']);
                        unset($attributes['no_votes_count']);
                        unset($attributes['funded_at']);
                        unset($attributes['amount_received']);
                        unset($attributes['quickpitch']);
                        unset($attributes['abstain_votes_count']);
                        unset($attributes['funding_updated_at']);
                        unset($attributes['ideascale_link']);
                        unset($attributes['metas']);

                        $uuid = (string) Str::uuid();
                        $attributes['id'] = $uuid;

                        dump($p->title);

                        $newProposal = Proposal::create($attributes);

                        $oldValues = $this->getPrevValues($p->old_id);

                        $this->updateDependancies($newProposal, $p, $oldValues);
                    });
            }
        );
    }

    public function  getPrevValues(int $proposalId)
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

            $campaign = Campaign::where('title', $proposal->campaign->label)->first();

            return [
                "status"           => $proposal->status ?? null,
                "funding_status"   => $proposal->funding_status ?? null,
                "slug"             => $proposal->slug ?? null,
                'problem'          => $proposal->problem ?? null,
                'solution'         => $proposal->solution ?? null,
                'content'          => $proposal->content ?? null,
                'amount_requested' => $proposal->amount_requested ?? null,
                'campaign_id' => $campaign?->id,
                'fund_id' => $fund->id,
            ];
        } catch (\Throwable $e) {
            report($e);
            throwException($e);
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
