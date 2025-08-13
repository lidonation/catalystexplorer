<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasAuthor;
use App\Traits\HasLinks;
use App\Traits\HasMetaData;
use App\Traits\HasModel;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;
use Lidonation\CardanoNftMaker\Interfaces\CardanoNftInterface;
use Lidonation\CardanoNftMaker\Traits\NftServiceTrait;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Nft extends Model implements CardanoNftInterface, HasMedia
{
    use HasAuthor, HasLinks, HasMetaData, HasModel, HasTranslations, HasUuids, InteractsWithMedia, NftServiceTrait, SoftDeletes;

    protected $hidden = ['artist_id', 'deleted_at', 'model_type', 'model_id'];

    protected $guarded = [];

    public array $translatable = [
        'name',
        'description',
    ];

    // Add appended attributes needed by NftServiceTrait
    protected $appends = [
        'maker_project_uuid',
        'maker_nft_uuid',
        // 'required_nft_metadata',
        'preview_img_url',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'metadata' => AsArrayObject::class,
            'minted_at' => 'date:Y-m-d',
            'created_at' => 'datetime:Y-m-d',
            'updated_at' => 'datetime:Y-m-d',
        ];
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('preview')->singleFile();
    }

    /**
     * Get the NFT's maker project UUID
     */
    protected function makerProjectUuid(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_info->nmkr_project_uid ?? config('cardano-nft-maker-laravel.project_uuid', '')
        );
    }

    /**
     * Get the NFT's maker NFT UUID
     */
    protected function makerNftUuid(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_info->nmkr_nftuid ?? null
        );
    }

    /**
     * Get the NFT's preview image URL from media relationship
     */
    protected function previewImgUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getFirstMediaUrl('preview') ?? $this->preview_link ?? $this->storage_link
        );
    }

    /**
     * Legacy accessor (deprecated, use previewImgUrl instead)
     */
    protected function previewLink(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? $this->preview_img_url
        );
    }

    public function artist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'artist_id');
    }

    public function ideascale_profile(): BelongsTo
    {
        return $this->belongsTo(IdeascaleProfile::class, 'model_id');
    }

    public function txs(): HasMany
    {
        return $this->hasMany(Tx::class, 'model_id')->where('model_type', static::class);
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnails')
            ->width(180)
            ->height(180)
            ->withResponsiveImages()
            ->crop(180, 180, CropPosition::Center)
            ->performOnCollections('preview');

        $this->addMediaConversion('medium')
            ->width(600)
            ->height(600)
            ->crop(600, 600, CropPosition::Center)
            ->withResponsiveImages()
            ->performOnCollections('preview');

        $this->addMediaConversion('large')
            ->width(1200)
            ->withResponsiveImages()
            ->performOnCollections('preview');
    }

    /**
     * Get only the required NFT metadata fields.
     */
    protected function requiredNftMetadata(): Attribute
    {
        return Attribute::make(
            get: function () {
                try {
                    $response = $this->getNMKRNftMetadata();
                    $nftData = $response->json();

                    if ($nftData) {
                        return [
                            'paymentGatewayLinkForSpecificSale' => $nftData['paymentGatewayLinkForSpecificSale'] ?? null,
                            'state' => $nftData['state'] ?? null,
                            'policyid' => $nftData['policyid'] ?? null,
                            'assetname' => $nftData['assetname'] ?? null,
                            'fingerprint' => $nftData['fingerprint'] ?? null,
                            'reserveduntil' => $nftData['reserveduntil'] ?? null,
                        ];
                    }

                    return [
                        'paymentGatewayLinkForSpecificSale' => $this->maker_nft_uuid
                            ? "https://pay.preprod.nmkr.io/?p={$this->maker_project_uuid}&n={$this->maker_nft_uuid}"
                            : null,
                        'state' => $this->minted_at ? 'sold' : 'free',
                        'policyid' => $this->policy ?? null,
                        'assetname' => $this->assetname ?? ($this->metadata['assetname'] ?? null),
                        'fingerprint' => $this->fingerprint ?? ($this->metadata['fingerprint'] ?? null),
                        'reserveduntil' => $this->reserveduntil ?? ($this->metadata['reserveduntil'] ?? null) ?? null,
                    ];
                } catch (\Throwable $th) {
                    Log::error('Error getting required NFT metadata: '.$th->getMessage(), [
                        'nft_id' => $this->id,
                        'exception' => $th,
                    ]);

                    return [
                        'paymentGatewayLinkForSpecificSale' => null,
                        'state' => null,
                        'policyid' => null,
                        'assetname' => null,
                        'fingerprint' => null,
                        'reserveduntil' => null,
                    ];
                }
            }
        );
    }
}
