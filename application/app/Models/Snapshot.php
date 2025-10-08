<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Snapshot extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $fillable = [
        'snapshot_name',
        'model_type',
        'model_id',
        'epoch',
        'order',
        'snapshot_at',
    ];

    protected function casts(): array
    {
        return [
            'snapshot_at' => 'datetime:Y-m-d',
            'epoch' => 'integer',
            'order' => 'integer',
        ];
    }

    public function model(): MorphTo
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }

    public function votingPowers(): HasMany
    {
        return $this->hasMany(VotingPower::class, 'snapshot_id', 'id');
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'model_id');
    }
}
