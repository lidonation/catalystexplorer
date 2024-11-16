<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencies;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fund extends Model
{
    protected $casts = [
        'launched_at' => DateFormatCast::class,
        'deleted_at' => DateFormatCast::class,
        'awarded_at' => DateFormatCast::class,
        'currency' => CatalystCurrencies::class
    ];


    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'fund_id', 'id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'fund_id', 'id');
    }
}
