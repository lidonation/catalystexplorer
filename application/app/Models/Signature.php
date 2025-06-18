<?php

declare(strict_types=1);

namespace App\Models;

use App\Services\WalletInfoService;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'user_id',
    ];

    /**
     * Append computed attributes to JSON serialization
     *
     * @var array<int, string>
     */
    protected $appends = [
        'wallet_stats',
        'signature_count',
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

    protected function walletStats(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->stake_address) {
                    return [
                        'balance' => 'N/A',
                        'all_time_votes' => 0,
                        'funds_participated' => [],
                        'status' => false,
                        'stakeAddress' => '',
                    ];
                }

                $walletService = app(WalletInfoService::class);

                return $walletService->getWalletStats($this->stake_address);
            }
        );
    }

    protected function signatureCount(): Attribute
    {
        return Attribute::make(
            get: fn () => static::where('stake_address', $this->stake_address)->count()
        );
    }

    protected function formattedWalletProvider(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->wallet_provider ? ucfirst($this->wallet_provider) : 'Unknown'
        );
    }
}
