<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class VoterHistory extends Model
{
    use SoftDeletes, Searchable;

    public $guarded = [];

    public $table = 'voter_history';

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index App\\\\Models\\\\VoterHistory cx_voter_history');
    }

    public static function getFilterableAttributes() : array
    {
        return [
            'choice',
        ];
    }

    public static function getSearchableAttributes() : array
    {
        return [
            'stake_address',
            'fragment_id',
            'caster',
            'raw_fragment',
        ];
    }

    public static function getSortableAttributes() : array
    {
        return [
            'time',
            // 'voting'
        ];
    }
    

    public function scopeFilter(Builder $query, array $filters) : Builder
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

    public function toSearchableArray(): array
    {
        return [
            'stake_address' => $this->stake_address,
            'fragment_id' => $this->fragment_id,
            'caster' => $this->caster,
            'raw_fragment' => $this->raw_fragment,
            'proposal' => $this->proposal,
            'choice' => $this->choice,
            'time' => $this->time,
            'snapshot_id' => $this->snapshot_id,
        ];
    }

    public function voter(): HasOne
    {
        return $this->hasOne(Voter::class, 'cat_id', 'caster');
    }
}
