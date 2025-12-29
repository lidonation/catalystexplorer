<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class ProjectSchedule extends Model
{
    use HasUuids, Searchable;

    protected $guarded = [];

    public $table = 'project_schedules';

    const UPDATED_AT = 'updated_at';

    const CREATED_AT = 'created_at';

    /**
     * Update the model's update timestamp.
     */
    public function touch($attribute = null): bool
    {
        if ($attribute) {
            $this->$attribute = $this->freshTimestamp();
        } else {
            $this->updateTimestamps();
        }

        return $this->save();
    }

    /**
     * Update the creation and update timestamps, but only set updated_at.
     */
    public function updateTimestamps(): void
    {
        $time = $this->freshTimestamp();

        $updatedAtColumn = $this->getUpdatedAtColumn();

        if (! is_null($updatedAtColumn) && ! $this->isDirty($updatedAtColumn)) {
            $this->setUpdatedAt($time);
        }
    }

    public $meiliIndexName = 'cx_project_schedule';

    protected $appends = [
        'on_track',
    ];

    public function completed(): Attribute
    {
        return Attribute::make(get: function () {
            return $this->milestones()
                ->current()
                ->get()
                ->map(
                    fn ($milestones) => $milestones->completed
                )->every(fn ($value) => ($value === true));
        });
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'title',
            'started_at',
            'status',
            'milestone_count',
            'milestone.hash',
            'fund.hash',
            'proposal.users.hash',
            'proposal.project_length',
            'proposal.amount_requested',
            'proposal.amount_received',
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
            'milestones_count',
            'proposal.amount_requested',
            'proposal.project_length',
        ];
    }

    /**
     * Get the index able data array for the model.
     */
    public function toSearchableArray(): array
    {
        $this->loadMissing(['proposal.users', 'fund', 'milestones']);
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
        return $this->hasMany(Milestone::class, 'project_schedule_id', 'id');
    }

    protected function onTrack(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status !== 'paused'
        );
    }
}
