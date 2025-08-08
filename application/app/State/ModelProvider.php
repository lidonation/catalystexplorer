<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;

/**
 * Generic provider for API Platform resources backed by Eloquent + DTOs
 * - For collection: paginated results using ?page and ?itemsPerPage (max 60)
 * - For item: resolves {hash} using Model::byHash($hash)
 * - Returns Spatie Data DTOs via ::collect() / ::from()
 * 
 * NOTE: This provider is not currently used. The Proposal model uses
 * API Platform's built-in Eloquent integration instead.
 */
final class ModelProvider implements ProviderInterface
{
    public function __construct() {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // The Eloquent model class for this resource
        $modelClass = $operation->getClass();
        // We expect a DTO named {ShortName}Data in App\DataTransferObjects
        $dtoClass = '\\App\\DataTransferObjects\\' . $operation->getShortName() . 'Data';

        if (!class_exists($dtoClass) || !class_exists($modelClass)) {
            return null;
        }

        if ($operation instanceof CollectionOperationInterface) {
            // Eager-load common relations for richer DTOs (safe even if model lacks them)
            $with = [
                'campaign', 'schedule', 'fund', //'users', 'team'
            ];
            $query = (method_exists($modelClass, 'with'))
                ? $modelClass::with($with)
                : $modelClass::query();

            // Get all models - API Platform will handle pagination
            $models = $query->get();

            // Return a Spatie Data collection so API Platform serializes properly
            return $dtoClass::collect($models);
        }

        // Single item by {hash}
        if (!array_key_exists('hash', $uriVariables)) {
            return null;
        }

        // Resolve byHash then eager-load for DTO richness
        $model = $modelClass::byHash($uriVariables['hash']);
        if (!$model) {
            return null;
        }

        if (method_exists($model, 'load')) {
            $model->load(['campaign', 'schedule', 'fund']);
        }

        return $dtoClass::from($model);
    }
}

