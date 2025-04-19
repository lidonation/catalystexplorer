<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\ReviewData;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Models\Fund;
use App\Models\Ranking;
use App\Models\Review;
use App\Repositories\ReviewRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;

class ReviewsController extends Controller
{
    protected int $currentPage = 1;

    protected array $queryParams = [];

    protected int $perPage = 24;

    protected ?string $sortBy = 'positive_rankings';

    protected ?string $sortOrder = 'desc';

    protected ?string $search = null;

    protected array $filters = [];

    public array $fundLabels = [];

    public array $ratingDistribution = [];

    public array $reputationScoreDistribution = [];

    public array $fundsCount = [];

    protected int $limit = 24;

    protected Builder $searchBuilder;

    public function index(Request $request): Response
    {
        $this->setFilters($request);

        $props = [
            'reviews' => $this->query(),
            'search' => $this->search,
            'sortBy' => $this->sortBy,
            'sortOrder' => $this->sortOrder,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->filters,
            'queryParams' => $this->queryParams,
            'funds' => $this->fundLabels,
            'fundsCount' => $this->fundsCount,
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
                'positive_rankings' => $review->positiveRankings->count() ?? 0,
                'negative_rankings' => $review->negativeRankings->count() ?? 0,
                'helpful_total' => $review->helpful_total ?? 0,
                'not_helpful_total' => $review->not_helpful_total ?? 0,
            ]),
        ]);
    }

    protected function setFilters(Request $request): void
    {
        $this->limit = (int) $request->input(QueryParamsEnum::LIMIT(), 24);
        $this->currentPage = (int) $request->input(QueryParamsEnum::PAGE(), 1);
        $this->search = $request->input(QueryParamsEnum::QUERY(), null);

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
            ProposalSearchParams::GROUPS()->value => 'array|nullable',
            ProposalSearchParams::IDEASCALE_PROFILES()->value => 'array|nullable',
        ]);

        $this->filters = $this->queryParams;

        $sort = collect(explode(':', $request->input(ProposalSearchParams::SORTS()->value, '')))->filter();

        if (! $sort->isEmpty()) {
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
            : 64;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;
        $args['attributesToRetrieve'] = $attrs ?? [
            'hash',
            'title',
            'proposal',
            'content',
            'status',
            'model_id',
            'rating',
            'reviewer',
            'model_type',
            'reviewer.avg_reputation_score',
            'reviewer.claimedBy',
            'ranking_total',
            'positive_rankings',
            'negative_rankings',
            'helpful_total',
            'not_helpful_total',
        ];

        $args['facets'] = [
            'rating',
            'reviewer.reputation_scores.fund.label',
            'reviewer.avg_reputation_score',
            'proposal.title',
            'status',
        ];

        $reviews = app(ReviewRepository::class);

        $builder = $reviews->search(
            $this->search ?? '',
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

        if (isset($this->filters['status'])) {
            $filters[] = "status = '{$this->filters['status']}'";
        }

        if (! empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
            $fundLabels = implode("','", $this->queryParams[ProposalSearchParams::FUNDS()->value]);
            $filters[] = "reviewer.reputation_scores.fund.label IN ['{$fundLabels}']";
        }

        if (! empty($this->queryParams[ProposalSearchParams::GROUPS()->value])) {
            $groupHashes = implode(',', $this->queryParams[ProposalSearchParams::GROUPS()->value]);
            $filters[] = "proposal.groups.hash IN [{$groupHashes}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value])) {
            $ideascaleProfileHashes = implode(',', $this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value]);
            $filters[] = "proposal.ideascale_profiles.hash IN [{$ideascaleProfileHashes}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::PROPOSALS()->value])) {
            $proposalTitles = $this->queryParams[ProposalSearchParams::PROPOSALS()->value];
            if (! empty($proposalTitles)) {
                $proposalTitleString = implode("','", $proposalTitles);
                $filters[] = "proposal.title IN ['{$proposalTitleString}']";
            }
        }

        $reviewerIdsKey = ProposalSearchParams::REVIEWER_IDS()->value;
        if (! empty($this->queryParams[$reviewerIdsKey])) {
            $reviewerIds = is_array($this->queryParams[$reviewerIdsKey])
                ? $this->queryParams[$reviewerIdsKey]
                : explode(',', $this->queryParams[$reviewerIdsKey]);

            if (count($reviewerIds) === 1) {
                $filters[] = "reviewer.catalyst_reviewer_id = '{$reviewerIds[0]}'";
            } else {
                $reviewerIdsString = implode("','", $reviewerIds);
                $filters[] = "reviewer.catalyst_reviewer_id IN ['{$reviewerIdsString}']";
            }
        }

        if (! empty($this->queryParams[ProposalSearchParams::RATINGS()->value])) {
            $ratingRange = collect((object) $this->queryParams[ProposalSearchParams::RATINGS()->value]);
            $filters[] = "(rating {$ratingRange->first()} TO {$ratingRange->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::REPUTATION_SCORES()->value])) {
            $reputationRange = collect((object) $this->queryParams[ProposalSearchParams::REPUTATION_SCORES()->value]);
            $filters[] = "(reviewer.avg_reputation_score {$reputationRange->first()} TO {$reputationRange->last()})";
        }

        return $filters;
    }

    public function setCounts($facets, $facetStats): void
    {
        if (isset($facets['reviewer.reputation_scores.fund.label']) && count($facets['reviewer.reputation_scores.fund.label'])) {
            $this->fundLabels = $facets['reviewer.reputation_scores.fund.label'];
            $this->fundsCount = $facets['reviewer.reputation_scores.fund.label'];
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

    public function helpfulReview(int $reviewId)
    {
        $ranking = Ranking::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'model_id' => $reviewId,
                'model_type' => Review::class,
            ],
            [
                'value' => 1,
            ]
        );

        $review = Review::find($reviewId);

        if ($review) {
            $review->rankings()->save($ranking);
            $review->searchable();
        }
    }

    public function notHelpfulReview(int $reviewId)
    {
        $ranking = Ranking::updateOrCreate(
            [
                'user_id' => Auth::user()->id,
                'model_id' => $reviewId,
                'model_type' => Review::class,
            ],
            [
                'value' => -1,
            ]
        );

        $review = Review::find($reviewId);

        if ($review) {
            $review->rankings()->save($ranking);
            $review->searchable();
        }
    }
}
