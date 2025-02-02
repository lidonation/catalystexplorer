<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ProposalData;
use App\Enums\ProposalSearchParams;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class CompletetProjectNftsController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 3;

    protected array $queryParams = [];

    protected ?string $sortBy = 'created_at';

    protected ?string $sortOrder = 'desc';

    protected null|string|Stringable $search = null;

    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        $this->getProps($request);
        $proposals = $this->getClaimedIdeascaleProfilesProposals();

        return Inertia::render('CompletedProjectNfts/Index', [
            'proposals' => $proposals,
            'filters' => $this->queryParams,
        ]);
    }

    public function show(Request $request, Proposal $proposal): Response
    {
        return Inertia::render('CompletedProjectNfts/Partials/Show');
    }

    public function getClaimedIdeascaleProfilesProposals()
    {
        $user = auth()->user();

        $args = [];

        $page = 1;

        $limit = 3;

        if ($user) {
            $claimedIdeascaleIds = IdeascaleProfile::where('claimed_by', $user->id)->pluck('ideascale_id')->toArray();

            $claimedIdeascaleIdsString = implode(',', $claimedIdeascaleIds);

            $filter = "users.id IN [{$claimedIdeascaleIdsString}]";

            $args['filter'] = $filter;

            if ((bool) $this->sortBy && (bool) $this->sortOrder) {
                $args['sort'] = ["$this->sortBy:$this->sortOrder"];
            }

            if (isset($this->queryParams[ProposalSearchParams::PAGE()->value])) {
                $page = (int) $this->queryParams[ProposalSearchParams::PAGE()->value];
            }

            if (isset($this->queryParams[ProposalSearchParams::LIMIT()->value])) {
                $limit = (int) $this->queryParams[ProposalSearchParams::LIMIT()->value];
            }

            $args['offset'] = ($page - 1) * $limit;
            $args['limit'] = $limit;
        }

        $proposalRepository = app(ProposalRepository::class);

        $builder = $proposalRepository->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent(attributes: $builder->raw());

        $pagination = new LengthAwarePaginator(
            ProposalData::collect($response->hits),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',
            ProposalSearchParams::SORTS()->value => 'nullable',
        ]);

        if (! empty($this->queryParams[ProposalSearchParams::SORTS()->value])) {
            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[ProposalSearchParams::SORTS()->value]
                )
            )->filter();

            $this->sortBy = $sort->first();

            $this->sortOrder = $sort->last();
        }
    }
}
