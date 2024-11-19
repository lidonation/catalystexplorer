<?php declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;

#[TypeScript]
class CampaignData extends Data
{
  public function __construct(
    public int $id,

    #[TypeScriptOptional]
    public int $fund_id,

    public string $title,

    public string $meta_title,

    public string $slug,
    #[TypeScriptOptional]
    public ?string $excerpt,

    #[TypeScriptOptional]
    public ?string $comment_prompt,

    #[TypeScriptOptional]
    public ?string $content,

    #[TypeScriptOptional]
    public float $amount,

    public string $created_at,

    public string $updated_at,

    #[TypeScriptOptional]
    public ?string $label,

    public ?string $currency
  ) {}
}
