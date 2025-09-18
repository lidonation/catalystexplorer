<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VoteEnum;
use App\Traits\HasAuthor;
use App\Traits\HasIpfsFiles;
use App\Traits\HasMetaData;
use App\Traits\HasSignatures;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Spatie\Comments\Models\Concerns\HasComments;

class BookmarkCollection extends Model
{
    use HasAuthor, HasComments, HasIpfsFiles, HasMetaData, HasSignatures, HasUuids, Searchable, SoftDeletes;

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    /**
     * Retrieve the model for a bound value.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        // Ensure UUID is treated as a string parameter
        return $this->where($field ?? $this->getRouteKeyName(), '=', (string) $value)->first();
    }

    protected $withCount = [
        'items',
        'proposals',
        'ideascale_profiles',
        'groups',
        'reviews',
        'communities',
        // Note: comments count is handled manually to avoid UUID comparison issues
    ];

    public $meiliIndexName = 'cx_bookmark_collections';

    protected $appends = ['types_count', 'tinder_direction', 'list_type', 'workflow_params', 'comments_count'];

    /**
     * Remove potentially slow accessors for specific operations like PDF generation
     */
    public function makeHiddenForPdf(): self
    {
        $this->appends = array_diff($this->appends, ['types_count', 'workflow_params', 'comments_count']);

        return $this;
    }

    protected $guarded = [];

