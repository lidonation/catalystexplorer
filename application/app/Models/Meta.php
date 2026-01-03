<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetaData;
use App\Concerns\HasModel;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;

class Meta extends Model
{
    protected $guarded = [];

    protected $keyType = 'string';

    public $incrementing = false;

    public function uniqueIds(): array
    {
        return [];
    }

    use HasMetaData, HasModel, HasTimestamps;
}
