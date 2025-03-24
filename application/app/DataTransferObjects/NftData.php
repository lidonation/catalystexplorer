<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Carbon\Carbon;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NftData extends Data
{
    public function __construct(
        public int $id,
        public int $user_id,
        public int $artist_id,
        public int $model_id,
        public string $model_type,
        public string $storage_link,
        public string $preview_link,
        public string $name,
        public string $owner_address,
        public string $description,
        public string $rarity,
        public string $status,
        public NftMetaData $metadata,
        public ?Carbon $minted_at,
        public int $qty,
        public ?Carbon $created_at,
        public ?Carbon $updated_at,
        public ?Carbon $deleted_at,
        public array $metas,
    ) {}

    /**
     * Convert date strings into Carbon instances.
     */
    public static function fromArray(array $data): static
    {
        return new self(
            id: $data['id'],
            user_id: $data['user_id'],
            artist_id: $data['artist_id'],
            model_id: $data['model_id'],
            model_type: $data['model_type'],
            storage_link: $data['storage_link'],
            preview_link: $data['preview_link'],
            name: $data['name'],
            owner_address: $data['owner_address'],
            description: $data['description'],
            rarity: $data['rarity'],
            status: $data['status'],
            metadata: $data['metadata'],
            minted_at: isset($data['minted_at']) ? Carbon::parse($data['minted_at']) : null,
            qty: $data['qty'],
            created_at: isset($data['created_at']) ? Carbon::parse($data['created_at']) : null,
            updated_at: isset($data['updated_at']) ? Carbon::parse($data['updated_at']) : null,
            deleted_at: isset($data['deleted_at']) ? Carbon::parse($data['deleted_at']) : null,
            metas: $data['metas'],
        );
    }
}