    public static function getFilterableAttributes(): array
    {
        return [
            'visibility',
            'list_type',
            'fund_id',
            'user_id',
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
            'comments_count',
            'amount_requested_USD',
            'amount_received_ADA',
            'amount_requested_ADA',
            'amount_received_USD',
        ];
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

    public function commentsCount(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Check if comments relationship is already loaded to avoid N+1 queries
                if ($this->relationLoaded('comments')) {
                    return $this->comments->count();
                }

                // If we have an ID, we can safely query the count
                if ($this->exists && $this->id) {
                    return $this->comments()->count();
                }

                // Default to 0 if model doesn't exist yet
                return 0;
            },
        );
    }

    public function amountRequested(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Return empty array if the model doesn't exist
                if (! $this->exists || ! $this->id) {
                    return [];
                }

                try {
                    // Check if proposals relationship is loaded to avoid N+1 queries
                    if (! $this->relationLoaded('proposals')) {
                        // Skip loading for performance during PDF generation or similar
                        if (in_array('amount_requested', $this->appends ?? [])) {
                            return [];
                        }
                        $this->load('proposals');
                    }

                    return $this->proposals->pluck('model')
                        ->filter() // Filter out null models
                        ->groupBy('currency')
                        ->map(function ($group, $currency) {
                            return [
                                "amount_requested_{$currency}" => $group->sum(fn ($p) => intval($p->amount_requested ?? 0)),
                            ];
                        })
                        ->collapse()->toArray();
                } catch (\Exception $e) {
                    // Return default empty array if there's an error
                    return [];
                }
            }
        );
    }

    public function amountReceived(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Return empty array if the model doesn't exist
                if (! $this->exists || ! $this->id) {
                    return [];
                }

                try {
                    // Check if proposals relationship is loaded to avoid N+1 queries
                    if (! $this->relationLoaded('proposals')) {
                        // Skip loading for performance during PDF generation or similar
                        if (in_array('amount_received', $this->appends ?? [])) {
                            return [];
                        }
                        $this->load('proposals');
                    }

                    return $this->proposals->pluck('model')
                        ->filter() // Filter out null models
                        ->groupBy('currency')
                        ->map(function ($group, $currency) {
                            return [
                                "amount_received_{$currency}" => $group->sum(fn ($p) => intval($p->amount_received ?? 0)),
                            ];
                        })
                        ->collapse()->toArray();
                } catch (\Exception $e) {
                    // Return default empty array if there's an error
                    return [];
                }
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

                if ($hasLeftVotes && ! $hasRightVotes) {
                    return 'left';
                } elseif ($hasRightVotes && ! $hasLeftVotes) {
                    return 'right';
                }
            }
        );
    }

    public function listType(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (is_null($this->fund_id)) {
                    return 'normal';
                }

                if ($this->model_type === \App\Models\TinderCollection::class) {
                    return 'tinder';
                }

                return 'voter';
            }
        );
    }

    public function workflowParams(): Attribute
    {
        return Attribute::make(
            get: function () {
                $listType = $this->list_type;

                switch ($listType) {
                    case 'tinder':
                        if ($this->model_type === \App\Models\TinderCollection::class && $this->model_id) {

                            $tinderCollectionHash = $this->model_id;

                            $relatedCollections = static::where('model_type', \App\Models\TinderCollection::class)
                                ->where('model_id', $tinderCollectionHash)
                                ->get();

                            $leftCollection = $relatedCollections->where('tinder_direction', 'left')->first();
                            $rightCollection = $relatedCollections->where('tinder_direction', 'right')->first();

                            if (! $leftCollection && ! $rightCollection && $relatedCollections->count() >= 2) {
                                $leftCollection = $relatedCollections->first();
                                $rightCollection = $relatedCollections->skip(1)->first();
                            } elseif (! $leftCollection && ! $rightCollection && $relatedCollections->count() === 1) {
                                $currentCollection = $relatedCollections->first();
                                if ($currentCollection->id === $this->id) {
                                    $rightCollection = $currentCollection;
                                }
                            }

                            return [
                                'leftBookmarkCollectionHash' => $leftCollection?->id,
                                'rightBookmarkCollectionHash' => $rightCollection?->id,
                                'tinderCollectionHash' => $tinderCollectionHash,
                            ];
                        }

                        return null;

                    case 'voter':
                    case 'normal':
                        // These workflows use the collection ID directly, no additional params needed
                        return null;

                    default:
                        return null;
                }
            }
        );
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
            ->where('model_type', \App\Models\Proposal::class);
    }

    public function ideascale_profiles(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', \App\Models\IdeascaleProfile::class);
    }

    public function communities(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', \App\Models\Community::class);
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Fund::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', \App\Models\Group::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', \App\Models\Review::class);
    }

    public function contributors(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\User::class, 'bookmark_collections_users')
            ->withTimestamps();
    }

    public function collaborators(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\User::class, 'bookmark_collections_users')
            ->withTimestamps()
            ->with('media'); // Include user media for avatars
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
        return route('lists.view', [
            'bookmarkCollection' => $this->id,
        ]);
    }

    public function toSearchableArray(): array
    {
        $array = $this->load([
            'comments',
            'author',
            'fund',
        ])->toArray();

        $proposals = [];
        $ideascale_profiles = [];
        $reviews = [];
        $groups = [];
        $communities = [];

        try {
            $proposals = $this->proposals->pluck('model')->toArray();
        } catch (\Exception $e) {
            \Log::error('Error loading proposals for bookmark collection in toSearchableArray', [
                'collection_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $ideascale_profiles = $this->ideascale_profiles->pluck('model')->toArray();
        } catch (\Exception $e) {
            \Log::error('Error loading ideascale_profiles for bookmark collection in toSearchableArray', [
                'collection_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $reviews = $this->reviews->pluck('model')->toArray();
        } catch (\Exception $e) {
            \Log::error('Error loading reviews for bookmark collection in toSearchableArray', [
                'collection_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $groups = $this->groups->pluck('model')->toArray();
        } catch (\Exception $e) {
            \Log::error('Error loading groups for bookmark collection in toSearchableArray', [
                'collection_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $communities = $this->communities->pluck('model')->toArray();
        } catch (\Exception $e) {
            \Log::error('Error loading communities for bookmark collection in toSearchableArray', [
                'collection_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $amountReceived = $this->amount_received;
        } catch (\Exception $e) {
            \Log::error('Error calculating amount_received for bookmark collection in toSearchableArray', [
                'collection_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $amountRequested = $this->amount_requested;
        } catch (\Exception $e) {
            \Log::error('Error calculating amount_requested for bookmark collection in toSearchableArray', [
                'collection_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        return array_merge($array, $amountReceived, $amountRequested, [
            'proposals' => $proposals,
            'ideascale_profiles' => $ideascale_profiles,
            'reviews' => $reviews,
            'groups' => $groups,
            'communities' => $communities,
            'rationale' => $this->comments()->where('commentator_id', $this->user_id)->whereJsonContains('extra->type', 'rationale')->latest()->first()?->text,
        ]);
    }
}
