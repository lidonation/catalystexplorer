<?php

namespace App\Models;

use App\Interfaces\IHasMetaData;
use App\Traits\HasMetaData;
use App\Traits\HasModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CatalystTally extends Model implements IHasMetaData
{
    use HasMetaData, HasModel;

    public $timestamps = false;

    protected $fillable = [
        'hash',
        'tally',
        'model_type',
        'model_id',
        'context_id',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'string',
            'model_id' => 'string',
            'context_id' => 'string',
            'tally' => 'integer',
            'updated_at' => 'datetime',
        ];
    }

    public function proposal(): HasOne
    {
        return $this->hasOne(Proposal::class, 'id', 'model_id');
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'context_id', 'id');
    }
}
