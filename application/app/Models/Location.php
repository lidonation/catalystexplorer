<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasModel;
use Database\Factories\LocationFactory;
// use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\Factories\HasFactory;


class Location extends Model
{
    /** @use HasFactory<LocationFactory> */
    // use HasFactory;

    use HasModel;
}
