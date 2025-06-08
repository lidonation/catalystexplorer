<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Voter;
use Illuminate\Support\Facades\Log;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class VoterRepository extends Repository
{
    public function __construct(Voter $model)
    {
        parent::__construct($model);
    }

    /**
     * Search for voter records
     *
     * @param  string  $term  The search term
     * @param  array  $args  Additional search arguments
     */
    public function search(string $term, array $args = []): Builder
    {
        $isStakeSearch = $args['isStakeSearch'] ?? false;
        $isSecondarySearch = $args['isSecondarySearch'] ?? false;
        $isUnifiedSearch = $args['unifiedSearch'] ?? false;

        unset($args['isStakeSearch']);
        unset($args['isSecondarySearch']);
        unset($args['unifiedSearch']);

        return Voter::Search(
            $term,
            function (Indexes $index, $query) use ($args, $isStakeSearch, $isSecondarySearch, $isUnifiedSearch) {
                $defaultArgs = [
                    'attributesToRetrieve' => [
                        'id',
                        'hash',
                        'stake_pub',
                        'stake_key',
                        'voting_pub',
                        'voting_key',
                        'cat_id',
                        'voting_power',
                        'votes_count',
                        'proposals_voted_on',
                        'latest_fund',
                        'created_at',
                        'updated_at',
                    ],
                    'facets' => [
                        'latest_fund.id',
                        'latest_fund.title',
                        'voting_power',
                        'votes_count',
                        'proposals_voted_on',
                    ],
                ];

                if ($isStakeSearch) {
                    $defaultArgs['attributesToSearchOn'] = ['stake_pub', 'stake_key'];
                } elseif ($isSecondarySearch) {
                    $defaultArgs['attributesToSearchOn'] = ['voting_pub', 'voting_key', 'cat_id'];
                } elseif ($isUnifiedSearch) {
                    $defaultArgs['attributesToSearchOn'] = ['stake_pub', 'stake_key', 'voting_pub', 'voting_key', 'cat_id'];
                }

                $mergedArgs = array_merge($defaultArgs, $args);

                if (isset($mergedArgs['sort']) && is_array($mergedArgs['sort'])) {
                    $this->ensureSortableAttributes($index, $mergedArgs['sort']);
                }

                return $index->search($query, $mergedArgs);
            }
        );
    }

    protected function ensureSortableAttributes(Indexes $index, array $sortItems): void
    {
        try {
            $settings = $index->getSettings();
            $sortableAttributes = $settings['sortableAttributes'] ?? [];
            $needsUpdate = false;

            $requiredSortableFields = [
                'voting_power',
                'votes_count',
                'proposals_voted_on',
            ];

            foreach ($sortItems as $sortItem) {
                foreach ($requiredSortableFields as $field) {
                    if (strpos($sortItem, $field.':') === 0 && ! in_array($field, $sortableAttributes)) {
                        $sortableAttributes[] = $field;
                        $needsUpdate = true;
                    }
                }
            }

            if ($needsUpdate) {
                $index->updateSettings([
                    'sortableAttributes' => $sortableAttributes,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to register sortable attributes: '.$e->getMessage());
        }
    }
}
