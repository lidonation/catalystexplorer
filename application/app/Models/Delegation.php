<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Registration;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delegation extends Model
{
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }
}
