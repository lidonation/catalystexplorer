<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Meta;
use App\Models\Nft;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Lidonation\CardanoNftMaker\DTO\MetadataUpload;
use Saloon\Exceptions\Request\FatalRequestException;
use Saloon\Exceptions\Request\RequestException;

class SyncNftWithNMKRJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $nftMakerService;

    public function __construct(
        protected Nft $nft,
        protected ?string $projectUid = null,
        protected ?string $nftImage = null,
        protected bool $forceUpdate = false
    ) {}

    /**
     * Execute the job.
     *
     * @throws \Exception
     */
    public function handle(): void
    {
        if ($this->forceUpdate) {
            $this->deleteExistingNft();
        }

        try {
            $this->createNFT($this->nft);
        } catch (\JsonException|FatalRequestException|RequestException $e) {
            Log::error($e->getResponse()?->body());

            return;
            // throw new \Exception($e->getResponse()?->body());
        }
    }

    public function checkNFTExistsByNameInProjects(Nft $nft): bool
    {
        // Fetch the nftUid from the Metas table associated with the Nft model
        $uidMeta = $nft->metas()->where('key', 'nmkr_nftuid')->first();

        if ($uidMeta instanceof Meta) {
            $response = $nft->getNMKRNftMetadata()->json();

            if (isset($response['resultState']) && $response['resultState'] === 'Error' && $response['errorCode'] === 404) {
                return false;
            } else {
                return true;
            }
        }

        return false;
    }

    /**
     * @throws FatalRequestException
     * @throws RequestException
     * @throws \JsonException
     */
    public function createNft(Nft $nft): void
    {
        if ($this->projectUid) {
            $this->nft->saveMeta('nmkr_project_uid', $this->projectUid, null, true);
        } else {
            $this->projectUid = $this->nft->meta_info?->nmkr_project_uid;
        }

        if (! $this->projectUid) {
            throw ValidationException::withMessages([
                'nmkr_project_uid' => 'NMKR Project ID required.',
            ]);
        }

        $previewImageNft = [
            'mimetype' => 'image/png',
        ];

        if ($this->nftImage) {
            $previewImageNft['fileFromBase64'] = $this->nftImage;
        } else {
            $previewImageNft['fileFromsUrl'] = $nft->preview_link;
        }

        $metadataPlaceholder = collect($nft->metadata)->map(function ($value, $key) {
            return [
                'name' => Str::snake($key),
                'value' => is_array($value) ? json_encode($value) : (string) $value,
            ];
        })->values()->toArray();

        $metadata = [
            'tokenname' => str_replace(' ', '', $nft->name),
            'displayname' => "Project Catalyst Completion NFT: {$nft->metadata['Funded Project Number']}",
            'description' => $nft->description,
            'previewImageNft' => $previewImageNft,
            'metadataPlaceholder' => $metadataPlaceholder,
        ];

        $req = $this->nft->uploadNMKRNft(MetadataUpload::from($metadata));

        $response = $req->json();
        $metadata = json_decode($response['metadata'], true);
        $policy = $metadata ? array_key_first($metadata[721]) : null;

        $this->nft->saveMeta('nmkr_nftuid', $response['nftUid'], null, true);

        $this->nft->update([
            'policy' => $policy,
        ]);

        $this->nft->refresh();

        // save meta data
        if ($metadata) {
            $metadata = $this->saveMetaDataToNMKR(
                $this->prepNftPayloadForMainnet($metadata, $nft)
            );
            $this->nft->saveMeta('nmkr_metadata', $metadata, null, true);
        }

    }

    private function deleteExistingNft()
    {
        // Fetching the nftUid from the Metas table associated with the Nft model
        $uidMeta = $this->nft->metas()->where('key', 'nmkr_nftuid')->first();
        $metadata = $this->nft->metas()->where('key', 'nmkr_metadata')->first();

        if ($uidMeta instanceof Meta) {
            $response = $this->nft->deleteNMKRNft();

            if ($response->successful()) {
                $uidMeta->delete();
                $metadata->delete();
            }

            return $response;
        }
    }

    private function prepNftPayloadForMainnet(array $metadata, Nft $nft): array
    {
        $lidoMeta = $metadata[721][$nft->policy][$nft->name];
        $lidoMeta = array_filter($lidoMeta, fn ($value) => ! empty($value));

        // add custom static metadata
        $lidoMeta['web contact'] = [
            'twitter' => 'https://x.com/LidoNation',
            'discord' => 'https://discordapp.com/users/773283315909132320',
            'website' => 'https://www.catalystexplorer.com',
        ];
        $metadata[721][$nft->policy][$nft->name] = $lidoMeta;

        return $metadata;
    }

    private function saveMetaDataToNMKR(array $metadata): string
    {
        $req = $this->nft->updateNMKRNft($metadata);

        return $req->json('metadata');
    }
}
