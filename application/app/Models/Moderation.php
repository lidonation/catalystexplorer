<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Moderation extends Model
{
    use HasMetaData, SoftDeletes;

    protected $guarded = [];

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(Moderator::class);
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'context_id');
    }
}
