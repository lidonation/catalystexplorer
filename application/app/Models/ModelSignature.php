<?php

declare(strict_types=1);

namespace App\Models;
use Illuminate\Database\Eloquent\Model as EloquentModel;

class ModelSignature extends EloquentModel
{
    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = null;

    public $guarded = [];

    public $table = 'model_signature';
}
