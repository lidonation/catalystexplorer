<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasAuthor;
use App\Traits\HasModel;
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

class Tx extends Model
{
    use HasAuthor, HasModel;

    protected $hidden = ['user_id', 'deleted_at', 'model_type', 'model_id', 'old_id'];

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
