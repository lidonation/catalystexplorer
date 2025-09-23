<?php

namespace App\Jobs;

use App\Enums\CatalystFunds;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProposalMetaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    protected array $proposals = [];

    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Getting Proposals');
        $response = Http::get('https://core.projectcatalyst.io/api/v0/proposals');

        $responseData = json_decode($response->body());

        foreach ($responseData as $proposal) {
            if (isset($proposal->proposal_category) && $proposal->proposal_category->category_name === 'Fund14') {
                $this->proposals[] = $proposal;
            }
        }

        foreach ($this->proposals as $proposal) {
            $matchingProposal = Proposal::without(['media', 'metas', 'tags'])
                ->where('fund_id', CatalystFunds::FOURTEEN->value)
                ->where('title->en', $proposal->proposal_title)
                ->first();

            $jsonString = str_replace("'", '"', $proposal?->proposal_files_url);
            $scores = json_decode($jsonString);

            Log::info("Saving metadata for {$matchingProposal->title}");
            if ($matchingProposal) {
                $matchingProposal->saveMeta('chain_proposal_id', $proposal->chain_proposal_id, $matchingProposal, true);
                $matchingProposal->saveMeta('proposal_public_key', $proposal->proposal_public_key, $matchingProposal, true);
                $matchingProposal->saveMeta('projectcatalyst_io_url', $proposal->proposal_url, $matchingProposal, true);
                $matchingProposal->saveMeta('proposal_impact_score', $proposal->proposal_impact_score, $matchingProposal, true);
                $matchingProposal->saveMeta('chain_proposal_index', $proposal->chain_proposal_index, $matchingProposal, true);

                if (isset($scores?->alignment_score)) {
                    $matchingProposal->saveMeta('alignment_score', $scores?->alignment_score, $matchingProposal, true);
                }
                if (isset($scores?->auditability_score)) {
                    $matchingProposal->saveMeta('auditability_score', $scores?->auditability_score, $matchingProposal, true);
                }
                if (isset($scores?->feasibility_score)) {
                    $matchingProposal->saveMeta('feasibility_score', $scores?->feasibility_score, $matchingProposal, true);
                }

                $matchingProposal->save();

                //                CatalystTally::updateOrCreate([
                //                    'hash' => $proposal->chain_proposal_id,
                //                ], [
                //                    'model_id' => $matchingProposal->id,
                //                    'model_type' => Proposal::class,
                //                    'context_id' =>  $matchingProposal?->fund?->parent_id,
                //                    'context_type' => Fund::class
                //                ]);
            } else {
                Log::info('Not Found');
            }
        }
    }
}
