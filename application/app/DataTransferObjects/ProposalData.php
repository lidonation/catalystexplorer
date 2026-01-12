<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class ProposalData extends Data
{
    public function __construct(
        public string $id,

        public ?CampaignData $campaign,

        #[TypeScript('projectSchedule')]
        public ?ProjectScheduleData $schedule,

        public ?string $title,

        public ?string $slug,

        #[TypeScriptOptional]
        public ?string $website,

        #[TypeScriptOptional]
        public ?string $excerpt,

        #[TypeScriptOptional]
        public mixed $content,

        #[TypeScriptOptional]
        public ?float $amount_requested,

        #[TypeScriptOptional]
        public ?float $amount_received,

        #[TypeScriptOptional]
        public ?string $definition_of_success,

        public ?string $status,

        #[TypeScriptOptional]
        public ?string $funding_status,

        #[TypeScriptOptional]
        public ?string $funded_at,

        #[TypeScriptOptional]
        public ?string $deleted_at,

        #[TypeScriptOptional]
        public ?string $funding_updated_at,

        #[TypeScriptOptional]
        public ?int $yes_votes_count,

        #[TypeScriptOptional]
        public ?int $no_votes_count,

        #[TypeScriptOptional]
        public ?int $abstain_votes_count,

        #[TypeScriptOptional]
        public ?string $comment_prompt,

        #[TypeScriptOptional]
        public ?string $social_excerpt,

        #[TypeScriptOptional]
        public ?string $ideascale_link,

        #[TypeScriptOptional]
        public ?string $projectcatalyst_io_link,

        #[TypeScriptOptional]
        public ?string $type,

        #[TypeScriptOptional]
        public ?string $meta_title,

        #[TypeScriptOptional]
        public ?string $problem,

        #[TypeScriptOptional]
        public ?string $solution,

        #[TypeScriptOptional]
        public ?string $experience,

        // Other attributes
        #[TypeScriptOptional]
        public ?string $currency,

        #[TypeScriptOptional]
        public ?array $minted_nfts_fingerprint,

        #[TypeScriptOptional]
        public ?int $ranking_total,

        #[TypeScriptOptional]
        public ?int $alignment_score,

        #[TypeScriptOptional]
        public ?int $feasibility_score,

        #[TypeScriptOptional]
        public ?int $auditability_score,

        #[TypeScriptOptional]
        public ?string $quickpitch,

        #[TypeScriptOptional]
        public ?int $quickpitch_length,

        #[TypeScriptOptional]
        public ?int $project_length,

        #[MapOutputName('users')]
        #[DataCollectionOf(IdeascaleProfileData::class)]
        public ?DataCollection $users,

        #[MapOutputName('team')]
        #[DataCollectionOf(ProposalProfileData::class)]
        public ?DataCollection $team,

        #[MapOutputName('reviews')]
        #[DataCollectionOf(ReviewData::class)]
        public ?DataCollection $reviews,

        public ?FundData $fund,

        public ?bool $opensource,

        public ?string $link,

        #[TypeScriptOptional]
        public ?int $order,

        #[TypeScriptOptional]
        public ?string $user_rationale,

        #[MapOutputName('catalyst_profiles')]
        #[DataCollectionOf(CatalystProfileData::class)]
        public ?DataCollection $catalyst_profiles,

        #[TypeScriptOptional]
        public ?bool $is_claimed,

        #[TypeScriptOptional]
        public ?string $quickpitch_thumbnail,

        #[TypeScriptOptional]
        public ?int $connections_count,

        #[TypeScriptOptional]
        public ?int $completed_proposals_count,

        #[TypeScriptOptional]
        public ?int $outstanding_proposals_count,

        #[TypeScriptOptional]
        #[DataCollectionOf(LinkData::class)]
        public ?DataCollection $links,

        #[TypeScriptOptional]
        public mixed $meta_info,

    ) {}
}
