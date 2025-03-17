<?php

declare(strict_types=1);

namespace App\Models;

class CatalystTransaction extends Model
{
    protected $table = 'CatalystTransaction';

    protected $connection = 'pgsql_carp';

    protected $fillable = [
        'hash',
        'block_id',
        'tx_index',
        'metadata',
        'is_valid',
        'inputs',
        'outputs',
        'metadata_labels',
    ];

    protected $appends = ['tx_hash'];

    protected function casts()
    {
        return [
            'is_valid' => 'boolean',
        ];
    }

    public function getTxHashAttribute()
    {
        return $this->attributes['hash'] ?? null;
    }
}
