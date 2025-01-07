<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ProposalSearchParams;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Fluent;
use App\Enums\IdeascaleProfileSearchParams;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Repositories\IdeascaleProfileRepository;
use App\DataTransferObjects\IdeascaleProfileData;
class IdeascaleProfilesController extends Controller
{
    protected int $limit = 24;
    protected int $currentPage = 1;
    protected array $queryParams = [];

    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        $this->getProps($request);

        $ideascaleProfiles = empty($this->queryParams) ? $this->getIdeascaleProfilesData() : $this->query();

        $ideascaleProfiles = $ideascaleProfiles->map(function ($ideascaleProfile) {
            $ideascaleProfile->own_proposals_count = $ideascaleProfile->own_proposals->count();
            $ideascaleProfile->co_proposals_count = $ideascaleProfile->co_proposals_count;
            return $ideascaleProfile;
        });

        return Inertia::render('IdeascaleProfile/Index', [
            'ideascaleProfiles' => $ideascaleProfiles,
            'filters' => $this->queryParams
        ]);
    }



    public function getIdeascaleProfilesData()
    {
        $limit = (int) $this->limit;
        $page = (int) $this->currentPage;

        $ideascaleProfiles = app(IdeascaleProfileRepository::class);

        return $ideascaleProfiles->getQuery()->inRandomOrder()->limit($this->limit)->get();
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',
        ]);
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $limit = isset($this->queryParams[ProposalSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[ProposalSearchParams::LIMIT()->value]
            : $this->limit;

        $args['limit'] = $limit;

        $ideascaleProfiles = app(IdeascaleProfileRepository::class);
        $builder = $ideascaleProfiles->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = $builder->get();

        return $response;
    }
}
