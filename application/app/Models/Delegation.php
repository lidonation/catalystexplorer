<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delegation extends Model
{
    protected $keyType = 'int';

    public $incrementing = true;

    public function uniqueIds(): array
    {
        return [];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }
}
