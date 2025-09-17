<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CatalystProfileData extends Data
{
    public function __construct(
        public ?string $id,

        public ?string $name,

        public ?string $username,

        public ?string $claimed_by,

        public ?string $catalyst_id,
    ) {}
}
