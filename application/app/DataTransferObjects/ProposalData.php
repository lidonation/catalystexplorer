<?php declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Attributes\MapOutputName;
use App\DataTransferObjects\IdeascaleProfileData;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;

#[TypeScript]
final class ProposalData extends Data
{
    public function __construct(
        public ?int $id,

        public ?CampaignData $campaign,

        public ?string $title,

        public string $slug,

        public ?string $website,

        #[TypeScriptOptional]
        public ?string $excerpt,

        #[TypeScriptOptional]
        public $content,

        public float $amount_requested,

        public ?float $amount_received,

        #[TypeScriptOptional]
        public ?string $definition_of_success,

        public string $status,

        public string $funding_status,

//        #[TypeScriptOptional]
//        public ?array $meta_data,

        #[TypeScriptOptional]
        public ?string $funded_at,

        #[TypeScriptOptional]
        public ?string $deleted_at,

        #[TypeScriptOptional]
        public ?string $funding_updated_at,

        public ?int $yes_votes_count,

        public ?int $no_votes_count,

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
        public ?int $ranking_total,

        #[TypeScriptOptional]
        public ?string $quickpitch,

        #[TypeScriptOptional]
        public ?int $quickpitch_length,

        #[MapOutputName('users')]
        #[DataCollectionOf(IdeascaleProfileData::class)]
        public ?DataCollection $users,

        public ?FundData $fund,

        public ?bool $opensource = false
    ) {}
}
