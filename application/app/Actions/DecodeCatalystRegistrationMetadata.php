<?php

declare(strict_types=1);

namespace App\Actions;

final class DecodeCatalystRegistrationMetadata
{
    /**
     * Decodes the Catalyst Registration Metadata (typically Key 10 chunks from Transaction).
     */
    public function __invoke(array|string $jsonInput): array
    {
        try {
            if (is_string($jsonInput)) {
                $inputData = json_decode($jsonInput, true, 512, JSON_THROW_ON_ERROR);
            } else {
                $inputData = $jsonInput;
            }
        } catch (\JsonException $e) {
            return ['error' => 'Invalid JSON input'];
        }

        // 1. Reassemble Chunks (Key "10")
        // The chunks contain the inner CBOR payload structure
        $chunks = $inputData['10'] ?? [];
        // If '10' does not exist, return error, as this decoder is specifically for Key 10 registration
        if (empty($chunks)) {
            return ['error' => "Missing key '10' (chunks) in input"];
        }

        // Clean and join chunks
        $fullHex = '';
        foreach ($chunks as $chunk) {
            $fullHex .= str_replace('0x', '', trim($chunk));
        }

        try {
            $dataBytes = hex2bin($fullHex);
            if ($dataBytes === false) {
                throw new \Exception('hex2bin failed');
            }
        } catch (\Exception $e) {
            return ['error' => 'Invalid hex in chunks: '.$e->getMessage()];
        }

        // 2. Extract Data from Full Hex (Dates, URIs, Keys)

        // Dates (YYMMDD...)
        // Python: re.findall(b"[0-9]{12,14}Z", data_bytes)
        $notBefore = null;
        $notAfter = null;
        if (preg_match_all('/[0-9]{12,14}Z/', $dataBytes, $matches)) {
            $dates = $matches[0];
            $notBefore = $dates[0] ?? null;
            $notAfter = isset($dates[1]) ? $dates[1] : null;
        }

        // URIs (Stake Addr)
        // Python: re.findall(b"web\\+cardano://[a-zA-Z0-9/]+", data_bytes)
        $stake = null;
        if (preg_match_all('/web\+cardano:\/\/[a-zA-Z0-9\/]+/', $dataBytes, $matches)) {
            $uris = $matches[0];
            if (! empty($uris)) {
                $parts = explode('/', $uris[0]);
                $stake = end($parts);
            }
        }

        // Role 0 Public Key (Ed25519 OID scanning)
        // OID: 06 03 2b 65 70
        // BitString Header: 03 21 00
        $oidMarker = '06032b6570';
        $pkMarker = '032100';
        $role0Pk = null;
        $catalystId = null;

        $oidIdx = strpos($fullHex, $oidMarker);
        if ($oidIdx !== false) {
            $pkIdx = strpos($fullHex, $pkMarker, $oidIdx);
            if ($pkIdx !== false) {
                $start = $pkIdx + 6;
                // fullHex is hex string, so each byte is 2 chars.
                // Python: full_hex[start:start+64] (32 bytes * 2)
                $role0Pk = substr($fullHex, $start, 64);

                // Generate Catalyst ID
                if ($role0Pk) {
                    try {
                        $keyBytes = hex2bin($role0Pk);
                        if ($keyBytes !== false) {
                            // PHP base64 is standard, Python urlsafe_b64encode is URL-safe.
                            // We need to make PHP base64 URL-safe manually.
                            $b64 = base64_encode($keyBytes);
                            $b64 = str_replace(['+', '/'], ['-', '_'], $b64);
                            $b64 = rtrim($b64, '=');
                            $catalystId = "id.catalyst://cardano/{$b64}";
                        }
                    } catch (\Exception $e) {
                        // ignore
                    }
                }
            }
        }

        // 3. Extract Top-Level Fields from JSON Keys

        // Purpose (Key "0")
        $purposeHex = str_replace('0x', '', $inputData['0'] ?? '');
        $purposeUuid = null;
        if (strlen($purposeHex) >= 32) {
            $p = substr($purposeHex, 0, 32);
            $purposeUuid = sprintf(
                '%s-%s-%s-%s-%s',
                substr($p, 0, 8),
                substr($p, 8, 4),
                substr($p, 12, 4),
                substr($p, 16, 4),
                substr($p, 20)
            );
        }

        // Validation Signature (Key "99")
        $valSig = isset($inputData['99']) ? str_replace('0x', '', $inputData['99']) : '';

        // Previous Tx ID (Key "2")
        $prevTx = $inputData['2'] ?? null;
        if ($prevTx) {
            $prevTx = str_replace('0x', '', $prevTx);
        }

        // Transaction Inputs Hash (Key "1")
        $txInputs = $inputData['1'] ?? null;
        if ($txInputs) {
            $txInputs = str_replace('0x', '', $txInputs);
        }

        $fmtDate = function ($d) {
            if (! $d) {
                return null;
            }

            return sprintf(
                '%s-%s-%sT%s:%s:%sZ',
                substr($d, 0, 4),
                substr($d, 4, 2),
                substr($d, 6, 2),
                substr($d, 8, 2),
                substr($d, 10, 2),
                substr($d, 12, 2)
            );
        };

        return [
            'identity' => [
                'role0_public_key' => $role0Pk,
                'stake_address' => $stake,
                'catalyst_id' => $catalystId,
            ],
            // "catalyst_profile_id" matches "catalyst_id".
            'catalyst_profile_id' => $catalystId,

            'transaction_links' => [
                'purpose_uuid' => $purposeUuid,
                'validation_signature' => $valSig,
                'previous_tx_id' => $prevTx,
                'tx_inputs_hash' => $txInputs,
            ],
            'validity' => [
                'not_before' => $fmtDate($notBefore),
                'not_after' => $fmtDate($notAfter),
            ],
            'type' => $prevTx ? 'UpdateRegistration' : 'RootRegistration',
        ];
    }
}
