<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NftMetaData extends Data
{
    public function __construct(
        public string $campaign_name,
        public string $yes_votes,
        public string $no_votes,
        public string $role,
        public string $project_title
    ) {}

    public static function fromArray(?array $data = null): static
    {
        if ($data === null) {
            return new self('', '0', '0', '', '');
        }

        return new self(
            campaign_name: (string) ($data['campaign_name'] ?? ''),
            yes_votes: (string) ($data['yes_votes'] ?? '0'),
            no_votes: (string) ($data['no_votes'] ?? '0'),
            role: (string) ($data['role'] ?? ''),
            project_title: (string) ($data['project_title'] ?? '')
        );

    }
}
