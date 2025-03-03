<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasHashId;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravolt\Avatar\Facade as Avatar;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia
{
    use HasFactory, HasHashId, HasRoles, InteractsWithMedia, MustVerifyEmail, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'id',
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function gravatar(): Attribute
    {
        return Attribute::make(
            get: fn () => Avatar::create($this->email ?? $this->name ?? 'default')->toGravatar()
        );
    }

    public function heroImgUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => count($this->getMedia('profile')) ? $this->getMedia('profile')[0]->getFullUrl() : $this->gravatar
        );
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(150)
            ->height(150)
            ->withResponsiveImages()
            ->crop(150, 150, CropPosition::Top)
            ->performOnCollections('profile');

        $this->addMediaConversion('large')
            ->width(1080)
            ->height(1350)
            ->crop(1080, 1350, CropPosition::Top)
            ->withResponsiveImages()
            ->performOnCollections('profile');
    }
}
