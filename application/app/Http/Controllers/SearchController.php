<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\CampaignRepository;
use App\Repositories\CommunityRepository;
use App\Repositories\GroupRepository;
use App\Repositories\IdeascaleProfileRepository;
use App\Repositories\PostRepository;
use App\Repositories\ProposalRepository;
use App\Repositories\ReviewRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(
        Request $request,
        ProposalRepository $proposals,
        IdeascaleProfileRepository $people,
        GroupRepository $groups,
        CommunityRepository $communities,
        ReviewRepository $reviews,
        PostRepository $posts
    ): Response {
        $searchTerm = $request->input('q');
        $filterList = $this->getFilterList($request);

        $repositories = [
            'proposals' => $proposals,
            'people' => $people,
            'groups' => $groups,
            'communities' => $communities,
            'reviews' => $reviews,
        ];

        $counts = $this->getResultsCounts($repositories, $searchTerm, $filterList, $posts);

        $searchData = $this->getSearchResults($repositories, $searchTerm, $filterList, $posts);

        return Inertia::render('S/Index', [
            ...$searchData,
            'counts' => $counts,
        ]);
    }

    private function getFilterList(Request $request): array
    {
        $filters = $request->input('f');
        return $filters ? explode('-', $filters) : [];
    }

    private function getResultsCounts(array $repositories, string $searchTerm, array $filterList, PostRepository $posts): array
    {
        $counts = [];
        foreach ($repositories as $key => $repository) {
            if (empty($filterList) || in_array($key, $filterList)) {
                $counts[$key] = $repository->countSearchResults($searchTerm);
            }
        }

        if (empty($filterList) || in_array('posts', $filterList)) {
            $posts->setQuery([
                'tags' => 'project-catalyst',
                'search' => $searchTerm
            ]);
            $counts['posts'] = $posts->paginate(10)->collect()->count();
        }
        return $counts;
    }

    private function getSearchResults(array $repositories, string $searchTerm, array $filterList, PostRepository $posts): array
    {
        $searchData = [];

        foreach ($repositories as $key => $repository) {
            if (empty($filterList) || in_array($key, $filterList)) {
                $searchData[$key] = Inertia::optional(
                    fn() => $repository->search($searchTerm)->raw()
                );
            }
        }

        if (empty($filterList) || in_array('posts', $filterList)) {
            $searchData['posts'] = Inertia::optional(function () use ($posts, $searchTerm) {
                $posts->setQuery([
                    'tags' => 'project-catalyst',
                    'search' => $searchTerm
                ]);

                return $posts->paginate(10)->collect()->all();
            });
        }

        return $searchData;
    }
}
