<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ClaimedProfileData extends Data
{
    public function __construct(
        public string $id,
        public string $user_id,
        public string $claimed_at,
    ) {}
}
