<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Models\Proposal;

readonly class ProposalItemProvider implements ProviderInterface
{
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // Get the id from URI variables
        $id = $uriVariables['id'] ?? null;
        
        if (!$id) {
            return null;
        }

        // Find the proposal by UUID and eager load the campaign
        $proposal = Proposal::with('campaign', 'fund')->find($id);
        
        return $proposal;
    }
}
