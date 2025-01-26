<?php

declare(strict_types=1);

namespace App\Models;

// use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Artisan;

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
    protected $fillable = ['type', 'link', 'label', 'title', 'status', 'order', 'valid'];

    public static function runCustomIndex(): void
    {
        Artisan::call('ln:index', [
            'model' => 'App\\Models\\Link',
            'table' => 'ln__links',
        ]);
    }

    public function model(): MorphTo
    {
        return $this->morphTo('model_link', 'model_type', 'model_id');
    }
}
