<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VoterHistory extends Model
{
    use SoftDeletes;

    public $guarded = [];

    public $table = 'voter_history';

    public function voter(): BelongsTo
    {
        return $this->belongsTo(Voter::class, 'cat_id', 'caster');
    }
}
