<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\IdeascaleProfileRepository;
use App\Enums\ProposalSearchParams;
use Illuminate\Http\Request;
use Laravel\Scout\Builder;
use Inertia\Inertia;
use Inertia\Response;

class IdeascaleProfilesController extends Controller
{
    /**
     * Display the user's profile form.
     */
    protected int $limit = 40;

    protected array $queryParams = [];


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
        $ideascaleProfiles = app(IdeascaleProfileRepository::class);

        return $ideascaleProfiles->getQuery()->inRandomOrder()->limit($this->limit)->get();
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::QUERY()->value => 'string|nullable',
        ]);
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $ideascaleProfiles = app(IdeascaleProfileRepository::class);
        $builder = $ideascaleProfiles->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
        );

        $response = $builder->get();

        return $response;
    }
}
