<?php

namespace App\Models\CatalystExplorer;

use App\Models\Model;
use App\Models\Review;
use App\Models\Proposal;
use App\Models\Moderator;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Moderation extends Model
{
    use SoftDeletes, HasMetaData;

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
