<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\VoterHistory;
use Illuminate\Support\Facades\Log;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class VoterHistoryRepository extends Repository
{
    public function __construct(VoterHistory $model)
    {
        parent::__construct($model);
    }

    /**
     * Search for voter history records
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

        return VoterHistory::Search(
            $term,
            function (Indexes $index, $query) use ($args, $isStakeSearch, $isSecondarySearch, $isUnifiedSearch) {
                $defaultArgs = [
                    'attributesToRetrieve' => [
                        'id',
                        'stake_address',
                        'fragment_id',
                        'caster',
                        'raw_fragment',
                        'choice',
                        'time',
                        'voting_power',
                        'snapshot',
                        'created_at',
                    ],
                    'facets' => [
                        'choice',
                        'snapshot.fund',
                    ],
                ];
                if ($isStakeSearch) {
                    $defaultArgs['attributesToSearchOn'] = ['stake_address'];
                } elseif ($isSecondarySearch) {
                    $defaultArgs['attributesToSearchOn'] = ['fragment_id', 'caster', 'raw_fragment', 'snapshot.fund'];
                } elseif ($isUnifiedSearch) {
                    $defaultArgs['attributesToSearchOn'] = ['stake_address', 'fragment_id', 'caster', 'raw_fragment'];
                }

                $mergedArgs = array_merge($defaultArgs, $args);
                if (isset($mergedArgs['sort']) && is_array($mergedArgs['sort'])) {
                    foreach ($mergedArgs['sort'] as $sortItem) {
                        if (strpos($sortItem, 'voting_power:') === 0) {
                            $this->ensureVotingPowerIsSortable($index);
                            break;
                        }
                    }
                }

                return $index->search($query, $mergedArgs);
            }
        );
    }

    protected function ensureVotingPowerIsSortable(Indexes $index): void
    {
        try {
            $settings = $index->getSettings();
            $sortableAttributes = $settings['sortableAttributes'] ?? [];

            if (! in_array('voting_power', $sortableAttributes)) {
                $sortableAttributes[] = 'voting_power';
                $index->updateSettings([
                    'sortableAttributes' => $sortableAttributes,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to register voting_power as sortable: '.$e->getMessage());
        }
    }
}
