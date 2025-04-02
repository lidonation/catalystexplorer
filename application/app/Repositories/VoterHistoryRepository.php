<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\VoterHistory;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class VoterHistoryRepository extends Repository
{
    public function __construct(VoterHistory $model)
    {
        parent::__construct($model);
    }
    
    public function search(string $term, array $args = []): Builder
    {
        return VoterHistory::Search(
            $term,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'hash',
                            'stake_address',
                            'fragment_id',
                            'caster',
                            'raw_fragment',
                            'choice',
                            'time',
                            'voting_power',
                            'fund',
                        ],
                        'facets' => [
                            'choice',
                            'fund',
                        ],
                    ],
                    $args
                );

                // Ensure voting_power is included in sortable attributes if sorting by it
                if (isset($args['sort']) && is_array($args['sort'])) {
                    foreach ($args['sort'] as $sortItem) {
                        if (strpos($sortItem, 'voting_power:') === 0) {
                            // Register voting_power as sortable if not already
                            $this->ensureVotingPowerIsSortable($index);
                            break;
                        }
                    }
                }

                return $index->search($query, $args);
            }
        );
    }
    
    /**
     * Ensure voting_power is included in sortable attributes
     */
    protected function ensureVotingPowerIsSortable(Indexes $index): void
    {
        try {
            $settings = $index->getSettings();
            $sortableAttributes = $settings['sortableAttributes'] ?? [];
            
            if (!in_array('voting_power', $sortableAttributes)) {
                $sortableAttributes[] = 'voting_power';
                $index->updateSettings([
                    'sortableAttributes' => $sortableAttributes
                ]);
            }
        } catch (\Exception $e) {
            // Log error but continue execution
            \Log::error("Failed to register voting_power as sortable: " . $e->getMessage());
        }
    }
}
