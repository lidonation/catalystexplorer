<?php

declare(strict_types=1);

namespace App\Models;

class CatalystTransaction extends Model
{
    protected $table = 'CatalystTransaction';

    protected $connection = 'pgsql_carp';

    public $timestamps = false;

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

    protected function casts()
    {
        return [
            'is_valid' => 'boolean',
        ];
    }

    public function getMetadataAttribute($value)
    {
        if (is_resource($value)) {
            $content = stream_get_contents($value);
            $decoded = json_decode($content, true);

            try {
                // $decoded = json_decode($content, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $decoded;
                }
            } catch (\Exception $e) {
                // Decoding failed
            }

            return $content;
        }

        return $value;
    }
}
