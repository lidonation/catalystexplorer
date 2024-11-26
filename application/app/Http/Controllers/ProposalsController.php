<?php declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ProposalData;
use App\Enums\ProposalSearchParams;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use JetBrains\PhpStorm\ArrayShape;
use Laravel\Scout\Builder;

class ProposalsController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 36;

    protected array $queryParams = [];

    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Proposals/Index', $this->getProps($request));
    }

    protected function getProps(Request $request): array
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDING_STATUS()->value => 'string|nullable',
            ProposalSearchParams::OPENSOURCE_PROPOSALS()->value => 'bool|nullable',
            ProposalSearchParams::PROJECT_STATUS()->value => 'string|nullable',
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::QUICK_PITCHES()->value => 'bool|nullable',
            ProposalSearchParams::TYPE()->value => 'string|nullable',

        ]);

        $shouldRandomize = empty($this->queryParams);
        $proposals = Inertia::optional(
            fn() => $shouldRandomize ? $this->getRandomProposals() : $this->query()
        );


        return [
            'proposals' => $proposals,
            'filters' => $this->queryParams,
        ];
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = []): array|Builder
    {
//        sleep(5);
        $args = [
            'filters' => $this->getUserFilters(),
        ];
        $proposals = app(ProposalRepository::class);
        $builder = $proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        );
        $response = new Fluent($builder->raw());
        $pagination = new LengthAwarePaginator(
            ProposalData::collect($response->hits),
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
        $pagination = new LengthAwarePaginator(
            ProposalData::collect(
                $proposals->getQuery()->inRandomOrder()->limit($this->limit)->get()
            ),
            Proposal::count(),
            $this->limit,
            $this->currentPage,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    protected function getUserFilters(): array
    {
        $filters = [];

        if (isset($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
            $fundingStatuses = $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value];
            $filters[] = "funding_status IN [{$fundingStatuses}]";
        }

        if (isset($this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value])) {
            $fundingStatuses = $this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value];
            $filters[] = "status = {$fundingStatuses}";
        }

        if (isset($this->queryParams[ProposalSearchParams::OPENSOURCE_PROPOSALS()->value])) {
            $filters[] = 'opensource = ' . $this->queryParams[ProposalSearchParams::OPENSOURCE_PROPOSALS()->value];
        }

        if (isset($this->queryParams[ProposalSearchParams::TYPE()->value])) {
            $filters[] = 'type = ' . $this->queryParams[ProposalSearchParams::TYPE()->value];
        }

        if (isset($this->queryParams[ProposalSearchParams::QUICK_PITCHES()->value])) {
            $filters[] = 'quickpitch IS NOT NULL';
        }

        //        if ($this->projectLength->isNotEmpty()) {
//            $filters[] = "(project_length  {$this->projectLength->first()} TO  {$this->projectLength->last()})";
//        }
//
//        if ($this->fundingStatus === 'paid') {
//            $filters[] = '(paid = 1)';
//        }
//
//        if (count($this->proposalsFilter)) {
//            $filters[] = 'id IN'.$this->proposalsFilter->toJson();
//        }

//        // filter by fund
//        if ($this->fundsFilter->isNotEmpty()) {
//            $filters[] = '('.$this->fundsFilter->map(fn ($f) => "fund.id = {$f}")->implode(' OR ').')';
//        }
//
//        // filter by challenge
//        if ($this->challengesFilter->isNotEmpty()) {
//            $filters[] = '('.$this->challengesFilter->map(fn ($c) => "campaign.id = {$c}")->implode(' OR ').')';
//        }
//
//        // filter by tags
//        if ($this->tagsFilter->isNotEmpty()) {
//            $filters[] = 'tags.id IN '.$this->tagsFilter->toJson();
//        }
//
//        if ($this->categoriesFilter->isNotEmpty()) {
//            $filters[] = 'categories.id IN '.$this->categoriesFilter->toJson();
//        }
//
//        if ($this->peopleFilter->isNotEmpty()) {
//            $filters[] = 'users.id IN '.$this->peopleFilter->toJson();
//        }
//
//        if ($this->groupsFilter->isNotEmpty()) {
//            $filters[] = 'groups.id IN '.$this->groupsFilter->toJson();
//        }
//
//        // filter by communities
//        if ($this->communitiesFilter->isNotEmpty()) {
//            $filters[] = 'communities.id IN '.$this->communitiesFilter->toJson();
//        }
//
//        // filter by budget range
//        if ($this->budgets->isNotEmpty()) {
//            $filters[] = "(amount_requested  {$this->budgets->first()} TO  {$this->budgets->last()})";
//        }
//


        return $filters;
    }
}
