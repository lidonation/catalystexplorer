<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\ProposalData;
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
use Meilisearch\Endpoints\Indexes;

class ReviewsController extends Controller
{
    protected int $currentPage;

    protected int $perPage = 24;

    protected ?string $sortBy = null;

    protected ?string $sortOrder = null;

    protected ?string $search = null;

    protected array $filters = [];

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

        $page = isset($this->queryParams[ProposalSearchParams::PAGE()->value])
            ? (int) $this->queryParams[ProposalSearchParams::PAGE()->value]
            : 1;

        $limit = isset($this->queryParams[ProposalSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[ProposalSearchParams::LIMIT()->value]
            : 64;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;
        $args['attributesToRetrieve'] = $attrs ?? [
            'hash',
            'title',
            'content',
            'status',
            'model_id',
            'model_type',
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

        return $pagination->toArray();

        $_options = [
            'filters' => array_merge([], $this->getUserFilters(), $filters),
        ];

        $this->searchBuilder = Review::search(
            $this->search,
            function (Indexes $index, $query, $options) use ($_options, $attrs) {
                if (count($_options['filters']) > 0) {
                    $options['filter'] = implode(' AND ', $_options['filters']);
                }

                $options['attributesToRetrieve'] = $attrs ?? [
                    'hash',
                    'title',
                    'content',
                    'status',
                    'model_id',
                    'model_type',
                ];

                if ((bool) $this->sortBy && (bool) $this->sortOrder) {
                    $options['sort'] = ["$this->sortBy:$this->sortOrder"];
                }
                $options['offset'] = (($this->currentPage ?? 1) - 1) * $this->limit;
                $options['limit'] = $this->limit;

                return $index->search($query, $options);
            }
        );

        if ($returnBuilder) {
            return $this->searchBuilder;
        }

        $response = new Fluent($this->searchBuilder->raw());
        $items = collect($response->hits);
        $pagination = new LengthAwarePaginator(
            ProposalData::collect(
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

        return $pagination->toArray();

        //        $pagination = new LengthAwarePaginator(
        //            $response->hits,
        //            $response->estimatedTotalHits,
        //            $response->limit,
        //            $this->currentPage,
        //            [
        //                'pageName' => 'p',
        //            ]
        //        );
        //        return to_length_aware_paginator($pagination);
    }

    protected function setFilters(Request $request): void
    {
        $this->limit = (int) $request->input(QueryParamsEnum::LIMIT(), 24);
        $this->currentPage = (int) $request->input(QueryParamsEnum::PAGE(), 1);
        $this->search = $request->input(QueryParamsEnum::QUERY(), null);

        $sort = collect(explode(':', $request->input(QueryParamsEnum::SORTS(), '')))->filter();
        if ($sort->isEmpty()) {
            $sort = collect(explode(':', collect([
                'title:asc',
                'title:desc',
                'status:desc',
                'status:asc',
            ])->random()));
        }
        $this->sortBy = $sort->first();
        $this->sortOrder = $sort->last();
    }

    protected function getUserFilters(): array
    {
        $_options = [];

        if (isset($this->filters['status'])) {
            $_options[] = "status = '{$this->filters['status']}'";
        }

        return $_options;
    }
}
