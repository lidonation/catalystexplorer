<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class ProposalMilestone extends Model
{
    use Searchable;

    public $timestamps = false;

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index App\\\\Models\\\\ProposalMilestone cx_proposal_milestone');
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'title'
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'title',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'title',
        ];
    }

    /**
     * Get the index able data array for the model.
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        return array_merge($array, [
            'on_track' => $this->on_track,
            'proposal' => $this->proposal,
            'fund' => $this->fund,
            'milestones' => $this->milestones->map(fn ($m) => $m->toArray()),
        ]);
    }


    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'id');
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_id', 'id');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class, 'proposal_milestone_id', 'id');
    }

    protected function onTrack(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status !== 'paused'
        );
    }
}
