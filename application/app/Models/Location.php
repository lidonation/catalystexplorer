<?php

namespace App\Models;

use App\Traits\HasModel;
use Database\Factories\LocationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    /** @use HasFactory<LocationFactory> */
    use HasFactory;

    use HasModel;
}
