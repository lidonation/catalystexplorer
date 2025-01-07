<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\IdeascaleProfileSearchParams;
use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IdeascaleProfilesController extends Controller
{
    protected int $limit = 24;

    protected int $currentPage = 1;

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
            'filters' => $this->queryParams,
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
            IdeascaleProfileSearchParams::QUERY()->value => 'string|nullable',
            IdeascaleProfileSearchParams::PAGE()->value => 'int|nullable',
            IdeascaleProfileSearchParams::LIMIT()->value => 'int|nullable',
            IdeascaleProfileSearchParams::SORT()->value => 'string|nullable',
        ]);
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $page = (int) ($this->queryParams[IdeascaleProfileSearchParams::PAGE()->value] ?? $this->currentPage);
        $limit = (int) ($this->queryParams[IdeascaleProfileSearchParams::LIMIT()->value] ?? $this->limit);
        $sort = ($this->queryParams[IdeascaleProfileSearchParams::SORT()->value] ?? null);

        $args['limit'] = $limit;

        if ($sort) {
            $args['sort'] = [$sort];
        }

        $proposals = app(IdeascaleProfileRepository::class);

        $builder = $proposals->search(
            $this->queryParams[IdeascaleProfileSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = $builder->get();

        return $response;
    }
}
