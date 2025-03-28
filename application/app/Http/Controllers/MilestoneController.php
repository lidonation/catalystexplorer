<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ProjectScheduleData;
use App\Enums\MilestoneSearchParams;
use App\Repositories\ProjectScheduleRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class MilestoneController extends Controller
{
    protected int $limit = 40;

    protected int $currentPage = 1;

    protected ?string $sortBy = 'milestones_count';

    protected ?string $sortOrder = 'desc';

    protected array $queryParams = [];

    public function index(Request $request): Response
    {

        $this->getProps($request);

        return Inertia::render('Milestones/Index', [
            'projectSchedules' => Inertia::defer(fn () => $this->query()),
            'filters' => $this->queryParams,
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            MilestoneSearchParams::PAGE()->value => 'int|nullable',
            MilestoneSearchParams::LIMIT()->value => 'int|nullable',

            MilestoneSearchParams::QUERY()->value => 'string|nullable',
            MilestoneSearchParams::SORTS()->value => 'string|nullable',
        ]);

        // format sort params for meili
        if (! empty($this->queryParams[MilestoneSearchParams::SORTS()->value])) {
            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[MilestoneSearchParams::SORTS()->value]
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

        $page = isset($this->queryParams[MilestoneSearchParams::PAGE()->value])
            ? (int) $this->queryParams[MilestoneSearchParams::PAGE()->value]
            : 1;

        $limit = isset($this->queryParams[MilestoneSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[MilestoneSearchParams::LIMIT()->value]
            : 36;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $projectSchedule = app(ProjectScheduleRepository::class);

        $builder = $projectSchedule->search(
            $this->queryParams[MilestoneSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $pagination = new LengthAwarePaginator(
            ProjectScheduleData::collect($response->hits),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    // #[ArrayShape(['filters' => 'array'])]
    protected function getUserFilters(): array
    {
        $filters = [];

        return $filters;
    }
}
