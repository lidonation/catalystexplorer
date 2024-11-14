<?php declare(strict_types=1);

namespace App\DTOs;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class AnnouncementData extends Data
{
    public string $title;

    public string $content;

    #[TypeScriptOptional]
    public ?string $label = null;

    #[TypeScriptOptional]
    public ?string $event_starts_at = null;

    #[TypeScriptOptional]
    public ?string $event_ends_at = null;

    #[TypeScriptOptional]
    public ?array $cta = null;

    public int $user_id;
}
