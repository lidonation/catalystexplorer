<?php

declare(strict_types=1);

namespace App\Models\Pivot;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ClaimedProfile extends Pivot
{
    use HasTimestamps, HasUuids;

    protected $table = 'claimed_profiles';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'claimable_id',
        'claimable_type',
        'claimed_at',
    ];

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    protected $casts = [
        'id' => 'string',
        'claimed_at' => 'datetime',
    ];

    public function claimable(): MorphTo
    {
        return $this->morphTo(
            name: 'claimable',
            type: 'claimable_type',
            id: 'claimable_id',
            ownerKey: 'id'
        );
    }

    /**
     * The user who claimed this profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
