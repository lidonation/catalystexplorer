<?php

declare(strict_types=1);

namespace App\Models;

class ModelSignature extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = null;

    public $guarded = [];

    public $table = 'model_signature';
}
