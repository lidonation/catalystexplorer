<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Models\Proposal;
use Illuminate\Database\Eloquent\Builder;

/**
 * API Platform provider for Proposal resource with campaign eager loading
 * This provider only applies to API Platform requests and includes campaign data
 */
final class ProposalProvider implements ProviderInterface
{
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof CollectionOperationInterface) {
            // For collection operations, return a paginator that API Platform can work with
            $query = Proposal::query()->with(['campaign']);
            
            // Let API Platform handle the pagination by returning the builder
            return $query;
        }

        // Single item endpoint: resolve by hash and eager load campaign
        if (!array_key_exists('hash', $uriVariables)) {
            return null;
        }

        $proposal = Proposal::with(['campaign'])
            ->where('hash', $uriVariables['hash'])
            ->first();

        return $proposal;
    }
}
