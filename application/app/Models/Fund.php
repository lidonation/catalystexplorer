<?php

namespace App\Models;

use App\Casts\DateFormatCast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Fund extends Model
{
    use HasFactory;

    protected $casts = [
        'launched_at' => DateFormatCast::class,
        'deleted_at' => DateFormatCast::class,
        'awarded_at' => DateFormatCast::class,
        'assessment_started_at' =>DateFormatCast::class,
    ];


    protected $fillable = [
        'user_id',
        'title',
        'meta_title',
        'slug',
        'excerpt',
        'comment_prompt',
        'content',
        'amount',
        'status',
        'launched_at',
        'deleted_at',
        'parent_id',
        'awarded_at',
        'color',
        'label',
        'currency',
        'assessment_started_at',
    ];

}
