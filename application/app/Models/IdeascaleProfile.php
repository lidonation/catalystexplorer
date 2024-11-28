<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\User;
use App\Casts\DateFormatCast;
use Illuminate\Database\Eloquent\Builder;
use Spatie\MediaLibrary\HasMedia;
use Laravolt\Avatar\Facade as Avatar;
use Spatie\Translatable\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class IdeascaleProfile extends Model implements HasMedia
{
    use  InteractsWithMedia, HasTranslations, Searchable;

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'ideascale_id',
        'username',
        'email',
        'name',
        'bio',
        'created_at',
        'updated_at',
        'twitter',
        'linkedin',
        'discord',
        'ideascale',
        'claimed_by',
        'telegram',
        'title'
    ];

    protected $hidden = [];

    protected $appends = ['profile_photo_url'];

    public array $translatable = [
        'bio',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'name',
            'username',
            'bio',
            'email',
            'proposals',
        ];
    }


    public static function runCustomIndex(): void
    {
        Artisan::call('cx:index App\\\\Models\\\\IdeascaleProfile cx__ideascale_profiles');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when(
            $filters['search'] ?? false,
            fn(Builder $query, $search) => $query
                ->whereAny(['username', 'name'], 'ILIKE', '%' . $search . '%')
        );

        $query->when(
            $filters['ids'] ?? false,
            fn(Builder $query, $ids) => $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids))
        );
    }

    public function toSearchableArray(): array
    {
        $array = $this->toArray();
        $proposals = $this->proposals->map(fn ($p) => array_merge($p->toArray(), [
            'is_co_proposer' => $p->user_id !== $this->id,
            'is_primary_proposer' => $p->user_id == $this->id,
        ]));

        return array_merge($array, [
            'proposals' => $proposals,
            'proposals_completed' =>$this->completed_proposals ?? 0,
            'first_timer' => ($proposals?->map(fn ($p) => ($p['fund_id']))->unique()->count() === 1),
            'proposals_approved' => $proposals->filter(fn ($p) => (bool) $p['funded_at'])?->count() ?? 0,
            'amount_awarded_ada' => $this->amount_awarded_ada,
            'amount_awarded_usd' => intval($this->amount_awarded_usd),
            'co_proposals_count' => intval($this->co_proposals_count),
            'proposals_total_amount_requested' => intval($proposals->filter(fn ($p) => (bool) $p['amount_requested'])?->sum('amount_requested')) ?? 0,
        ]);
    }

    public function amountAwardedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()->whereNotNull('funded_at')
                    ->sum('amount_requested');
            },
        );
    }

    public function amountAwardedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()->whereNotNull('funded_at')
                    ->sum('amount_requested');
            },
        );
    }

    public function proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, 'ideascale_profile_has_proposal', 'ideascale_profile_id', 'proposal_id')
            ->where('type', 'proposal');
    }

    public function completed_proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, 'ideascale_profile_has_proposal', 'ideascale_profile_id', 'proposal_id')
            ->where(['type' => 'proposal', 'status' => 'complete']);
    }

    public function funded_proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, 'ideascale_profile_has_proposal', 'ideascale_profile_id', 'proposal_id')
            ->where('type', 'proposal')
            ->whereNotNull('funded_at');
    }

    public function in_progress_proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, 'ideascale_profile_has_proposal', 'ideascale_profile_id', 'proposal_id')
            ->where(['type' => 'proposal', 'status' => 'in_progress']);
    }

    public function outstanding_proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, 'ideascale_profile_has_proposal', 'ideascale_profile_id', 'proposal_id')
            ->where('type', 'proposal')
            ->whereNotNull('funded_at')
            ->where('status', '!=', 'complete');
    }

    public function own_proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'user_id', 'id')
            ->where('type', 'proposal');
    }

    public function coProposalsCount(): Attribute
    {
        return Attribute::make(get: function () {
            $ownProposalIds = $this->own_proposals->pluck('id');

            return $this->proposals()->whereNotIn('proposals.id', $ownProposalIds)->count();
        });
    }


    public function gravatar(): Attribute
    {
        return Attribute::make(
            get: fn() => Avatar::create($this->username  ?? $this->name ?? 'default')->toGravatar()
        );
    }

    public function profilePhotoUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => count($this->getMedia('profile')) ? $this->getMedia('profile')[0]->getFullUrl() : $this->gravatar
        );
    }

    /**
     * Scope to filter groups
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                ->orWhere('id', 'like', "%{$search}%")
                ->orWhere('meta_title', 'like', "%{$search}%");
            });
        })->when($filters['ids'] ?? null, function ($query, $ids) {
            $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
        });

        return $query;
    }
}
