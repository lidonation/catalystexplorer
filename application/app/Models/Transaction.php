<?php

declare(strict_types=1);

namespace App\Models;

use App\Interfaces\IHasMetaData;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class Transaction extends Model implements IHasMetaData
{
    use HasMetaData, Searchable;

    public $timestamps = false;

    protected $fillable = [
        'tx_hash',
        'epoch',
        'block',
        'stake_pub',
        'stake_key',
        'json_metadata',
        'raw_metadata',
        'inputs',
        'outputs',
        'type',
        'created_at',
    ];

    public static function getSearchableAttributes(): array
    {
        return [
            'tx_hash',
            'epoch',
            'block',
            'type',
            'inputs.address',
            'outputs.address',
            'json_metadata.txType',
            'json_metadata.stake_key',
            'json_metadata.voter_delegations.voting_key',
            'json_metadata.voter_delegations.votePublicKey',
            'json_metadata.voter_delegations.catId',
        ];
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'epoch',
            'block',
            'type',
            'stake_key',
            'json_metadata.txType',
            'json_metadata.stake_key',
            'inputs.address',
            'outputs.address',
            'outputs.amount.unit',
            'created_at',
            'metadata_labels',
            'transaction_date',
            'json_metadata.voter_delegations.catId',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'epoch',
            'created_at',
            'block',
            'json_metadata.voter_delegations.weight',
        ];
    }

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index', [
            'model' => Transaction::class,
            'name' => 'cx_transactions',
        ]);
    }

    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        $inputs = collect($this->inputs)->map(function ($input) {
            return $input;
        });

        $outputs = collect($this->outputs)->map(function ($output) {
            return $output;
        });

        $totalLovelace = collect($this->outputs)->sum(function ($output) {
            $lovelace = collect($output['amount'] ?? [])->firstWhere('unit', 'lovelace');

            return $lovelace ? (int) $lovelace['quantity'] : 0;
        });

        return array_merge($array, [
            'inputs' => $inputs->toArray(),
            'outputs' => $outputs->toArray(),
            'type' => $this->type ?? ($this->json_metadata->txType ?? 'unknown'),
            'transaction_date' => $this->created_at?->format('Y-m-d'),
            'total_output' => $totalLovelace,
        ]);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('tx_hash', 'like', "%{$search}%")
                    ->orWhere('epoch', 'like', "%{$search}%")
                    ->orWhere('block', 'like', "%{$search}%");
            });
        })->when($filters['type'] ?? null, function ($query, $type) {
            $query->where('type', $type);
        })->when($filters['epoch'] ?? null, function ($query, $epoch) {
            if (is_array($epoch) && count($epoch) === 2) {
                $query->whereBetween('epoch', $epoch);
            } else {
                $query->where('epoch', $epoch);
            }
        });

        return $query;
    }

    /**
     * Get the signature associated with this transaction's stake key.
     */
    public function signature()
    {
        return $this->belongsTo(Signatures::class, 'stake_key', 'stake_key');
    }

    public function registration()
    {
        return $this->belongsTo(Registration::class, 'stake_key', 'stake_key');
    }

    public function voter()
    {
        return $this->belongsTo(Voter::class, 'stake_key', 'stake_pub');
    }

    protected function casts(): array
    {
        return [
            'json_metadata' => 'object',
            'raw_metadata' => 'object',
            'inputs' => 'array',
            'outputs' => 'array',
            'created_at' => 'datetime',
        ];
    }
}