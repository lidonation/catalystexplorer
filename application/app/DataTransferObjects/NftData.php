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
        public int $id = 0,
        public int $user_id = 0,
        public int $artist_id = 0,
        public int $model_id = 0,
        public string $profile_hash = '',
        public string $model_type = '',
        public string $storage_link = '',
        public string $preview_link = '',
        public string $name = '',
        public string $owner_address = '',
        public string $description = '',
        public string $rarity = '',
        public string $status = '',
        public string $fingerprint = '',
        public ?NftMetaData $metadata = null,
        public ?NMKRNftData $required_nft_metadata = null,
        public ?Carbon $minted_at = null,
        public int $qty = 0,
        public ?Carbon $created_at = null,
        public ?Carbon $updated_at = null,
        public ?Carbon $deleted_at = null,
        public array $metas = [],
    ) {}

    /**
     * Convert date strings into Carbon instances.
     */
    public static function fromArray(array $data): static
    {
        return new self(
            id: $data['id'] ?? 0,
            user_id: $data['user_id'] ?? 0,
            artist_id: $data['artist_id'] ?? 0,
            model_id: $data['model_id'] ?? 0,
            profile_hash: $data['profile_hash'] ?? '',
            model_type: $data['model_type'] ?? '',
            storage_link: $data['storage_link'] ?? '',
            preview_link: $data['preview_link'] ?? '',
            name: $data['name'] ?? '',
            owner_address: $data['owner_address'] ?? '',
            description: $data['description'] ?? '',
            rarity: $data['rarity'] ?? '',
            status: $data['status'] ?? '',
            fingerprint: $data['fingerprint'] ?? '',
            metadata: NftMetaData::fromArray($data['metadata'] ?? null),
            required_nft_metadata: isset($data['required_nft_metadata']) && is_array($data['required_nft_metadata'])
            ? NMKRNftData::fromArray($data['required_nft_metadata'])
            : null,
            minted_at: ! empty($data['minted_at']) ? Carbon::parse($data['minted_at']) : null,
            qty: $data['qty'] ?? 0,
            created_at: ! empty($data['created_at']) ? Carbon::parse($data['created_at']) : null,
            updated_at: ! empty($data['updated_at']) ? Carbon::parse($data['updated_at']) : null,
            deleted_at: ! empty($data['deleted_at']) ? Carbon::parse($data['deleted_at']) : null,
            metas: $data['metas'] ?? [],
        );
    }
}
