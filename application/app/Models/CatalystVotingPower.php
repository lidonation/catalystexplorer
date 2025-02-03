<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalystVotingPower extends Model
{
    protected $fillable = ['catalyst_snapshot_id', 'delegate', 'voting_power', 'voter_id', 'consumed', 'votes_cast'];

    public function snapshot()
    {
        return $this->belongsTo(CatalystSnapshot::class, 'catalyst_snapshot_id');
    }

    public function voter(): BelongsTo
    {
        return $this->belongsTo(Voter::class, 'voter_id');
    }
}
