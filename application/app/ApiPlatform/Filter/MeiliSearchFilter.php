<?php

declare(strict_types=1);

namespace App\ApiPlatform\Filter;

use ApiPlatform\Metadata\FilterInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Laravel\Scout\Searchable;

/**
 * Meilisearch-powered fuzzy search filter for API Platform resources.
 *
 * When the `search` query param is present, this provider will execute a
 * Meilisearch query using Laravel Scout, providing fuzzy search with typo
 * tolerance, ranking, and other advanced search features.
 */
class MeiliSearchFilter implements ProviderInterface, FilterInterface
{
    public function __construct(
        private ProviderInterface $decorated
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $request = $context['request'] ?? null;

        if (!$request instanceof Request) {
            return $this->decorated->provide($operation, $uriVariables, $context);
        }

        // Get the search query parameter
        $searchQuery = $request->query->get('search');

        if (empty($searchQuery)) {
            return $this->decorated->provide($operation, $uriVariables, $context);
        }

        // Get the resource class from the operation
        $resourceClass = $operation->getClass();

        if (!$resourceClass || !class_exists($resourceClass)) {
            return $this->decorated->provide($operation, $uriVariables, $context);
        }

        // Check if the model uses Searchable trait (required for Meilisearch)
        if (!in_array(Searchable::class, class_uses_recursive($resourceClass))) {
            return $this->decorated->provide($operation, $uriVariables, $context);
        }

        try {
            // Perform Meilisearch using Scout
            $searchResults = $resourceClass::search($searchQuery);

            // Get pagination parameters
            $page = max(1, (int) $request->query->get('page', 1));
            $itemsPerPage = (int) ($operation->getPaginationItemsPerPage() ?? 30);

            // Apply pagination to Scout search
            $paginatedResults = $searchResults->paginate($itemsPerPage, 'page', $page);

            return $paginatedResults;

        } catch (\Exception $e) {
            // Fallback to default provider if Meilisearch fails
            return $this->decorated->provide($operation, $uriVariables, $context);
        }
    }

    /**
     * Get the description of this filter for OpenAPI documentation.
     */
    public function getDescription(string $resourceClass): array
    {
        return [
            'search' => [
                'property' => null,
                'type' => 'string',
                'required' => false,
                'description' => 'Fuzzy search using Meilisearch with typo tolerance and relevance ranking',
                'openapi' => [
                    'example' => 'yoroi wallet',
                    'allowReserved' => false,
                    'allowEmptyValue' => true,
                    'explode' => false,
                ],
            ],
        ];
    }
}
