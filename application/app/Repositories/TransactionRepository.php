<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Transaction;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class TransactionRepository extends Repository
{
    public function __construct(Transaction $model)
    {
        parent::__construct($model);
    }

    public function search(?string $term, $args = []): Builder
    {
        return Transaction::search(
            $term,
            function (Indexes $index, $query, $options) use ($args) {
                $attrs = $args['attributesToRetrieve'] ?? null;

                $args['attributesToRetrieve'] = $attrs ?? [
                    'tx_hash',
                    'hash',
                    'epoch',
                    'block',
                    'type',
                    'created_at',
                    'transaction_date',
                    'total_output',
                    'inputs',
                    'outputs',
                    'json_metadata',
                    'metadata_labels',
                    'voters_details',
                ];

                $args['facets'] = [
                    'epoch',
                    'type',
                    'json_metadata.txType',
                    'transaction_date',
                    'metadata_labels',
                ];

                return $index->search($query, $args);
            }
        );
    }
}
