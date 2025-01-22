<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Link extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['type','link','label','title','status','order','valid',];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'valid' => 'boolean',
    ];

    /**
     * Run custom index for the model.
     */
    public static function runCustomIndex(): void
    {
        Artisan::call('ln:index', [
            'model' => 'App\\Models\\Link',
            'index' => 'ln__links',
        ]);
    }

    /**
     * Define the polymorphic relationship.
     */
    public function model(): MorphTo
    {
        return $this->morphTo('model_link', 'model_type', 'model_id');
    }
}
