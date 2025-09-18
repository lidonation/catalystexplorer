<?php

declare(strict_types=1);

namespace App\Models;

class ModelSignature extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'string'; // or 'int', depending on your signature_id type

    protected $primaryKey = 'signature_id';

    public $guarded = [];

    public $table = 'model_signature';
}
