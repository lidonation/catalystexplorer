<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Model;
use Sqids\Sqids;

class HashIdService
{
    public Sqids $hashIds;

    public function __construct(
        Model $model
    ) {
        $connections = config('hashids.connections');
        $alphabet = $connections[$model::class]['alphabet'];
        $this->hashIds = new Sqids(
            $alphabet,
            10
        );
    }

    public function encode($id): string
    {
        return $this->hashIds->encode([$id]);
    }

    public function decode($hashId): int
    {
        if (is_int($hashId)) {
            return $hashId;
        }

        return $this->hashIds->decode($hashId)[0];
    }
}
