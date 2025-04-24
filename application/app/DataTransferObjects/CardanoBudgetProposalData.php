<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CardanoBudgetProposalData extends Data
{
    public function __construct(
        #[MapOutputName('govToolUserId')]
        public int $govtool_user_id,

        #[MapOutputName('govToolProposalId')]
        public int $govtool_proposal_id,

        #[MapOutputName('proposalName')]
        public ?string $proposal_name,

        #[MapOutputName('govToolUserName')]
        public ?string $govtool_username,

        #[MapOutputName('adaAmount')]
        public ?int $ada_amount,

        #[TypeScriptOptional]
        #[MapOutputName('budgetCat')]
        public ?string $budget_cat,

        #[TypeScriptOptional]
        #[MapOutputName('committeeName')]
        public ?string $committee_name,

        #[TypeScriptOptional]
        #[MapOutputName('updatedAt')]
        public ?string $updated_at,

        #[TypeScriptOptional]
        #[MapOutputName('commentsCount')]
        public ?int $prop_comments_number,

        #[TypeScriptOptional]
        #[MapOutputName('proposalBenefit')]
        public ?string $proposal_benefit,
    ) {}
}
