<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Model;
use App\Models\User;
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
        return $this->hashIds->encode([$id]);
    }

    public function decode($hashId): int
    {

        if (is_int($hashId)) {
            return $hashId;
        }
        dd($this->hashIds->decode($hashId));

        return $this->hashIds->decode($hashId)[0];
    }
    public function show(string $hashedId)
    {
        // Decode the hashed ID
        $userId = (new HashIdService(new User))->decode($hashedId);
        if (!is_numeric($userId)) {
            throw new \Exception("Decoded user ID is not a valid integer.");
        }
        \Log::info('Decoded User ID:', ['id' => $userId]);

        // Query the database using the decoded numeric ID
        $user = User::findOrFail($userId);
        \Log::info('User:', ['user' => $user]);

        return response()->json($user);
    }
}
