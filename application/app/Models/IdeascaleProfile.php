<?php declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;

class IdeascaleProfile extends Model
{
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
