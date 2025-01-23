<?php

declare(strict_types=1);

namespace App\Models;

use App\Models;

class Link extends Model
{

    public array $translatable = [
        'title',
        'label',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['link', 'status', 'label', 'title', 'valid'];

    public static function runCustomIndex(): void
    {
        Artisan::call('ln:index App\\\\Models\\\\Link ln__links');
    }

    public function model(): MorphTo
    {
        return $this->morphTo('model_link', 'model_type', 'model_id');
    }
}
