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
        #[MapOutputName('govToolUserName')]
        public ?string $govtool_username,

        #[MapOutputName('govToolUserId')]
        public int $govtool_user_id,

        #[MapOutputName('govToolProposalId')]
        public int $govtool_proposal_id,

        #[TypeScriptOptional]
        #[MapOutputName('intersectAdminFurtherText')]
        public ?string $intersect_admin_further_text,
    ) {}
}
