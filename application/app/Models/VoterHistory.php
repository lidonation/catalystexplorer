<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class VoterHistory extends Model
{
    use SoftDeletes;

    public $guarded = [];

    public $table = 'voter_history';

    public function voter(): HasOne
    {
        return $this->hasOne(Voter::class, 'cat_id', 'caster');
    }
}
