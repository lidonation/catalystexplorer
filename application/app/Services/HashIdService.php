<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Sqids\Sqids;

class HashIdService
{
    public Sqids $hashIds;

    public function __construct(
        Model|Authenticatable $model
    ) {
        $connections = config('hashids.connections');
        if (isset($connections[$model::class])) {
            $alphabet = $connections[$model::class]['alphabet'];
        } else {
            $alphabet = $connections['default']['alphabet'];
        }
        $this->hashIds = new Sqids(
            $alphabet,
            10
        );
    }

    public function encode($id): string
    {
        if ($id === null) {
            return '';
        }

        if (! is_numeric($id) && is_string($id)) {
            $decoded = $this->hashIds->decode($id);
            if (! empty($decoded)) {
                $id = $decoded[0];
            }
        }

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
