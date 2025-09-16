<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasUuids;

    // protected $keyType = 'int';

    // public $incrementing = true;

    // public function uniqueIds(): array
    // {
    //     return [];
    // }

    protected $fillable = [
        'parent_id',
        'name',
        'description',
        'slug',
        'type',
        'level',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level' => 'integer',
        // 'id' => 'string',
        // 'parent_id' => 'string',

    ];

    protected $appends = [];

    // Self-referential relationships
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function services(): MorphToMany
    {
        return $this->morphToMany(Service::class, 'model', 'service_model');
    }

    // Auto-generate slug
    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => [
                'name' => $value,
                'slug' => Str::slug($value),
            ]
        );
    }

    protected static function booted()
    {
        static::creating(function ($category) {
            if ($category->parent_id) {
                $parent = static::find($category->parent_id);
                $category->level = $parent?->level + 1;
                $category->type = 'subcategory';
            } else {
                $category->level = 0;
                $category->type = 'category';
            }
        });
    }

    public function scopeWithActiveChildren($query)
    {
        return $query->where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->where('is_active', true)
                    ->select('id', 'name', 'parent_id', 'slug');
            }]);
    }
}
