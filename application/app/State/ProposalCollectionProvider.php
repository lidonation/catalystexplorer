<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Models\Proposal;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

readonly class ProposalCollectionProvider implements ProviderInterface
{
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $request = $context['request'] ?? request();
        
        // Get pagination parameters from request
        $page = max(1, (int) $request->get('page', 1));
        $itemsPerPage = min(50, max(1, (int) $request->get('itemsPerPage', 20)));
        
        // Get total count
        $total = Proposal::count();
        
        // Get paginated results with campaign and fund relations
        $proposals = Proposal::with('campaign', 'fund')
            ->offset(($page - 1) * $itemsPerPage)
            ->limit($itemsPerPage)
            ->get();
        
        // Campaign and fund relations are already loaded via with()
        // API Platform will handle serialization automatically
        
        // Create paginator
        $paginator = new LengthAwarePaginator(
            $proposals,
            $total,
            $itemsPerPage,
            $page,
            [
                'path' => $request->url(),
                'pageName' => 'page',
            ]
        );
        
        return $paginator;
    }
}
