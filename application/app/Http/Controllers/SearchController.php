<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\CommunityRepository;
use App\Repositories\GroupRepository;
use App\Repositories\IdeascaleProfileRepository;
use App\Repositories\PostRepository;
use App\Repositories\ProposalRepository;
use App\Repositories\ReviewRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(
        Request $request,
        ProposalRepository $proposals,
        IdeascaleProfileRepository $ideascaleProfiles,
        GroupRepository $groups,
        CommunityRepository $communities,
        ReviewRepository $reviews,
        PostRepository $posts
    ): Response {
        $searchTerm = $request->input(key: 'q');
        $filterList = $this->getFilterList(request: $request);

        $repositories = [
            'proposals' => $proposals,
            'ideascaleProfiles' => $ideascaleProfiles,
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

        return $filters ? explode(',', $filters) : [];
    }

    private function getResultsCounts(array $repositories, string $searchTerm, array $filterList, PostRepository $posts): array
    {
        $counts = [];
        foreach ($repositories as $key => $repository) {
            if (empty($filterList) || in_array($key, $filterList)) {
                $counts[$key] = $repository->countSearchResults($searchTerm);
            }
        }

        if (empty($filterList) || in_array('articles', $filterList)) {
            $posts->setQuery([
                'tags' => 'project-catalyst',
                'search' => $searchTerm,
            ]);

            $posts = $this->getPosts($posts, $searchTerm);

            $counts['articles'] = empty($posts) ? 0 : count($posts);
        }

        return $counts;
    }

    private function getSearchResults(array $repositories, string $searchTerm, array $filterList, PostRepository $posts): array
    {
        $searchData = [];

        foreach ($repositories as $key => $repository) {
            if (empty($filterList) || in_array($key, $filterList)) {
                $searchData[$key] = Inertia::optional(
                    fn () => $repository->search($searchTerm)->raw()
                );
            }
        }

        if (empty($filterList) || in_array('articles', $filterList)) {
            $searchData['articles'] = Inertia::optional(function () use ($posts, $searchTerm) {
                return $this->getPosts($posts, $searchTerm);
            });
        }

        return $searchData;
    }

    public function getPosts(PostRepository $postRepository, $searchTerm): array|LengthAwarePaginator
    {

        $postRepository->setQuery([
            'tags' => 'project-catalyst',
            'search' => $searchTerm,
        ]);

        $posts = [];

        try {
            $posts = $postRepository->paginate(10)->collect()->all();
        } catch (\Throwable $e) {
            report($e);

            $posts = new \Illuminate\Pagination\LengthAwarePaginator(
                collect([]),
                0,
                4,
                request('page', 1),
                [
                    'path' => request()->url(),
                    'query' => request()->query(),
                ]
            );
        }

        return $posts;
    }
}
