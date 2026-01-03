<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetaData;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Moderation extends Model
{
    use HasMetaData, HasUuids, SoftDeletes;

    protected $guarded = [];

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(Moderator::class);
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Reviewer::class);
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'context_id');
    }
}
