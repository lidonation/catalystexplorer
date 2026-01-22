<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Controller;
use App\Repositories\BookmarkCollectionRepository;
use App\Repositories\ProposalRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuickSearchController extends Controller
{
    private const MAX_RESULTS = 5;

    public function __construct(
        private ProposalRepository $proposalRepository,
        private BookmarkCollectionRepository $bookmarkCollectionRepository
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $searchTerm = $request->input('q', '');

        if (strlen($searchTerm) < 2) {
            return response()->json([
                'proposals' => [],
                'lists' => [],
            ]);
        }

        $proposals = $this->searchProposals($searchTerm);
        $lists = $this->searchLists($searchTerm);

        return response()->json([
            'proposals' => $proposals,
            'lists' => $lists,
        ]);
    }

    private function searchProposals(string $searchTerm): array
    {
        $results = $this->proposalRepository
            ->search($searchTerm)
            ->raw();

        $proposals = collect($results['hits'] ?? [])
            ->take(self::MAX_RESULTS)
            ->map(function ($hit) {
                return [
                    'id' => (string) $hit['id'],
                    'title' => $hit['title'] ?? '',
                    'slug' => $hit['slug'] ?? '',
                    'fund_label' => $hit['fund']['label'] ?? null,
                    'amount_requested' => $hit['amount_requested'] ?? null,
                    'currency' => $hit['currency'] ?? null,
                ];
            })
            ->toArray();

        return $proposals;
    }

    private function searchLists(string $searchTerm): array
    {
        $results = $this->bookmarkCollectionRepository
            ->search($searchTerm)
            ->raw();

        return collect($results['hits'] ?? [])
            ->take(self::MAX_RESULTS)
            ->map(function ($hit) {
                return [
                    'id' => (string) $hit['id'],
                    'title' => $hit['title'] ?? 'Untitled List',
                    'type' => $hit['list_type'] ?? null,
                    'items_count' => $hit['items_count'] ?? 0,
                ];
            })
            ->toArray();
    }
}
