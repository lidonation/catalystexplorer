<?php declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class ProposalData extends Data
{
    public function __construct(
        public ?int $id,

        public ?int $user_id,

        public ?int $campaign_id,

        public ?int $fund_id,

        public ?array $title,

        public string $slug,

        public ?string $website,

        #[TypeScriptOptional]
        public ?string $excerpt,

        public float $amount_requested,

        public ?float $amount_received,

        #[TypeScriptOptional]
        public ?string $definition_of_success,

        #[TypeScriptOptional]
        public ?string $status,

        #[TypeScriptOptional]
        public ?string $funding_status,

        #[TypeScriptOptional]
        public ?array $meta_data,

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
        public ?int $team_id,

        #[TypeScriptOptional]
        public ?string $ideascale_link,

        #[TypeScriptOptional]
        public ?string $type,

        #[TypeScriptOptional]
        public ?array $meta_title,

        #[TypeScriptOptional]
        public ?array $problem,

        #[TypeScriptOptional]
        public ?array $solution,

        #[TypeScriptOptional]
        public ?array $experience,

        #[TypeScriptOptional]
        public ?array $content,

        // Other attributes
        #[TypeScriptOptional]
        public ?string $currency,

        public bool $opensource = false,

        #[TypeScriptOptional]
        public ?int $ranking_total,

        #[TypeScriptOptional]
        public ?string $quickpitch,

        #[TypeScriptOptional]
        public ?int $quickpitch_length
    ) {}
}
