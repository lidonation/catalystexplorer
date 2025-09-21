<?php

declare(strict_types=1);

namespace App\Models;

use App\Mail\PasswordResetMail;
use App\Mail\WelcomeEmailMail;
use App\Models\Pivot\ClaimedProfile;
use App\Traits\HasSignatures;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Traits\HasRoles;

/**
 * User Model with Polymorphic Profile Claims
 */
class User extends Authenticatable implements HasMedia
{
    use HasFactory,
        HasRoles,
        HasSignatures,
        HasUuids,
        InteractsWithMedia,
        MustVerifyEmail,
        Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'lang',
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
        'old_id',
    ];

    protected $appends = [
        'hero_img_url',
        'has_claimed_profiles',
        'claimed_profiles_count',
    ];

    protected $with = [];

    public function getKeyType(): string
    {
        return 'string';
    }

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

    public function hasClaimedProfiles(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->claimed_catalyst_profiles()->exists() || $this->claimed_ideascale_profiles()->exists()
        );
    }

    public function claimed_profiles(): HasMany
    {
        return $this->hasMany(ClaimedProfile::class, 'user_id', 'id')
            ->with([
                'claimable',
            ]);
    }

    public function claimed_catalyst_profiles(): BelongsToMany
    {
        return $this->belongsToMany(CatalystProfile::class, 'claimed_profiles', 'user_id', 'claimable_id')
            ->where('claimable_type', CatalystProfile::class);
    }

    public function claimed_ideascale_profiles(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class, 'claimed_profiles', 'user_id', 'claimable_id')
            ->where('claimable_type', IdeascaleProfile::class);
    }

    public function claimedProfileModels(): Attribute
    {
        return Attribute::make(
            get: function () {
                $catalystProfiles = $this->relationLoaded('claimed_catalyst_profiles')
                    ? $this->claimed_catalyst_profiles
                    : $this->claimed_catalyst_profiles()->get();

                $ideascaleProfiles = $this->relationLoaded('claimed_ideascale_profiles')
                    ? $this->claimed_ideascale_profiles
                    : $this->claimed_ideascale_profiles()->get();

                return $catalystProfiles->concat($ideascaleProfiles);
            }
        );
    }

    public function claimedProfilesSummary(): Attribute
    {
        return Attribute::make(
            get: function () {
                $catalystProfiles = $this->relationLoaded('claimed_catalyst_profiles')
                    ? $this->claimed_catalyst_profiles
                    : $this->claimed_catalyst_profiles()->get();

                $ideascaleProfiles = $this->relationLoaded('claimed_ideascale_profiles')
                    ? $this->claimed_ideascale_profiles
                    : $this->claimed_ideascale_profiles()->get();

                $catalystCount = $catalystProfiles->count();
                $ideascaleCount = $ideascaleProfiles->count();
                $total = $catalystCount + $ideascaleCount;

                // Get latest claim date from pivot data
                $latestClaim = null;
                if ($catalystProfiles->isNotEmpty()) {
                    $latestClaim = $catalystProfiles->max('pivot.claimed_at');
                }
                if ($ideascaleProfiles->isNotEmpty()) {
                    $ideaLatest = $ideascaleProfiles->max('pivot.claimed_at');
                    $latestClaim = $latestClaim && $latestClaim > $ideaLatest ? $latestClaim : $ideaLatest;
                }

                return [
                    'total' => $total,
                    'catalyst_count' => $catalystCount,
                    'ideascale_count' => $ideascaleCount,
                    'latest_claim' => $latestClaim,
                    'has_any' => $total > 0,
                    'types' => [
                        'CatalystProfile' => $catalystCount,
                        'IdeascaleProfile' => $ideascaleCount,
                    ],
                ];
            }
        );
    }

    public function catalystProfileModels(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->relationLoaded('claimed_catalyst_profiles')
                    ? $this->claimed_catalyst_profiles
                    : $this->claimed_catalyst_profiles()->get();
            }
        );
    }

    public function ideascaleProfileModels(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->relationLoaded('claimed_ideascale_profiles')
                    ? $this->claimed_ideascale_profiles
                    : $this->claimed_ideascale_profiles()->get();
            }
        );
    }

    public function claimedProfilesCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->claimed_catalyst_profiles()->count() + $this->claimed_ideascale_profiles()->count()
        );
    }

    public function ideascale_profiles(): User|HasMany
    {
        return $this->hasMany(IdeascaleProfile::class, 'claimed_by_uuid', 'id');
    }

    public function reviews(): User|HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function nfts(): User|HasMany
    {
        return $this->hasMany(Nft::class);
    }

    public function communities(): BelongsToMany
    {
        return $this->belongsToMany(Community::class, 'community_has_users', 'user_uuid', 'community_id', 'id', 'id');
    }

    public function signatures(): User|HasMany
    {
        return $this->hasMany(Signature::class, 'user_id', 'id');
    }

    public function transactions(): HasManyThrough|User
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

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get all proposals through claimed profiles via pivot table
     * Returns a query builder that supports pagination and database operations
     * Uses the BelongsToMany relationships for cleaner queries
     */
    public function proposals()
    {
        return Proposal::whereIn('id', function ($query) {
            $query->select('proposal_id')
                ->from('proposal_profiles')
                ->where('profile_type', CatalystProfile::class)
                ->whereIn('profile_id', function ($subQuery) {
                    $subQuery->select('claimable_id')
                        ->from('claimed_profiles')
                        ->where('user_id', $this->id)
                        ->where('claimable_type', CatalystProfile::class);
                });
        })->orWhereIn('id', function ($query) {
            $query->select('proposal_id')
                ->from('proposal_profiles')
                ->where('profile_type', IdeascaleProfile::class)
                ->whereIn('profile_id', function ($subQuery) {
                    $subQuery->select('claimable_id')
                        ->from('claimed_profiles')
                        ->where('user_id', $this->id)
                        ->where('claimable_type', IdeascaleProfile::class);
                });
        });
    }

    /**
     * Get the user's preferred language or default to English
     */
    public function getPreferredLanguage(): string
    {
        return ! empty($this->lang) ? $this->lang : 'en';
    }

    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $resetUrl = url(route('password.reset', [
            'token' => $token,
            'email' => $this->email,
        ]));

        Mail::to($this->email)->send(new PasswordResetMail($this, $resetUrl));
    }

    public function sendWelcomeEmail(): void
    {
        Mail::to($this->email)->send(new WelcomeEmailMail($this));
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
}
