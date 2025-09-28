<?php

declare(strict_types=1);

namespace App\Models;

use App\Interfaces\IHasMetaData;
use App\Traits\HasMetaData;
use App\Traits\HasModel;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CatalystTally extends Model implements IHasMetaData
{
    use HasMetaData, HasModel;

    public $timestamps = false;

    protected $fillable = [
        'hash',
        'tally',
        'model_type',
        'model_id',
        'context_id',
    ];

    protected $appends = [
        'category_rank',
        'fund_rank',
        'chance',
    ];

    public function categoryRank(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_info?->category_rank
        );
    }

    public function FundRank(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_info?->fund_rank
        );
    }

    public function chance(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_info?->chance
        );
    }

    protected function casts(): array
    {
        return [
            'id' => 'string',
            'model_id' => 'string',
            'context_id' => 'string',
            'tally' => 'integer',
            'updated_at' => 'datetime',
        ];
    }

    public function proposal(): HasOne
    {
        return $this->hasOne(Proposal::class, 'id', 'model_id');
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'context_id', 'id');
    }
}
