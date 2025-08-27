<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CatalysRoleEnum;
use App\Services\WalletInfoService;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Cache;

class Signature extends Model
{
    use HasMetaData;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'stake_key',
        'signature',
        'stake_address',
        'signature_key',
        'wallet_provider',
        'wallet_name',
        'user_id',
    ];

    protected $casts = [
        'user_id' => 'string', // Cast user_id as string to handle UUIDs
    ];

    /**
     * Append computed attributes to JSON serialization
     *
     * @var array<int, string>
     */
    protected $appends = [
        'display_name',
        'formatted_wallet_provider',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions associated with this signature's stake key.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'stake_key', 'stake_key');
    }

    public function relatedSignatures(): HasMany
    {
        return $this->hasMany(self::class, 'stake_address', 'stake_address');
    }

    public function latestSignature(): HasOne
    {
        return $this->hasOne(self::class, 'stake_address', 'stake_address')
            ->latest('updated_at');
    }

    public function scopeUniqueWallets(Builder $query): Builder
    {
        return $query->select('stake_address')
            ->whereNotNull('stake_address')
            ->where('stake_address', '!=', '')
            ->distinct();
    }

    /**
     * Scope signatures for a given user id (UUID string).
     *
     * @param  string|int  $userId  UUID (or legacy int during migrations)
     */
    public function scopeForUser(Builder $query, string $userId): Builder
    {
        return $query->where('user_id', (string) $userId);
    }

    protected function displayName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->wallet_name ?: ($this->wallet_name ?: 'Unknown')
        );
    }

    protected function formattedWalletProvider(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->wallet_name ? ucfirst($this->wallet_name) : 'Unknown'
        );
    }

    public function catalystProfileRegistration(): Attribute
    {
        return Attribute::make(
            get: function (): ?Transaction {
                return Transaction::where([
                    'stake_pub' => $this->stake_address,
                    'json_metadata->purpose_uuid' => CatalysRoleEnum::CATALYST_USER->value,
                ])->first();
            }
        );
    }

    public function walletBalance(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->walletStats['balance'];
            }
        );
    }

    protected function signatureCount(): Attribute
    {
        return Attribute::make(
            get: function () {
                $cacheKey = "signature_count_{$this->stake_address}";

                return Cache::remember($cacheKey, now()->addHours(2), function () {
                    return self::where('stake_address', $this->stake_address)->count();
                });
            }
        );
    }

    protected function lastUsed(): Attribute
    {
        return Attribute::make(
            get: function () {
                $cacheKey = "last_used_{$this->stake_address}";

                return Cache::remember($cacheKey, now()->addHours(2), function () {
                    return self::where('stake_address', $this->stake_address)
                        ->max('updated_at');
                });
            }
        );
    }

    protected function latestWalletInfo(): Attribute
    {
        return Attribute::make(
            get: function () {
                $cacheKey = "latest_wallet_info_{$this->stake_address}";

                return Cache::remember($cacheKey, now()->addHours(2), function () {
                    return self::where('stake_address', $this->stake_address)
                        ->latest('updated_at')
                        ->select('wallet_provider', 'wallet_name', 'updated_at')
                        ->first();
                });
            }
        );
    }

    protected function walletStats(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->stake_address) {
                    return $this->getDefaultWalletStats();
                }

                $cacheKey = "wallet_stats_{$this->stake_address}";

                return Cache::remember($cacheKey, now()->addHours(2), function () {
                    $walletService = app(WalletInfoService::class);

                    return $walletService->getWalletStats($this->stake_address);
                });
            }
        );
    }

    private function getDefaultWalletStats(): array
    {
        return [
            'balance' => 'N/A',
            'all_time_votes' => 0,
            'funds_participated' => [],
            'payment_addresses' => [],
            'status' => false,
            'stakeAddress' => $this->stake_address ?? '',
            'choice_stats' => [],
        ];
    }
}
