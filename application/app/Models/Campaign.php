<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProposalStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Campaign extends Model implements HasMedia
{
    use InteractsWithMedia,
        SoftDeletes;

    protected $hidden = [
        'id',
        'user_id',
        'fund_id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $withCount = [
        'proposals',
    ];

    protected $with = [
        'media',
    ];

    public function label(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->label ?? $this->title
        );
    }

    public function totalRequested(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->proposals()->sum('amount_requested')
        );
    }

    public function totalAwarded(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->funded_proposals()->sum('amount_requested')
        );
    }

    public function totalDistributed(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->funded_proposals()->sum('amount_received')
        );
    }

    /**
     * Scope to filter groups
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('meta_title', 'ilike', "%{$search}%");
            });
        })->when($filters['ids'] ?? null, function ($query, $ids) {
            $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
        });

        return $query;
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_id', 'id');
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'campaign_id', 'id');
    }

    public function completed_proposals(): HasMany
    {
        return $this->proposals()->where([
            'type' => 'proposal',
            'status' => ProposalStatus::complete()->value,
        ]);
    }

    public function funded_proposals(): HasMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal'])
            ->whereNotNull('funded_at');
    }

    public function unfunded_proposals(): HasMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal'])
            ->whereNull('funded_at');
    }
}
