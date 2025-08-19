<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VotingPower extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'snapshot_id',
        'delegate',
        'voting_power',
        'voter_id',
        'consumed',
        'votes_cast',
    ];

    public function uniqueIds(): array
    {
        return ['id'];
    }

    public function snapshot(): BelongsTo
    {
        return $this->belongsTo(Snapshot::class, 'snapshot_id');
    }

    public function voter(): BelongsTo
    {
        return $this->belongsTo(Voter::class, 'voter_id', 'cat_id');
    }
}
