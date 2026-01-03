<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetaData;
use App\Concerns\HasModel;
use App\Contracts\IHasMetaData;
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
        // New direct ranking and chance columns
        'category_rank',
        'fund_rank',
        'overall_rank',
        'chance_approval',
        'chance_funding',
    ];

    protected $appends = [
        'chance', // Keep for backward compatibility (same as chance_approval)
    ];

    /**
     * @deprecated Use direct column access instead: $tally->category_rank
     * Kept for backward compatibility during migration period
     */
    public function categoryRank(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['category_rank'] ?? $this->meta_info?->category_rank
        );
    }

    /**
     * @deprecated Use direct column access instead: $tally->fund_rank
     * Kept for backward compatibility during migration period
     */
    public function FundRank(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['fund_rank'] ?? $this->meta_info?->fund_rank
        );
    }

    /**
     * Backward compatibility accessor for 'chance' (maps to chance_approval)
     */
    public function chance(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['chance_approval'] ?? $this->meta_info?->chance ?? $this->meta_info?->chance_approval
        );
    }

    /**
     * @deprecated Use direct column access instead: $tally->chance_approval
     * Kept for backward compatibility during migration period
     */
    public function chanceApproval(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['chance_approval'] ?? $this->meta_info?->chance_approval
        );
    }

    /**
     * @deprecated Use direct column access instead: $tally->chance_funding
     * Kept for backward compatibility during migration period
     */
    public function chanceFunding(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['chance_funding'] ?? $this->meta_info?->chance_funding
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
            // New direct columns
            'category_rank' => 'integer',
            'fund_rank' => 'integer',
            'overall_rank' => 'integer',
            'chance_approval' => 'decimal:2',
            'chance_funding' => 'decimal:2',
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
