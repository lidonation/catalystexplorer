<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencies;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Proposal extends Model
{
    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class,
            'currency' => CatalystCurrencies::class,
        ];
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_id', 'id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id', 'id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(IdeascaleProfile::class, 'user_id', 'id', 'author');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class,'ideascale_profile_has_proposal', 'proposal_id', 'ideascale_profile_id');
    }
}
