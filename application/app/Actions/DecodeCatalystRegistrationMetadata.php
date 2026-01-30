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

        $fullHex = '';

        if (isset($inputData['x509_data']['data'])) {
            $fullHex = str_replace('0x', '', trim($inputData['x509_data']['data']));
        } elseif (isset($inputData['10'])) {
            $chunks = $inputData['10'];
            foreach ($chunks as $chunk) {
                $fullHex .= str_replace('0x', '', trim($chunk));
            }
        } elseif (isset($inputData['11'])) {
            $chunks = $inputData['11'];
            foreach ($chunks as $chunk) {
                $fullHex .= str_replace('0x', '', trim($chunk));
            }
        } else {
            return ['error' => "Missing key '10', '11' or 'x509_data' in input"];
        }

        try {
            $dataBytes = hex2bin($fullHex);
            if ($dataBytes === false) {
                throw new \Exception('hex2bin failed');
            }
        } catch (\Exception $e) {
            return ['error' => 'Invalid hex in payload: '.$e->getMessage()];
        }

        $notBefore = null;
        $notAfter = null;
        if (preg_match_all('/[0-9]{12,14}Z/', $dataBytes, $matches)) {
            $dates = $matches[0];
            $notBefore = $dates[0] ?? null;
            $notAfter = isset($dates[1]) ? $dates[1] : null;
        }

        $stake = null;
        if (preg_match('/web\+cardano:\/\/(?:addr\/)?(stake1[a-z0-9]+)/i', $dataBytes, $matches)) {
            $range = $matches[1];

            // Enforce standard length for stake address (59 chars: 'stake1' + 53)
            if (strlen($range) > 59) {
                $range = substr($range, 0, 59);
            }

            // Fix for potential trailing derivation index '0' acting as artifact
            if (str_ends_with($range, '0')) {
                $range = substr($range, 0, -1);
            }

            $stake = $range;
        }

        // Try to extract username from X.509 CN (Common Name) field
        $username = null;
        if (preg_match('/CN=([^,\x00]+)/', $dataBytes, $matches)) {
            $username = trim($matches[1]);
        }

        $oidMarker = '06032b6570';
        $pkMarker = '032100';
        $role0Pk = null;
        $catalystId = null;

        $oidIdx = strpos($fullHex, $oidMarker);
        if ($oidIdx !== false) {
            $pkIdx = strpos($fullHex, $pkMarker, $oidIdx);
            if ($pkIdx !== false) {
                $start = $pkIdx + 6;
                $role0Pk = substr($fullHex, $start, 64);

                if ($role0Pk) {
                    try {
                        $keyBytes = hex2bin($role0Pk);
                        if ($keyBytes !== false) {
                            $b64 = base64_encode($keyBytes);
                            $b64 = str_replace(['+', '/'], ['-', '_'], $b64);
                            $b64 = rtrim($b64, '=');

                            if ($username) {
                                $catalystId = "id.catalyst://{$username}@cardano/{$b64}/3/0";
                            } else {
                                $catalystId = "id.catalyst://cardano/{$b64}";
                            }
                        }
                    } catch (\Exception $e) {
                    }
                }
            }
        }

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

        $valSig = isset($inputData['99']) ? str_replace('0x', '', $inputData['99']) : '';

        $prevTx = $inputData['2'] ?? null;
        if (! $prevTx && isset($inputData['x509_envelope']['previous_transaction_id'])) {
            $prevTx = $inputData['x509_envelope']['previous_transaction_id'];
        }

        if ($prevTx) {
            $prevTx = str_replace('0x', '', $prevTx);
        }

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
