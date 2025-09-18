<?php

declare(strict_types=1);

namespace App\Invokables;

use Illuminate\Support\Facades\Log;

final class DecodeTransactionMetadataKey0
{
    /**
     * Decode Key 0 (catalyst_id) from Cardano transaction metadata
     *
     * @param  array  $metadata  The transaction metadata array
     * @return string|null The decoded catalyst_id or null if not found
     */
    public function __invoke(array $metadata): ?string
    {
        Log::info('DecodeKey0: Starting decode process', [
            'metadata_keys' => array_keys($metadata),
            'metadata_count' => count($metadata),
        ]);

        try {
            $key0Value = $this->findKey0($metadata);

            if ($key0Value === null) {
                Log::warning('DecodeKey0: Key 0 not found in metadata', [
                    'available_keys' => array_keys($metadata),
                ]);

                return null;
            }

            Log::info('DecodeKey0: Found Key 0', [
                'value_type' => gettype($key0Value),
                'value_preview' => is_string($key0Value) ? substr($key0Value, 0, 50) : json_encode($key0Value),
            ]);

            $catalystId = $this->decodeValue($key0Value);

            if ($catalystId !== null) {
                Log::info('DecodeKey0: Successfully decoded catalyst_id', [
                    'catalyst_id' => $catalystId,
                    'is_valid_uuid' => $this->isValidUuid($catalystId),
                ]);
            } else {
                Log::warning('DecodeKey0: Failed to decode Key 0 value', [
                    'raw_value' => $key0Value,
                ]);
            }

            return $catalystId;
        } catch (\Exception $e) {
            Log::error('DecodeKey0: Exception during decode', [
                'error' => $e->getMessage(),
                'metadata_preview' => json_encode(array_slice($metadata, 0, 3, true)),
            ]);

            throw new \Exception('Key 0 decoding failed: '.$e->getMessage());
        }
    }

    private function findKey0(array $metadata)
    {
        if (array_key_exists(0, $metadata)) {
            Log::debug('DecodeKey0: Found numeric key 0');

            return $metadata[0];
        }

        if (array_key_exists('0', $metadata)) {
            Log::debug('DecodeKey0: Found string key "0"');

            return $metadata['0'];
        }

        foreach ($metadata as $key => $value) {
            if (is_array($value)) {
                Log::debug('DecodeKey0: Searching nested array', ['parent_key' => $key]);
                $result = $this->findKey0($value);
                if ($result !== null) {
                    Log::debug('DecodeKey0: Found Key 0 in nested structure', ['parent_key' => $key]);

                    return $result;
                }
            }
        }

        return null;
    }

    private function decodeValue($value): ?string
    {
        if (is_string($value)) {
            Log::debug('DecodeKey0: Processing string value', ['length' => strlen($value)]);

            return trim($value);
        }
        if (is_array($value) && isset($value['bytes'])) {
            Log::debug('DecodeKey0: Processing hex bytes', ['hex' => $value['bytes']]);

            return $this->hexToUuid($value['bytes']);
        }
        if (is_array($value) && isset($value[0]) && is_string($value[0])) {
            Log::debug('DecodeKey0: Processing array with string element');

            return $this->decodeValue($value[0]);
        }

        if (is_array($value) && $this->isNumericArray($value)) {
            Log::debug('DecodeKey0: Processing numeric array', ['length' => count($value)]);
            $hexString = $this->numericArrayToHex($value);
            if ($hexString) {
                return $this->hexToUuid($hexString);
            }
        }

        Log::warning('DecodeKey0: Unable to decode value format', [
            'type' => gettype($value),
            'value' => is_scalar($value) ? $value : json_encode($value),
        ]);

        return null;
    }

    private function hexToUuid(string $hex): ?string
    {
        $hex = preg_replace('/[^a-fA-F0-9]/', '', $hex);

        if (strlen($hex) !== 32) {
            Log::warning('DecodeKey0: Invalid hex length for UUID', [
                'expected' => 32,
                'actual' => strlen($hex),
                'hex' => $hex,
            ]);

            return null;
        }

        $uuid = sprintf(
            '%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20, 12)
        );

        Log::debug('DecodeKey0: Converted hex to UUID', [
            'hex' => $hex,
            'uuid' => $uuid,
        ]);

        return $uuid;
    }

    private function isNumericArray(array $array): bool
    {
        foreach ($array as $value) {
            if (! is_numeric($value)) {
                return false;
            }
        }

        return true;
    }

    private function numericArrayToHex(array $array): ?string
    {
        if (count($array) !== 16) {
            return null;
        }

        $hex = '';
        foreach ($array as $byte) {
            $hex .= sprintf('%02x', (int) $byte);
        }

        return $hex;
    }

    private function isValidUuid(string $uuid): bool
    {
        $pattern = '/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/';

        return preg_match($pattern, $uuid) === 1;
    }
}
