<?php declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ProposalData;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class ProposalsController extends Controller
{
    protected int $currentPage = 1;

    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Proposals/Index', $this->getProps($request));
    }

    protected function getProps(Request $request): array
    {
        $shouldRandomize = true;
        $proposals = Inertia::optional(
            fn() => ProposalData::collect(
                $shouldRandomize ? $this->getRandomProposals() : $this->query()
            )
        );

        return [
            'proposals' => $proposals,
            'filters' => $request->all(
                'search',
                'status',
                'category',
                'sort',
                'direction'
            ),
        ];
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = []): array|Builder
    {
        $_options = [
//            'filters' => array_merge([], $this->getUserFilters(), $filters),
        ];

        $searchBuilder = Proposal::search(
            '',
//            $this->search,
            function (Indexes $index, $query, $options) use ($_options, $attrs, $returnBuilder) {
                if (count($_options['filters']) > 0) {
                    $options['filter'] = implode(' AND ', $_options['filters']);
                }

                $options['attributesToRetrieve'] = $attrs ?? [
                    'id',
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
                    'ranking_total',
                    'users.id',
                    'users.name',
                    'users.username',
                    'users.ideascale_id',
                    'users.media.original_url',
                    'users.profile_photo_url',
                    'fund.id',
                    'fund.label',
                    'fund.amount',
                    'fund.status',
                    'campaign.id',
                    'campaign.label',
                    'campaign.amount',
                ];
                $options['facets'] = [
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

                return $index->search($query, $options);
            }
        );

        if ($returnBuilder) {
            return $searchBuilder;
        }
        $response = new Fluent($searchBuilder->raw());

//        $this->setCounts($response->facetDistribution, $response->facetStats);

        $pagination = new LengthAwarePaginator(
            $response->hits,
            $response->estimatedTotalHits,
            $response->limit,
            $this->currentPage,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    protected function getRandomProposals(): Paginator|array|Collection
    {
        $proposals = app(ProposalRepository::class);
        return ProposalData::collect($proposals->getQuery()->inRandomOrder()->limit(36)->get());
    }
}
