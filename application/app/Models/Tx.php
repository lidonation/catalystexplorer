<?php

namespace App\Models;

use App\Models\Traits\HasAuthor;
use App\Models\Traits\HasModel;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tx extends Model
{
    use HasAuthor, HasFactory, HasModel;

    protected $hidden = ['user_id', 'deleted_at', 'model_type', 'model_id'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'metadata' => AsArrayObject::class,
            'minted_at' => 'datetime:Y-m-d',
            'created_at' => 'datetime:Y-m-d',
            'updated_at' => 'datetime:Y-m-d',
        ];
    }
}
