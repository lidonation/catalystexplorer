<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasModel;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class Link extends Model
{
    use HasModel, HasTimestamps, HasUuids, Searchable, SoftDeletes;

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
        Artisan::call('cx:create-search-index', [
            'model' => Link::class,
            'name' => 'cx_links',
        ]);
    }
}
