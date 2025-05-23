<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\HashId;
use App\Traits\HasAuthor;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Comments\Models\Concerns\HasComments;

class BookmarkCollection extends Model
{
    use HasAuthor, HasComments, HasMetaData, SoftDeletes;

    protected $withCount = [
        'items',
        'proposals',
        'ideascale_profiles',
        'groups',
        'reviews',
        'communities',
        'comments',
    ];

    protected $appends = ['types_count', 'hash'];

    // protected $fillable = [
    //     'user_id',
    //     'title',
    //     'content',
    //     'visibility',
    // ];

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'visibility',
        'color',
        'allow_comments',
        'status',
        'type',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(BookmarkCollection::class, 'parent_id');
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

    public function casts(): array
    {
        return [
            // 'id' => HashId::class,
        ];
    }
}
