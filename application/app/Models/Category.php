<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Str;

class Category extends Model
{
    /**
     * Primary key will be UUID, not auto-incrementing integer.
     */
    protected $keyType = 'string';
    public $incrementing = false;

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
        'id' => 'string',
        'parent_id' => 'string',
        'is_active' => 'boolean',
        'level' => 'integer',
    ];

    protected $appends = [];

    protected $hidden = [];

    /**
     * Relationships
     */
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

    /**
     * Mutator: auto-generate slug when setting name.
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => [
                'name' => $value,
                'slug' => Str::slug($value),
            ]
        );
    }

    /**
     * Boot method: auto-generate UUID and set hierarchy fields.
     */
    protected static function booted()
    {
        static::creating(function ($category) {
            // Generate UUID if not already set
            if (!$category->id) {
                $category->id = (string) Str::uuid();
            }

            // Determine type and level
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

    /**
     * Scope: only active top-level categories with active children.
     */
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
