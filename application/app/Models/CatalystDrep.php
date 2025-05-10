<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\User;
use App\Traits\HasAuthor;
use App\Models\Signatures;
use App\Models\Traits\HasSignatures;
use Illuminate\Database\Eloquent\SoftDeletes;

class CatalystDrep extends Model {

    use SoftDeletes, HasSignatures, HasAuthor;

    public $guarded = [];

}
