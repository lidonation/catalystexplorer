<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NftMetaData extends Data
{
    public function __construct(
        public string $campaign_name,
        public string $yes_votes,
        public string $no_votes,
        public string $role,
    ) {}
}
