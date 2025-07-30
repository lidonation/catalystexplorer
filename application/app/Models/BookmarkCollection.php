<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VoteEnum;
use App\Traits\HasAuthor;
use App\Traits\HasHashId;
use App\Traits\HasMetaData;
use App\Traits\HasSignatures;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Spatie\Comments\Models\Concerns\HasComments;

class BookmarkCollection extends Model
{
    use HasAuthor, HasComments, HasHashId, HasMetaData, HasSignatures, Searchable, SoftDeletes;

    protected $withCount = [
        'items',
        'proposals',
        'ideascale_profiles',
        'groups',
        'reviews',
        'communities',
        'comments',
    ];

    public $meiliIndexName = 'cx_bookmark_collections';

    protected $appends = ['types_count', 'hash', 'tinder_direction'];

    protected $guarded = [];

    protected $hidden = ['id'];

    public static function getFilterableAttributes(): array
    {
        return [
            'visibility',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
            'proposals.title',
            'groups.title',
            'communitites.title',
            'ideascale_profiles.name',
            'ideascale_profiles.username',
            'author.name',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'title',
            'updated_at',
            'items_count',
            'amount_requested_USD',
            'amount_received_ADA',
            'amount_requested_ADA',
            'amount_received_USD',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(static::class, 'model_id')
            ->where('model_type', static::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookmarkItem::class);
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', Proposal::class);
    }

    public function ideascale_profiles(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', IdeascaleProfile::class);
    }

    public function communities(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', Community::class);
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(fund::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', Group::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', Review::class);
    }

    public function typesCount(): Attribute
    {
        return Attribute::make(
            get: fn () => (object) [
                'proposals' => $this->proposals_count,
                'groups' => $this->groups_count,
                'communities' => $this->communities_count,
                'reviews' => $this->reviews_count,
                'ideascaleProfiles' => $this->ideascale_profiles_count,
            ],
        );
    }

    public function amountRequested(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals->pluck('model')
                    ->groupBy('currency')
                    ->map(function ($group, $currency) {
                        return [
                            "amount_requested_{$currency}" => $group->sum(fn ($p) => intval($p->amount_requested ?? 0)),
                        ];
                    })
                    ->collapse()->toArray();
            }
        );
    }

    public function amountReceived(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals->pluck('model')
                    ->groupBy('currency')
                    ->map(function ($group, $currency) {
                        return [
                            "amount_received_{$currency}" => $group->sum(fn ($p) => intval($p->amount_received ?? 0)),
                        ];
                    })
                    ->collapse()->toArray();
            }
        );
    }

    public function tinderDirection(): Attribute
    {
        return Attribute::make(
            get: function () {
    
                $itemsWithVotes = $this->items()->whereNotNull('vote')->get();
                
                if ($itemsWithVotes->isEmpty()) {
                    return null;
                }
                
                $hasLeftVotes = $itemsWithVotes->contains('vote', VoteEnum::NO->value);
                $hasRightVotes = $itemsWithVotes->contains('vote', VoteEnum::YES->value);
                
                if ($hasLeftVotes && !$hasRightVotes) {
                    return 'left';
                } elseif ($hasRightVotes && !$hasLeftVotes) {
                    return 'right';
                } 
            }
        );
    }

    /*
    * This string will be used in notifications on what a new comment
    * was made.
    */
    public function commentableName(): string
    {
        return $this->title;
    }

    /*
    * This URL will be used in notifications to let the user know
    * where the comment itself can be read.
    */
    public function commentUrl(): string
    {
        return '';
    }

    public function toSearchableArray(): array
    {
        return array_merge($this->load([
            // 'comments',
            'author',
        ])->toArray(), $this->amount_received, $this->amount_requested, [
            'proposals' => $this->proposals->pluck('model')->toArray(),
            'ideascale_profiles' => $this->ideascale_profiles->pluck('model')->toArray(),
            'reviews' => $this->reviews->pluck('model')->toArray(),
            'groups' => $this->groups->pluck('model')->toArray(),
            'communities' => $this->communities->pluck('model')->toArray(),
            'rationale' => $this->meta_info?->rationale,
        ]);
    }
}
