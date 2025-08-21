<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalystDrepUser extends Model
{
    use HasUuids;

    /**
     * The table associated with the model.
     */
    protected $table = 'catalyst_drep_user';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'catalyst_drep_id',
        'user_id',
        'catalyst_drep_stake_address',
        'user_stake_address',
    ];

    /**
     * Get the catalyst drep that owns the delegation.
     */
    public function catalystDrep(): BelongsTo
    {
        return $this->belongsTo(CatalystDrep::class, 'catalyst_drep_id');
    }

    /**
     * Get the user that owns the delegation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
