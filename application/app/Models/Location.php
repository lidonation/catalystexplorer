<?php

declare(strict_types=1);

declare(strict_types=1);

namespace App\Models;

use App\Casts\HashId;
use App\Traits\HasModel;
use Database\Factories\LocationFactory;
// use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\Factories\HasFactory;


class Location extends Model
{
    /** @use HasFactory<LocationFactory> */
    // use HasFactory;

    use HasModel;

    public function casts(): array
    {
        return [
            'id' => HashId::class,
        ];
    }
}
