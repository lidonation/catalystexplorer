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
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Lidonation\CardanoNftMaker\Interfaces\CardanoNftInterface;
use Lidonation\CardanoNftMaker\Traits\NftServiceTrait;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Nft extends Model implements CardanoNftInterface, HasMedia
{
    use HasAuthor, HasLinks, HasMetaData, HasModel, HasTranslations, InteractsWithMedia, NftServiceTrait, SoftDeletes;

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
     * Get the NFT's preview link
     */
    protected function previewLink(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? $this->storage_link
        );
    }

    public function artist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'artist_id');
    }

    public function txs(): HasMany
    {
        return $this->hasMany(Tx::class, 'model_id')->where('model_type', static::class);
    }
}
