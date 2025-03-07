<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\IdeascaleBaseUrls;
use App\Http\Intergrations\LidoNation\Requests\GetProposalDetails;
use App\Models\Campaign;
use App\Models\Proposal;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Throwable;

class CatalystIdeascaleProposalsSyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 1;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 600;

    /**
     * Create a new job instance.
     */
    public function __construct(public Campaign|int $campaign) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (! $this->campaign instanceof Campaign) {
            $this->campaign = Campaign::find($this->campaign);
        }

        $url = $this->campaign->meta_info?->ideascale_sync_link;

        $page = 0;
        do {
            $request = new GetProposalDetails($url, $page);
            $response = $request->send()->stream()->getContents();
            dd($response);

            // if (! $response->successful() || ! count($response->object()?->data?->content)) {
            //     return;
            // }

            $proposals = $response->object()?->data?->content ?? [];
            foreach ($proposals as $proposal) {
                $p = $this->processProposal($proposal);
                try {
                    dispatch(new CatalystUpdateProposalDetailsJob($p, true));
                } catch (Throwable $th) {
                    report($th);
                }
            }
            $page++;
        } while (count($proposals) > 0);
    }

    protected function processProposal(&$data): Proposal
    {
        $proposal = Proposal::whereRelation('metas', [
            'key' => 'ideascale_id',
            'content' => $data->id,
        ])->first();

        $fundNumber = str_replace('Fund ', '', $this->campaign->fund->title);

        if (! $proposal instanceof Proposal) {
            $proposal = new Proposal;
            $proposal->status = 'pending';
            $proposal->funding_status = 'pending';
            $proposal->campaign_id = $this->campaign?->id;
            $proposal->fund_id = $this->campaign->fund_id;
            $proposal->ideascale_link = IdeascaleBaseUrls::IDEASCALE_IDEA."/{$data->id}";
        }

        $proposal->title = $data->title;
        $proposal->slug = Str::limit(Str::slug($proposal->title), 150, '').'-'.'f'.$fundNumber;
        $proposal->save();

        if (! $proposal->meta_info?->ideascale_id) {
            $proposal->saveMeta('ideascale_id', $data->id);
        }

        return $proposal;
    }
}
