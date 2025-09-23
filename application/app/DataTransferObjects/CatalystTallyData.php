<?php

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CatalystTallyData extends Data
{
    public function __construct(
        public ?int $tally,

        public ?int $overall_rank,

        public ?int $fund_rank,

        public ?int $category_rank,

        public ?ProposalData $model,

    ) {}
}
