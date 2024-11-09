<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IdeascaleProfile extends Model
{
    use HasFactory;

    protected $table = 'ideascale_profiles';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'ideascale_id', 
        'username', 
        'email', 
        'name', 
        'bio', 
        'created_at', 
        'updated_at', 
        'twitter', 
        'linkedin', 
        'discord', 
        'ideascale', 
        'claimed_by', 
        'telegram', 
        'title'
    ];

    protected $hidden = [];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
