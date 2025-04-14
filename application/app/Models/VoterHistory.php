<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class VoterHistory extends Model
{
    use Searchable, SoftDeletes;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>
     */
    protected $guarded = [];

    /**
     * The attributes that should be appended to arrays.
     *
     * @var array<string>
     */
    protected $appends = [
        'voting_power',
        'fund',
        'hash',
    ];

    /**
     * Get the sortable attributes for the model.
     *
     * @return array<string>
     */
    public static function getSortableAttributes(): array
    {
        return [
            'voting_power',
            'fund',
            'time',
        ];
    }

    public function searchableAs()
    {
        return 'cx_voter_histories';
    }

    /**
     * Get the searchable attributes for the model.
     *
     * @return array<string>
     */
    public static function getSearchableAttributes(): array
    {
        return [
            'stake_address',
            'fragment_id',
            'caster',
            'raw_fragment',
            'fund',
        ];
    }

    /**
     * Get the filterable attributes for the model.
     *
     * @return array<string>
     */
    public static function getFilterableAttributes(): array
    {
        return [
            'choice',
            'fund',
            'stake_address',
            'time',
        ];
    }

    /**
     * Run the custom index for the model.
     */
    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index App\\\\Models\\\\VoterHistory cx_voter_histories');
    }

    /**
     * Scope to filter voter history.
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('stake_address', 'like', "%{$search}%")
                    ->orWhere('fragment_id', 'like', "%{$search}%")
                    ->orWhere('caster', 'like', "%{$search}%")
                    ->orWhere('raw_fragment', 'like', "%{$search}%");
            });
        })->when($filters['ids'] ?? null, function ($query, $ids) {
            $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
        });

        return $query;
    }

    /**
     * Scope to order by voting power.
     */
    public function scopeWithVotingPower(Builder $query, string $direction = 'asc'): Builder
    {
        return $query
            ->select('voter_history.*')
            ->leftJoin('voters', 'voter_history.caster', '=', 'voters.cat_id')
            ->leftJoin('voting_powers', 'voters.id', '=', 'voting_powers.voter_id')
            ->orderByRaw('COALESCE(voting_powers.voting_power, 0) '.$direction);
    }

    /**
     * Get the data to index in Elasticsearch.
     */
    public function toSearchableArray(): array
    {
        $this->loadMissing([
            'voter',
            'voter.voting_powers',
            'voter.voting_powers.snapshot',
            'voter.voting_powers.snapshot.fund',
            'snapshot',
            'snapshot.fund',
        ]);

        $fundData = null;
        if ($this->snapshot && $this->snapshot->isNotEmpty()) {
            $snapshot = $this->snapshot->first();
            if ($snapshot && $snapshot->fund) {
                $fundData = $snapshot->fund->title;
            }
        }

        $votingPower = 0;
        if ($this->voter && $this->voter->voting_powers->isNotEmpty()) {
            $votingPower = (float) $this->voter->voting_powers->first()->voting_power;
        }

        return [
            'id' => $this->id,
            'stake_address' => $this->stake_address,
            'fragment_id' => $this->fragment_id,
            'caster' => $this->caster,
            'raw_fragment' => $this->raw_fragment,
            'proposal' => $this->proposal,
            'choice' => $this->choice,
            'time' => $this->time,
            'snapshot_id' => $this->snapshot_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'voting_power' => $votingPower,
            'fund' => $fundData,
            'hash' => $this->hash,
        ];
    }

    /**
     * Get the voter for this history record.
     */
    public function voter(): BelongsTo
    {
        return $this->belongsTo(Voter::class, 'caster', 'cat_id');
    }

    /**
     * Get the voting power relationship through voter.
     */
    public function voterPower(): HasOneThrough
    {
        return $this->hasOneThrough(
            VotingPower::class,
            Voter::class,
            'cat_id',
            'voter_id',
            'caster',
            'id'
        )->whereRaw('voting_powers.voter_id = voters.id::text');
    }

    /**
     * Get the snapshot.
     */
    public function snapshot(): HasMany
    {
        return $this->hasMany(Snapshot::class, 'id', 'snapshot_id');
    }

    /**
     * Get the fund through snapshot.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function fund()
    {
        return $this->belongsToMany(
            Fund::class,
            'snapshots',
            'id',
            'model_id'
        )->where('snapshots.model_type', Fund::class)
            ->where('snapshots.id', $this->snapshot_id);
    }

    /**
     * Get the voting power attribute.
     */
    public function getVotingPower(): float
    {
        if ($this->relationLoaded('voterPower') && $this->voterPower !== null) {
            return (float) $this->voterPower->voting_power;
        }

        if ($this->relationLoaded('voter') &&
            $this->voter !== null &&
            $this->voter->relationLoaded('voting_powers') &&
            $this->voter->voting_powers->isNotEmpty()) {
            return (float) $this->voter->voting_powers->first()->voting_power;
        }

        if (! $this->relationLoaded('voterPower')) {
            $this->load('voterPower');
            if ($this->voterPower !== null) {
                return (float) $this->voterPower->voting_power;
            }
        }

        return 0;
    }

    /**
     * Get the fund attribute.
     */
    public function getFund()
    {
        if ($this->relationLoaded('snapshot') &&
            $this->snapshot->isNotEmpty() &&
            $this->snapshot->first()->relationLoaded('fund')) {
            $fund = $this->snapshot->first()->fund;

            return $fund ? $fund->title : null;
        }

        if (! $this->relationLoaded('snapshot')) {
            $this->load(['snapshot', 'snapshot.fund']);
            if ($this->snapshot->isNotEmpty()) {
                $snapshot = $this->snapshot->first();
                if ($snapshot && $snapshot->fund) {
                    return $snapshot->fund->title;
                }
            }
        }

        return null;
    }

    /**
     * The model's casts.
     *
     * @var array
     */
    protected function casts(): array
    {
        return [
            // Removed 'time' from datetime casts
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }
}
