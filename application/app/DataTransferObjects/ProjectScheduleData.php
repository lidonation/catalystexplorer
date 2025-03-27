<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class ProjectScheduleData extends Data
{
    public function __construct(

        public string $hash,

        public string $title,

        public string $url,

        public ?int $proposal_id,

        public ?int $fund_id,

        public ?int $project_id,

        public ?string $created_at,

        public ?int $budget,

        public ?int $milestones_qty,

        public float $funds_distributed,

        public string $starting_date,

        public string $currency,

        public string $status,

        #[MapInputName('onTrack')]
        public ?bool $on_track,

        public ?ProposalData $proposal,

        #[DataCollectionOf(MilestoneData::class)]
        public ?DataCollection $milestones
    ) {}
}
