<?php declare(strict_types=1);

namespace App\Models;

use App\Models\User;
use App\Casts\DateFormatCast;
use Spatie\MediaLibrary\HasMedia;
use Laravolt\Avatar\Facade as Avatar;
use Spatie\Translatable\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Casts\Attribute;

class IdeascaleProfile extends Model implements HasMedia
{
    use  InteractsWithMedia, HasTranslations;

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
