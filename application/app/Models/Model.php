<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasDto;
use App\Traits\HasHashId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Support\Facades\Artisan;

class Model extends EloquentModel
{
    protected $hidden = ['id'];

    protected $appends = ['hash'];

    use HasDto, HasFactory, HasHashId;

    public static function runCustomIndex()
    {
        $modelInstance = new static;

        if (! isset($modelInstance->meiliIndexName)) {
            return;
        }

        $className = class_basename($modelInstance);

        Artisan::call("cx:create-search-index App\\\\Models\\\\{$className} {$modelInstance->meiliIndexName}");

        $output = Artisan::output();

        return $output;
    }
}
