<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MilestonePoasSignoff extends Model
{
    use HasFactory;

    public $timestamps = false;

    public function poas(): BelongsTo
    {
        return $this->belongsTo(MilestonePoas::class, 'milestone_poas_id', 'id');
    }
}