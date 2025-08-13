<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class MilestonePoasSignoffData extends Data
{
    public function __construct(

        public string $id,

        public string $created_at,

        public string $user_id
    ) {}
}
