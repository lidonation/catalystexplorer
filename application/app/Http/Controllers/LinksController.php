<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\LinkData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ServiceData;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Repositories\LinkRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder as ScoutBuilder;

class LinksController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 32;

    protected array $queryParams = [];

    protected ?Request $request = null;

    protected ?string $sortBy = 'created_at';

    protected ?string $sortOrder = 'desc';

    protected ?string $search = null;

    protected array $filters = [];

    public array $modelTypesCount = [];

    public array $linkTypesCount = [];

    public array $statusesCount = [];

    protected ScoutBuilder $searchBuilder;

    public function __construct()
    {
        //
    }

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $links = $this->query();

        return Inertia::render('Links/Index', [
            'links' => $links,
            'filters' => $this->filters,
            'queryParams' => $this->queryParams,
            'search' => $this->search,
            'sortBy' => $this->sortBy,
            'sortOrder' => $this->sortOrder,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'modelTypesCount' => $this->modelTypesCount,
            'linkTypesCount' => $this->linkTypesCount,
            'statusesCount' => $this->statusesCount,
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->request = $request;
        $this->limit = (int) $request->input(QueryParamsEnum::LIMIT(), 32);
        $this->currentPage = (int) $request->input(QueryParamsEnum::PAGE(), 1);
        $this->search = $request->input(QueryParamsEnum::QUERY(), null);

        $this->queryParams = $request->validate([
            'model_types' => 'array|nullable',
            'link_types' => 'array|nullable',
            'statuses' => 'array|nullable',
            'valid' => 'boolean|nullable',
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::PAGE()->value => 'integer|nullable',
            ProposalSearchParams::LIMIT()->value => 'integer|nullable',
            ProposalSearchParams::SORTS()->value => 'string|nullable',
        ]);

        $this->filters = $this->queryParams;

        $sort = collect(explode(':', $request->input(ProposalSearchParams::SORTS()->value, '')))->filter();

        if (! $sort->isEmpty()) {
            $this->sortBy = $sort->first();
            $this->sortOrder = $sort->last();
        }
    }

    public function query($returnBuilder = false, $attrs = null, $filters = []): array
    {
        $args = [
            'filter' => $this->getUserFilters(),
        ];

        if ((bool) $this->sortBy && (bool) $this->sortOrder) {
            $args['sort'] = ["{$this->sortBy}:{$this->sortOrder}"];
        }

        $page = isset($this->currentPage) ? (int) $this->currentPage : 1;
        $limit = isset($this->limit) ? (int) $this->limit : 32;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;
        $args['attributesToRetrieve'] = $attrs ?? [
            'id',
            'title',
            'label',
            'link',
            'type',
            'status',
            'valid',
            'order',
            'model_type',
            'model_id',
            'proposal_data',
            'service_data',
            'created_at',
            'updated_at',
        ];

        $args['facets'] = [
            'type',
            'status',
            'valid',
            'model_type',
        ];

        $links = app(LinkRepository::class);

        $builder = $links->search(
            $this->search ?? '',
            $args
        );

        if ($returnBuilder) {
            return $builder;
        }

        $response = new Fluent($builder->raw());
        $items = collect($response->hits);

        // Process the search results to add related model data
        $linkData = $items->map(function ($hit) {
            // Ensure we have proper data structure from Meilisearch hit
            $linkData = [
                'id' => (string) ($hit['id'] ?? ''),
                'title' => $hit['title'] ?? null,
                'label' => $hit['label'] ?? null,
                'link' => $hit['link'] ?? '',
                'type' => $hit['type'] ?? '',
                'status' => $hit['status'] ?? null,
                'order' => $hit['order'] ?? null,
                'valid' => $hit['valid'] ?? null,
                'model_type' => $hit['model_type'] ?? null,
                'model_id' => $hit['model_id'] ?? null,
                'created_at' => $hit['created_at'] ?? null,
                'updated_at' => $hit['updated_at'] ?? null,
            ];

            $proposalData = null;
            $serviceData = null;

            // Use embedded data from search index instead of making database queries
            if ($linkData['model_type'] === 'App\\Models\\Proposal' && isset($hit['proposal_data'])) {
                $proposalInfo = $hit['proposal_data'];
                $proposalData = ProposalData::from([
                    'id' => $linkData['model_id'],
                    'title' => $proposalInfo['title'] ?? '',
                    'slug' => $proposalInfo['slug'] ?? '',
                    'amountRequested' => $proposalInfo['amountRequested'] ?? 0,
                    'currency' => $proposalInfo['currency'] ?? 'ADA',
                    'fund' => $proposalInfo['fund_title'] ? [
                        'title' => $proposalInfo['fund_title'],
                    ] : null,
                    'campaign' => $proposalInfo['campaign_title'] ? [
                        'title' => $proposalInfo['campaign_title'],
                    ] : null,
                    'link' => $proposalInfo['link'] ?? '',
                ]);
            } elseif ($linkData['model_type'] === 'App\\Models\\Service' && isset($hit['service_data'])) {
                $serviceInfo = $hit['service_data'];
                $serviceData = ServiceData::from([
                    'id' => $linkData['model_id'],
                    'title' => $serviceInfo['title'] ?? '',
                    'name' => $serviceInfo['name'] ?? '',
                    'slug' => $serviceInfo['slug'] ?? '',
                    'type' => $serviceInfo['type'] ?? '',
                    'user' => $serviceInfo['user_name'] ? [
                        'name' => $serviceInfo['user_name'],
                    ] : null,
                    'link' => $serviceInfo['link'] ?? '',
                ]);
            }

            return LinkData::from([
                'id' => $linkData['id'],
                'title' => $linkData['title'],
                'label' => $linkData['label'],
                'link' => $linkData['link'],
                'type' => $linkData['type'],
                'status' => $linkData['status'],
                'order' => $linkData['order'],
                'valid' => $linkData['valid'],
                'modelType' => $linkData['model_type'],
                'modelId' => $linkData['model_id'],
                'proposal' => $proposalData,
                'service' => $serviceData,
                'createdAt' => $linkData['created_at'],
                'updatedAt' => $linkData['updated_at'],
            ]);
        });

        $pagination = new LengthAwarePaginator(
            $linkData,
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

        if (! empty($this->queryParams['model_types'])) {
            $modelTypes = array_map(function ($type) {
                return match ($type) {
                    'proposal' => 'App\\Models\\Proposal',
                    'service' => 'App\\Models\\Service',
                    default => $type,
                };
            }, $this->queryParams['model_types']);
            $modelTypeString = implode("','", $modelTypes);
            $filters[] = "model_type IN ['{$modelTypeString}']";
        }

        if (! empty($this->queryParams['link_types'])) {
            $linkTypes = (array) $this->queryParams['link_types'];
            $linkTypeString = implode("','", $linkTypes);
            $filters[] = "type IN ['{$linkTypeString}']";
        }

        if (! empty($this->queryParams['statuses'])) {
            $statuses = (array) $this->queryParams['statuses'];
            $statusString = implode("','", $statuses);
            $filters[] = "status IN ['{$statusString}']";
        }

        if (isset($this->queryParams['valid'])) {
            $valid = $this->queryParams['valid'] ? 'true' : 'false';
            $filters[] = "valid = {$valid}";
        }

        return $filters;
    }

    public function setCounts($facets, $facetStats): void
    {
        if (isset($facets['model_type']) && count($facets['model_type'])) {
            $this->modelTypesCount = $facets['model_type'];
        }

        if (isset($facets['type']) && count($facets['type'])) {
            $this->linkTypesCount = $facets['type'];
        }

        if (isset($facets['status']) && count($facets['status'])) {
            $this->statusesCount = $facets['status'];
        }
    }

    public function links(Request $request): JsonResponse
    {
        $this->getProps($request);
        $links = $this->query();

        return response()->json($links);
    }
}
