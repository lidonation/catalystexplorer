<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ConnectionData extends Data
{
    public function __construct(
        /** @var ConnectionNodeData[] */
        public array $nodes,

        /** @var ConnectionLinkData[] */
        public array $links,

        public string $rootNodeId,
        public string $rootNodeHash,
        public string $rootNodeType,
    ) {}
}
