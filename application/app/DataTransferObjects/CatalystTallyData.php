<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CatalystTallyData extends Data
{
    public function __construct(
        public ?string $id,

        public ?int $tally,

        public ?int $overall_rank,

        public ?int $fund_rank,

        public ?int $category_rank,

        public ?float $chance,

        public ?FundData $fund,

        public ?ProposalData $proposal,

    ) {}
}
