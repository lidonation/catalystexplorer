<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Proposal;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class ProposalRepository extends Repository
{
    public function __construct(Proposal $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, $args = []): Builder
    {
        return Proposal::search(
            $term,
            function (Indexes $index, $query, $options) use ($args) {

                $args['attributesToRetrieve'] = $attrs ?? [
                    'id',
                    'hash',
                    'amount_requested',
                    'amount_received',
                    'currency',
                    'ca_rating',
                    'alignment_score',
                    'feasibility_score',
                    'auditability_score',
                    'ratings_count',
                    'slug',
                    'title',
                    'funded_at',
                    'funding_status',
                    'groups.id',
                    'groups.name',
                    'communities.id',
                    'communities.title',
                    'communities.status',
                    'communities.content',
                    'communities.user_id',
                    'ideascale_link',
                    'projectcatalyst_io_link',
                    'yes_votes_count',
                    'no_votes_count',
                    'abstain_votes_count',
                    'opensource',
                    'paid',
                    'problem',
                    'project_length',
                    'quickpitch',
                    'solution',
                    'status',
                    'website',
                    'type',
                    'link',
                    //                    'ranking_total',
                    'users.id',
                    'users.name',
                    'users.username',
                    'users.ideascale_id',
                    'users.media.original_url',
                    'users.hero_img_url',
                    'fund.id',
                    'fund.label',
                    'fund.title',
                    'fund.amount',
                    'fund.status',
                    'campaign.id',
                    'campaign.label',
                    'campaign.title',
                    'campaign.amount',
                    'campaign.currency',
                    'campaign.proposals_count',
                    'campaign.total_awarded',
                    'campaign.total_distributed',
                ];
                $args['facets'] = [
                    'tags',
                    'tags.title',
                    'funding_status',
                    'status',
                    'campaign',
                    'fund',
                    'opensource',
                    'amount_requested_USD',
                    'amount_requested_ADA',
                    'amount_received_ADA',
                    'amount_received_USD',
                    'amount_awarded_ADA',
                    'amount_awarded_USD',
                    'completed_amount_paid_USD',
                    'completed_amount_paid_ADA',
                    'amount_requested',
                    'project_length',
                    'impact_proposal',
                    'woman_proposal',
                    'has_quick_pitch',
                    'ideafest_proposal',
                ];

                //                if ((bool) $this->sortBy && (bool) $this->sortOrder) {
                //                    $options['sort'] = ["$this->sortBy:$this->sortOrder"];
                //                }

                //                $options['offset'] = ! $returnBuilder ? (($this->currentPage ?? 1) - 1) * $this->limit : 0;
                //                $options['limit'] = $this->limit;
                return $index->search($query, $args);
            }
        );
    }
}
