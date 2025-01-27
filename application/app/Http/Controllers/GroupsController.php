<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\GroupData;
use App\Enums\QueryParamsEnum;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupsController extends Controller
{
    protected int $currentPage;

    protected int $limit = 24;

    public function index(Request $request): Response
    {
        $this->setFilters($request);

        return Inertia::render('Groups/Index', [
            'groups' => $this->query(),
        ]);
    }

    public function group(Request $request, Group $group): Response
    {
        return Inertia::render('Groups/Group', [
            'group' => GroupData::from($group)
        ]);
    }

    protected function setFilters(Request $request)
    {
        $this->limit = (int) $request->input(QueryParamsEnum::PER_PAGE, 24);
        $this->currentPage = (int) $request->input(QueryParamsEnum::PAGE, 1);
    }

    protected function query()
    {
        // Fetch paginated data
        $groups = Group::paginate($this->limit, ['*'], 'page', $this->currentPage);

        // Remap items to DTOs
        $groups->getCollection()->transform(function ($user) {
            return GroupData::from($user);
        });

        return $groups->onEachSide(1)->toArray();
    }
}
