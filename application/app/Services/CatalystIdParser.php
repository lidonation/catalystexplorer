<?php

declare(strict_types=1);

namespace App\Services;

class CatalystIdParser
{
    /**
     * Parse a Catalyst ID string into its components.
     *
     * Format: id.catalyst://Username@Network/PublicKey/Role/Index
     * Example: id.catalyst://Anwar@cardano/btBMTJX3M.../3/0
     *
     * @return array|null Returns array with components or null if invalid
     */
    public function parse(string $catalystId): ?array
    {
        // regex pattern to match the described format
        // 1: Username
        // 2: Network
        // 3: PublicKey
        // 4: Role (optional)
        // 5: Index (optional)
        $pattern = '/^id\.catalyst:\/\/([^@]+)@([^\/]+)\/([^\/]+)(?:\/(\d+)(?:\/(\d+))?)?$/';

        if (preg_match($pattern, $catalystId, $matches)) {
            return [
                'full_id' => $catalystId,
                'username' => urldecode($matches[1]),
                'network' => $matches[2],
                'public_key' => $matches[3],
                'role' => isset($matches[4]) && $matches[4] !== '' ? (int) $matches[4] : null,
                'index' => isset($matches[5]) && $matches[5] !== '' ? (int) $matches[5] : null,
            ];
        }

        return null;
    }
}
