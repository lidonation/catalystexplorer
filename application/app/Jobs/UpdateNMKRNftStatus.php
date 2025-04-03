<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\StatusEnum;
use App\Models\Nft;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;

class UpdateNMKRNftStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private Collection $nfts;

    private \Illuminate\Support\Collection $NotificationSaleNfts;

    /**
     * Create a new job instance.
     */
    public function __construct(public readonly array $nmkrPayload)
    {
        if (empty($this->nmkrPayload)) {
            return;
        }

        $this->NotificationSaleNfts = collect($this->nmkrPayload['NotificationSaleNfts'])
            ->map(fn ($item) => new Fluent($item));

        $this->nfts = Nft::whereHas('metas', function ($query) {
            $query
                ->where('key', '=', 'nmkr_nftuid')
                ->whereIn('content', $this->NotificationSaleNfts->pluck('NftUid')->toArray());
        })->get();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->nfts->each(function ($nft) {
            if ($nft->meta_info?->nmkr_project_uid !== $this->nmkrPayload['ProjectUid']) {
                Log::info('NMKR-webhook:', ["Nft:{$nft->id} has no project uuid"]);

                return;
            }

            $nftNotification = $this->NotificationSaleNfts->first(
                fn ($notification) => $notification->NftUid == $nft->meta_info?->nmkr_nftuid
            );

            $nft->txs()->create([
                'user_id' => $nft->model->claimed_by_id,
                'model_id' => $nft->id,
                'model_type' => $nft::class,
                'policy' => $nftNotification->PolicyId,
                'txhash' => $this->nmkrPayload['TxHash'],
                'address' => $this->nmkrPayload['ReceiverAddress'],
                'status' => StatusEnum::completed()->value,
                'quantity' => $nftNotification?->Count,
                'metadata' => json_decode($this->nmkrPayload['Metadata'], true),
                'minted_at' => Carbon::parse($this->nmkrPayload['SaleDate']),
            ]);

            $nft->update(['status' => 'minted']);
        });
    }
}
