<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use App\Casts\DateFormatCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class
        ];
    }
}
