<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delegation extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    public function uniqueIds(): array
    {
        return ['id'];
    }

    protected $fillable = [
        'registration_id',
        'voting_pub',
        'weight',
        'cat_onchain_id',
    ];

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }
}
