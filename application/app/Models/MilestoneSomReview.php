<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MilestoneSomReview extends Model
{
    public $timestamps = false;

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class, 'milestone_id', 'id');
    }
}
