<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\ReviewData;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Models\Proposal;
use App\Models\Review;
use App\Repositories\ReviewRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;

class ReviewsController extends Controller
{
    protected int $currentPage;

    protected array $queryParams = [];

    protected int $perPage = 24;

    protected ?string $sortBy = null;

    protected ?string $sortOrder = null;

    protected ?string $search = null;

    protected array $filters = [];

    public array $fundsCount = [];

    protected int $limit;

    protected Builder $searchBuilder;

    public function index(Request $request): Response
    {
        $this->setFilters($request);

        $props = [
            'reviews' => $this->query(),
            'search' => $this->search,
            'sortBy' => $this->sortBy,
            'sortOrder' => $this->sortOrder,
            'filters' => $this->filters,
            'funds' => $this->fundsCount,
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
            'content',
            'status',
            'model_id',
            'rating',
            'reviewer',
            'model_type',
            'reviewer.avg_reputation_score',
        ];

        $args['facets'] = [
            'rating',
            'reviewer.reputation_scores.fund.label',
        ];

        $reviews = app(ReviewRepository::class);

        $builder = $reviews->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());
        $items = collect($response->hits);

        $pagination = new LengthAwarePaginator(
            ReviewData::collect(
                (new TransformIdsToHashes)(
                    collection: $items,
                    model: new Proposal
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

    protected function setFilters(Request $request): void
    {
        $this->limit = (int) $request->input(QueryParamsEnum::LIMIT(), 24);
        $this->currentPage = (int) $request->input(QueryParamsEnum::PAGE(), 1);
        $this->search = $request->input(QueryParamsEnum::QUERY(), null);

        $sort = collect(explode(':', $request->input(QueryParamsEnum::SORTS(), '')))->filter();

        if (!$sort->isEmpty()) {
            $this->sortBy = $sort->first();
            $this->sortOrder = $sort->last();
        }

    }

    protected function getUserFilters(): array
    {
        $_options = [];

        if (isset($this->filters['status'])) {
            $_options[] = "status = '{$this->filters['status']}'";
        }

        return $_options;
    }

    public function setCounts($facets, $facetStats): void
    {
        if (isset($facets['reviewer.reputation_scores.fund.label']) && count($facets['reviewer.reputation_scores.fund.label'])) {
            $this->fundsCount = $facets['reviewer.reputation_scores.fund.label'];
        }
    }
}
