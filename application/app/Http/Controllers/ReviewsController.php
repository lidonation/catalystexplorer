<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\ReviewData;
use App\Enums\ProposalSearchParams;
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Reviewer;
use App\Repositories\ReviewRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class ReviewsController extends Controller
{
    protected int $currentPage = 1;

    protected array $queryParams = [];

    protected int $perPage = 24;

    protected ?string $sortBy = 'helpful_total';

    protected ?string $sortOrder = 'desc';

    protected ?string $search = null;

    public array $fundLabels = [];

    public array $ratingDistribution = [];

    public array $reputationScoreDistribution = [];

    protected int $limit = 24;

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $props = [
            'reviews' => $this->query(),
            'search' => $this->search,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->queryParams,
            'funds' => $this->fundLabels,
            'ratingDistribution' => $this->ratingDistribution,
            'reputationScoreDistribution' => $this->reputationScoreDistribution,
        ];

        return Inertia::render('Reviews/Index', $props);
    }

    public function review(Request $request, Review $review): Response
    {
        return Inertia::render('Reviews/Partials/Review', [
            'review' => ReviewData::from([
                ...$review->toArray(),
                'model_id' => $review->model_id ?? 0,
                'model_type' => $review->model_type ?? 'default_type',
                'content' => $review->content ?? '',
                'type' => $review->type ?? 'default',
                'ranking_total' => $review->ranking_total ?? 0,
                'helpful_total' => $review->helpful_total ?? 0,
                'not_helpful_total' => $review->not_helpful_total ?? 0,
            ]),
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
            ProposalSearchParams::PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::REVIEWER_IDS()->value => 'array|nullable',
            ProposalSearchParams::RATINGS()->value => 'array|nullable',
            ProposalSearchParams::REPUTATION_SCORES()->value => 'array|nullable',
            ProposalSearchParams::HELPFUL()->value => 'string|nullable',
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::PAGE()->value => 'integer|nullable',
            ProposalSearchParams::LIMIT()->value => 'integer|nullable',
            ProposalSearchParams::SORTS()->value => 'string|nullable',
        ]);

        // Get search query if it exists
        $this->search = $request->input(ProposalSearchParams::QUERY()->value) ?? '';

        // Set current page for pagination
        $this->currentPage = (int) ($request->input(ProposalSearchParams::PAGE()->value) ?? 1);

        // Set items per page
        $this->limit = (int) ($request->input(ProposalSearchParams::LIMIT()->value) ?? 24);

        // format sort params for meili
        if (! empty($request->input(ProposalSearchParams::SORTS()->value))) {
            $sort = collect(
                explode(
                    ':',
                    $request->input(ProposalSearchParams::SORTS()->value)
                )
            )->filter();

            $this->sortBy = $sort->first();
            $this->sortOrder = $sort->last();
        }
    }

    public function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $args = [
            'filter' => $this->getUserFilters(),
        ];

        if ((bool) $this->sortBy && (bool) $this->sortOrder) {
            $args['sort'] = ["$this->sortBy:$this->sortOrder"];
        }

        $page = isset($this->currentPage)
            ? (int) $this->currentPage
            : 1;

        $limit = isset($this->limit)
            ? (int) $this->limit
            : 24;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;
        $args['attributesToRetrieve'] = $attrs ?? [
            'hash',
            'title',
            'content',
            'status',
            'model_id',
            'rating',
            'reviewer',
            'model_type',
            'reviewer.avg_reputation_score',
            'reviewer.claimedBy',
            'helpful_total',
            'not_helpful_total',
            'ranking_total',
        ];

        // Use only the available filterable attributes for facets
        $args['facets'] = [
            'rating',
            'reviewer.avg_reputation_score',
            'reviewer.reputation_scores.fund.label',
            'proposal.id',
            'status',
        ];

        $reviews = app(ReviewRepository::class);

        $builder = $reviews->search(
            $this->search,
            $args
        );

        if ($returnBuilder) {
            return $builder;
        }

        $response = new Fluent($builder->raw());
        $items = collect($response->hits);

        $pagination = new LengthAwarePaginator(
            ReviewData::collect(
                (new TransformIdsToHashes)(
                    collection: $items,
                    model: new Review
                )->toArray()
            ),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
                'onEachSide' => 0,
            ]
        );

        $this->setCounts($response->facetDistribution, $response->facetStats);

        return $pagination->toArray();
    }

    protected function getUserFilters(): array
    {
        $filters = [];

        if (! empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
            $fundLabels = implode("','", $this->queryParams[ProposalSearchParams::FUNDS()->value]);
            $filters[] = "reviewer.reputation_scores.fund.label IN ['{$fundLabels}']";
        }

        if (! empty($this->queryParams[ProposalSearchParams::PROPOSALS()->value])) {
            $validProposalIds = array_filter($this->queryParams[ProposalSearchParams::PROPOSALS()->value], 'is_numeric');
            if (! empty($validProposalIds)) {
                $proposalIds = implode(',', $validProposalIds);
                $filters[] = "proposal.id IN [{$proposalIds}]";
            }
        }

        if (! empty($this->queryParams[ProposalSearchParams::REVIEWER_IDS()->value])) {
            $reviewerIds = implode("','", $this->queryParams[ProposalSearchParams::REVIEWER_IDS()->value]);
            $filters[] = "reviewer.catalyst_reviewer_id IN ['{$reviewerIds}']";
        }

        if (! empty($this->queryParams[ProposalSearchParams::RATINGS()->value])) {
            $ratingRange = collect((object) $this->queryParams[ProposalSearchParams::RATINGS()->value]);
            $filters[] = "(rating {$ratingRange->first()} TO {$ratingRange->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::REPUTATION_SCORES()->value])) {
            $reputationRange = collect((object) $this->queryParams[ProposalSearchParams::REPUTATION_SCORES()->value]);
            $filters[] = "(reviewer.avg_reputation_score {$reputationRange->first()} TO {$reputationRange->last()})";
        }

        if (isset($this->queryParams[ProposalSearchParams::HELPFUL()->value])) {
            if (is_numeric($this->queryParams[ProposalSearchParams::HELPFUL()->value])) {
                $helpfulValue = (int) $this->queryParams[ProposalSearchParams::HELPFUL()->value];
                $filters[] = "helpful_total >= {$helpfulValue}";
            } elseif ($this->queryParams[ProposalSearchParams::HELPFUL()->value] === 'true') {
                $filters[] = 'helpful_total > 0';
            }
        }

        return $filters;
    }

    public function setCounts($facets, $facetStats): void
    {
        if (isset($facets['reviewer.reputation_scores.fund.label']) && count($facets['reviewer.reputation_scores.fund.label'])) {
            $this->fundLabels = $facets['reviewer.reputation_scores.fund.label'];
        }

        if (isset($facets['rating']) && count($facets['rating'])) {
            $this->ratingDistribution = $facets['rating'];
        }

        if (isset($facets['reviewer.avg_reputation_score']) && count($facets['reviewer.avg_reputation_score'])) {
            $this->reputationScoreDistribution = $facets['reviewer.avg_reputation_score'];
        }
    }

    public function fundTitles()
    {
        $fundTitles = Fund::pluck('title');

        return response()->json($fundTitles);
    }

    public function proposalTitles()
    {
        $proposalTitles = Proposal::pluck('title');

        return response()->json($proposalTitles);
    }

    public function reviewerIds()
    {
        $reviewer_ids = Reviewer::select('catalyst_reviewer_id')
            ->distinct()
            ->whereNotNull('catalyst_reviewer_id')
            ->orderBy('catalyst_reviewer_id')
            ->pluck('catalyst_reviewer_id')
            ->map(function ($reviewer_ids) {
                $label = is_numeric($reviewer_ids) ? "{$reviewer_ids}" : $reviewer_ids;

                return [
                    'id' => $reviewer_ids,
                    'name' => $label,
                    'hash' => $reviewer_ids,
                ];
            });

        return response()->json($reviewer_ids);
    }

    public function helpfulTotal()
    {
        return response()->json([
            ['value' => 'true', 'label' => 'Yes'],
            ['value' => 'false', 'label' => 'No'],
        ]);
    }
}
