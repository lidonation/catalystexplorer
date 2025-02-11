<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\HashId;
use App\Traits\HasModel;

class Location extends Model
{
    use HasModel;

    public function casts(): array
    {
        return [
            'id' => HashId::class,
        ];
    }
}
