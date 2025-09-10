<?php

declare(strict_types=1);

namespace App\Models;

use App\Mail\PasswordResetMail;
use App\Mail\WelcomeEmailMail;
use App\Traits\HasSignatures;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia
{
    use HasFactory, HasRoles, HasSignatures, HasUuids, InteractsWithMedia, MustVerifyEmail, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'bio',
        'short_bio',
        'linkedin',
        'twitter',
        'website',
        'password_updated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['hero_img_url'];

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
            'password_updated_at' => 'datetime',
        ];
    }

    public function gravatar(): Attribute
    {
        $string = $this->name ?? $this->email;

        return Attribute::make(
            get: fn () => "https://api.multiavatar.com/{$string}.png"
        );
    }

    public function heroImgUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => count($this->getMedia('profile')) ? $this->getMedia('profile')[0]->getFullUrl() : $this->gravatar
        );
    }

    public function ideascale_profiles()
    {
        return $this->hasMany(IdeascaleProfile::class, 'claimed_by_uuid', 'id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function nfts()
    {
        return $this->hasMany(Nft::class);
    }

    public function communities(): BelongsToMany
    {
        return $this->belongsToMany(Community::class, 'community_has_users', 'user_id', 'community_id', 'id', 'id');
    }

    public function signatures()
    {
        return $this->hasMany(Signature::class, 'user_id', 'id');
    }

    public function transactions()
    {
        return $this->hasManyThrough(
            Transaction::class,
            Signature::class,
            'user_id',
            'stake_key',
            'id',
            'stake_key'
        );
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

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile')
            ->singleFile();
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function stakeAddress(): Attribute
    {
        return Attribute::make(get: fn () => $this->signatures()?->first()?->stake_address);
    }

    public function votingPower(): Attribute
    {
        return Attribute::make(get: function () {
            $balance = $this->signatures()?->first()?->wallet_balance ?? 0;

            return (float) $balance;
        });
    }
}
