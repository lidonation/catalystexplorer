<?php

declare(strict_types=1);

namespace App\Models;

use App\Interfaces\IHasMetaData;
use App\Traits\HasMetaData;

class Transaction extends Model implements IHasMetaData
{
    use HasMetaData;

    protected $fillable = [
        'tx_hash',
        'epoch',
        'block',
        'json_metadata',
        'raw_metadata',
        'inputs',
        'outputs',
        'type',
        'created_at',
        'voters_details',
        'total_output',
    ];

    protected function casts(): array
    {
        return [
            'json_metadata' => 'object',
            'raw_metadata' => 'object',
            'inputs' => 'array',
            'outputs' => 'array',
            'voters_details' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
