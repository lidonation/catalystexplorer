<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Znck\Eloquent\Traits\BelongsToThrough;

class VoterHistory extends Model
{
    use BelongsToThrough, Searchable, SoftDeletes;

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
        'hash',
    ];

    public $meiliIndexName = 'cx_voter_histories';

    /**
     * Get the sortable attributes for the model.
     *
     * @return array<string>
     */
    public static function getSortableAttributes(): array
    {
        return [
            'voting_power',
            'snapshot.fund',
            'time',
            'created_at',
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
            'snapshot.fund',
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
            'snapshot.fund',
            'snapshot.fund.hash',
            'snapshot.fund.title',
            'stake_address',
            'caster',
            'time',
        ];
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
        return array_merge(
            $this->load(['snapshot.fund'])->toArray(),
            ['voting_power' => $this->voting_power->voting_power]
        );
    }

    /**
     * Get the voter for this history record.
     */
    public function voter(): HasOne
    {
        return $this->hasOne(Voter::class, 'cat_id', 'caster');
    }

    public function voting_power(): BelongsTo
    {
        return $this->belongsTo(VotingPower::class, 'caster', 'voter_id');
    }

    /**
     * Get the snapshot.
     */
    public function snapshot(): HasOne
    {
        return $this->hasOne(Snapshot::class, 'id', 'snapshot_id');
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
