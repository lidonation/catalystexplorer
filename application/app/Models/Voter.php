<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class Voter extends Model
{
    use HasUuids, Searchable;

    protected $with = [];

    protected $appends = [];

    public int $maxValuesPerFacet = 8000;

    public $meiliIndexName = 'cx_voters';

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'stake_pub',
            'stake_key',
            'voting_pub',
            'voting_key',
            'cat_id',
            'voting_power',
            'votes_count',
            'proposals_voted_on',
            'latest_fund.id',
            'latest_fund.title',
            'latest_fund.uuid',
            'created_at',
            'updated_at',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'stake_pub',
            'stake_key',
            'voting_pub',
            'voting_key',
            'cat_id',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'id',
            'voting_power',
            'votes_count',
            'proposals_voted_on',
            'created_at',
            'updated_at',
        ];
    }

    public static function getRankingRules(): array
    {
        return [
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness',
        ];
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'stake_pub', 'stake_pub');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'stake_key', 'stake_pub');
    }

    public function voting_histories(): HasMany
    {
        return $this->hasMany(VoterHistory::class, 'stake_address', 'stake_pub');
    }

    public function voting_powers(): HasMany
    {
        return $this->hasMany(VotingPower::class, 'voter_id', 'cat_id');
    }

    /**
     * Get the value used to index the model.
     */
    public function getScoutKey(): mixed
    {
        return $this->id;
    }

    public function latestVotingPower(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->voting_powers()
                ->with('snapshot') // Temporarily disabled fund relationship
                ->get()
                ->filter(fn ($v) => $v->snapshot)
                ->sortByDesc('created_at')
                ->first()
        );
    }

    public function toSearchableArray(): array
    {
        // Temporarily disable fund relationship access due to UUID migration issue
        // TODO: Fix snapshots.model_id to contain proper UUIDs for Fund references

        return [
            'id' => $this->id,
            'stake_pub' => $this->stake_pub,
            'stake_key' => $this->stake_key,
            'voting_pub' => $this->voting_pub,
            'voting_key' => $this->voting_key,
            'cat_id' => $this->cat_id,
            'votes_count' => $this->voting_histories->count(),
            'voting_power' => $this->latest_voting_power?->voting_power,
            'proposals_voted_on' => $this->voting_histories
                ->pluck('proposals')
                ->count(),
            'latest_fund' => null, // Disabled until snapshot->fund relationship is fixed
            'created_at' => $this->created_at?->timestamp,
            'updated_at' => $this->updated_at?->timestamp,
            'deleted_at' => $this->deleted_at?->timestamp,
        ];
    }

    public function makeSearchableUsing(Collection $models): Collection
    {
        // Temporarily disable fund relationship loading due to UUID migration issue
        // TODO: Fix snapshots.model_id to contain proper UUIDs for Fund references
        return $models->load(['voting_histories.snapshot', 'voting_powers']);
    }

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }
}
