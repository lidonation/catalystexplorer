<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Registration extends EloquentModel
{
    use HasFactory;

    protected $table = 'registrations';

    protected $with = ['delegators'];

    protected $primaryKey = 'id';

    protected $keyType = 'int';

    public $incrementing = true;

    protected $fillable = [
        'tx',
        'stake_pub',
        'stake_key',
    ];

    public function delegators(): HasMany
    {
        return $this->hasMany(Delegation::class, 'registration_id');
    }
}
