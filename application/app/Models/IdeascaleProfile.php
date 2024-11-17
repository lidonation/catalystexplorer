<?php declare(strict_types=1);

namespace App\Models;

use App\Models\User;
use Laravolt\Avatar\Facade as Avatar;
use App\Casts\DateFormatCast;
use Illuminate\Database\Eloquent\Casts\Attribute;

class IdeascaleProfile extends User 
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

    protected $appends = ['profile_photo_url'];

    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class
        ];
    }

    public function gravatar(): Attribute
    {
        return Attribute::make(
            get: fn() => Avatar::create($this->username  ?? $this->name ?? 'default')->toGravatar()
        );
    }

    public function profilePhotoUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => count($this->getMedia('profile')) ? $this->getMedia('profile')[0]->getFullUrl() : $this->gravatar
        );
    }

}
