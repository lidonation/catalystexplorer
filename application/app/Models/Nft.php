<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasAuthor;
use App\Traits\HasMetaData;
use App\Traits\HasModel;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Lidonation\CardanoNftMaker\Interfaces\CardanoNftInterface;
use Lidonation\CardanoNftMaker\Traits\NftServiceTrait;

class Nft extends Model implements CardanoNftInterface, HasLink
{
    use HasAuthor, HasMetaData, HasModel, HasTranslations, NftServiceTrait, SoftDeletes;

    protected $hidden = ['artist_id', 'user_id', 'deleted_at', 'model_type', 'model_id'];

    protected $guarded = [];

    public array $translatable = [
        'name',
        'description',
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

    public function artist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'artist_id');
    }
}
