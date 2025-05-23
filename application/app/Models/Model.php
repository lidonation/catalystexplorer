<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasHashId;
use App\Services\HashIdService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel;

class Model extends EloquentModel
{
    protected $hidden = ['id'];

    protected $appends = ['hash'];

    use HasFactory, HasHashId;


}
