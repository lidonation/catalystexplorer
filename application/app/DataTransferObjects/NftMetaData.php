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
            return self::createDefault();
        }

        return new self(
            campaign_name: $data['campaign_name'] ?? '',
            yes_votes: $data['yes_votes'] ?? '0',
            no_votes: $data['no_votes'] ?? '0',
            role: $data['role'] ?? '',
            project_title: $data['project_title'] ?? ''
        );
    }

    public static function createDefault(): static
    {
        return new self('', '0', '0', '', '');
    }
}
