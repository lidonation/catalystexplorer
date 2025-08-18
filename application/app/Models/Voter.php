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
            get: function () {
                try {
                    return $this->voting_powers()
                        ->get() // Load without the snapshot relationship to avoid UUID/int mismatch
                        ->sortByDesc('created_at')
                        ->first();
                } catch (\Exception $e) {
                    \Log::error('Error loading latest voting power for voter in latestVotingPower', [
                        'voter_id' => $this->id,
                        'error' => $e->getMessage(),
                    ]);

                    return null;
                }
            }
        );
    }

    public function toSearchableArray(): array
    {
        // Safely load relationships with error handling
        $votesCount = 0;
        $votingPowerValue = null;
        $proposalsVotedOn = 0;

        try {
            $votesCount = $this->voting_histories->count();
        } catch (\Exception $e) {
            \Log::error('Error loading voting histories count for voter in toSearchableArray', [
                'voter_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $votingPowerValue = $this->latest_voting_power?->voting_power;
        } catch (\Exception $e) {
            \Log::error('Error loading voting power for voter in toSearchableArray', [
                'voter_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $proposalsVotedOn = $this->voting_histories
                ->pluck('proposals')
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error loading proposals voted on for voter in toSearchableArray', [
                'voter_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        return [
            'id' => $this->id,
            'stake_pub' => $this->stake_pub,
            'stake_key' => $this->stake_key,
            'voting_pub' => $this->voting_pub,
            'voting_key' => $this->voting_key,
            'cat_id' => $this->cat_id,
            'votes_count' => $votesCount,
            'voting_power' => $votingPowerValue,
            'proposals_voted_on' => $proposalsVotedOn,
            'latest_fund' => null, // Disabled until snapshot->fund relationship is fixed
            'created_at' => $this->created_at?->timestamp,
            'updated_at' => $this->updated_at?->timestamp,
            'deleted_at' => $this->deleted_at?->timestamp,
        ];
    }

    public function makeSearchableUsing(Collection $models): Collection
    {
        // Load relationships safely without snapshot to avoid UUID/integer mismatch
        // TODO: Fix voting_powers.snapshot_id UUID/integer mismatch with snapshots.id
        try {
            return $models->load(['voting_histories', 'voting_powers']);
        } catch (\Exception $e) {
            \Log::error('Error in makeSearchableUsing for Voter model', [
                'error' => $e->getMessage(),
            ]);

            // Return models without relationships if loading fails
            return $models;
        }
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
