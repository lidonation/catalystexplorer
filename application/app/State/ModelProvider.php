<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;

final class ModelProvider implements ProviderInterface
{
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $dtoClass = $operation->getClass();
        $modelClass = '\\App\\Models\\'.trim($operation->getShortName(), 'Data');

        $model = $modelClass::byHash($uriVariables['hash']);
        if (! $model) {
            return null;
        }
        if (! class_exists($dtoClass)) {
            return null;
        }

        return $dtoClass::from($model);
    }
}
