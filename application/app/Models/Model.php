<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasDto;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Support\Facades\Artisan;

class Model extends EloquentModel
{
    protected $hidden = [];

    protected $appends = ['uuid'];

    use HasDto, HasFactory;

    /**
     * Get the UUID attribute, which is the primary key.
     */
    public function getUuidAttribute(): string
    {
        return $this->getKey();
    }

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
