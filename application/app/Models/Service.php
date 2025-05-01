<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Service extends Model
{
    use HasRelationships;

    protected $fillable = [
        'title',
        'description',
        'type',
        'user_id',
    ];

    protected $casts = [
        'type' => 'string',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function models(string $modelClass): MorphToMany
    {
        return $this->morphedByMany($modelClass, 'model', 'service_model');
    }
}
