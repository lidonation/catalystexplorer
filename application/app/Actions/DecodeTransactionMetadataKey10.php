<?php

declare (strict_types=1);

namespace App\Actions;

use Exception;

final class DecodeTransactionMetadataKey10
{
    public function __invoke(array $metadata): array
    {
        try {
            $certificateData = $this->reconstructCertificateFromHexChunks($metadata[10]);

            $publicKeyResult = $this->extractEd25519PublicKey($certificateData);

            if (! $publicKeyResult['success']) {
                throw new Exception('Failed to extract public key: '.$publicKeyResult['error']);
            }

            $profileId = $this->generateCatalystProfileId($publicKeyResult['raw_bytes']);

            $stakeAddress = $this->extractStakeAddress($certificateData);

            return [
                'catalyst_profile_id' => $publicKeyResult['base64'],
                'public_key' => [
                    'hex' => $publicKeyResult['hex'],
                    'base64' => $publicKeyResult['base64'],
                    'raw_bytes' => $publicKeyResult['raw_bytes'],
                ],
                'stake_address' => $stakeAddress,
                'certificate_info' => [
                    'size' => strlen($certificateData),
                    'format' => 'X.509 DER',
                    'algorithm' => 'Ed25519',
                ],
                'metadata_keys' => array_keys($metadata),
                'success' => true,
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'debug_info' => [
                    'metadata_keys' => array_keys($metadata),
                    'key_10_structure' => $this->analyzeKey10Structure($metadata[10] ?? []),
                ],
            ];
        }
    }

    private function reconstructCertificateFromHexChunks(array $hexChunks): string
    {
        $binaryData = '';

        foreach ($hexChunks as $chunk) {
            $chunk = preg_replace('/^0x/i', '', $chunk);

            if (strlen($chunk) % 2 !== 0) {
                $chunk = '0'.$chunk;
            }

            $binary = hex2bin($chunk);
            if ($binary === false) {
                throw new Exception('Invalid hex chunk: '.substr($chunk, 0, 20).'...');
            }

            $binaryData .= $binary;
        }

        return $this->extractCertificateFromCBOR($binaryData);
    }

    private function extractCertificateFromCBOR(string $cborData): string
    {
        $pos = 0;
        $len = strlen($cborData);

        if ($pos < $len && ord($cborData[$pos]) === 0xA3) {
            $pos++;
        }

        while ($pos < $len - 10) {
            if (ord($cborData[$pos]) === 0x0A) {
                $pos++;
                break;
            }
            $pos++;
        }

        if ($pos < $len && ord($cborData[$pos]) === 0x81) {
            $pos++;
        }

        if ($pos < $len && ord($cborData[$pos]) === 0x59) {
            $pos++;

            if ($pos + 2 < $len) {
                $length = (ord($cborData[$pos]) << 8) | ord($cborData[$pos + 1]);
                $pos += 2;

                if ($pos + $length <= $len) {
                    $certificate = substr($cborData, $pos, $length);

                    if (ord($certificate[0]) === 0x30) {
                        return $certificate;
                    }
                }
            }
        }

        $derStart = strpos($cborData, "\x30\x82");
        if ($derStart !== false) {
            return substr($cborData, $derStart);
        }

        throw new Exception('Could not extract DER certificate from CBOR data');
    }

    private function extractEd25519PublicKey(string $certificateData): array
    {
        try {
            $ed25519Oid = "\x06\x03\x2B\x65\x70";

            $oidPos = strpos($certificateData, $ed25519Oid);
            if ($oidPos === false) {
                return ['success' => false, 'error' => 'Ed25519 OID not found in certificate'];
            }

            $bitStringMarker = "\x03\x21\x00";
            $keyPos = strpos($certificateData, $bitStringMarker, $oidPos);

            if ($keyPos === false) {
                return ['success' => false, 'error' => 'Ed25519 public key BIT STRING not found'];
            }

            $publicKeyBytes = substr($certificateData, $keyPos + 3, 32);

            if (strlen($publicKeyBytes) !== 32) {
                return ['success' => false, 'error' => 'Invalid public key length: '.strlen($publicKeyBytes)];
            }

            if ($publicKeyBytes === str_repeat("\x00", 32)) {
                return ['success' => false, 'error' => 'Invalid public key (all zeros)'];
            }

            return [
                'success' => true,
                'raw_bytes' => $publicKeyBytes,
                'hex' => bin2hex($publicKeyBytes),
                'base64' => base64_encode($publicKeyBytes),
                'length' => 32,
            ];

        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Key extraction failed: '.$e->getMessage()];
        }
    }

    private function generateCatalystProfileId(string $publicKeyBytes)
    {
        if (function_exists('sodium_crypto_generichash')) {
            $hash = sodium_crypto_generichash($publicKeyBytes, '', 32);

            return bin2hex($hash);
        }
    }

    private function extractStakeAddress(string $certificateData): ?string
    {
        try {
            $pattern = '/web\+cardano:\/\/addr\/(stake1u[a-z0-9]+)/';

            if (preg_match($pattern, $certificateData, $matches)) {
                return $matches[1];
            }

            $stakePattern = '/stake1u[a-z0-9]{50,}/';
            $readable = '';

            // Convert binary to readable string for pattern matching
            for ($i = 0; $i < strlen($certificateData); $i++) {
                $char = $certificateData[$i];
                if (ctype_print($char) || ctype_alnum($char)) {
                    $readable .= $char;
                } else {
                    $readable .= '.';
                }
            }

            if (preg_match($stakePattern, $readable, $matches)) {
                return $matches[0];
            }

            return null;

        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Analyze the structure of key 10 for debugging
     */
    private function analyzeKey10Structure(array $key10Data): array
    {
        $analysis = [];

        foreach ($key10Data as $index => $chunk) {
            $hex = preg_replace('/^0x/i', '', $chunk);
            $analysis[$index] = [
                'original' => $chunk,
                'hex_length' => strlen($hex),
                'binary_length' => strlen($hex) / 2,
                'preview' => substr($hex, 0, 40).(strlen($hex) > 40 ? '...' : ''),
                'starts_with' => substr($hex, 0, 8),
            ];
        }

        // Analyze total reconstructed size
        $totalSize = array_sum(array_column($analysis, 'binary_length'));
        $analysis['total'] = [
            'chunks' => count($key10Data),
            'total_binary_size' => $totalSize,
            'expected_certificate_size' => '~280 bytes for Ed25519 cert',
        ];

        return $analysis;
    }

    /**
     * Debug method for troubleshooting
     */
    public function debugMetadata(array $metadata): array
    {
        $debug = [
            'metadata_keys' => array_keys($metadata),
            'key_10_analysis' => [],
        ];

        if (isset($metadata[10])) {
            $debug['key_10_analysis'] = $this->analyzeKey10Structure($metadata[10]);

            try {
                $certData = $this->reconstructCertificateFromHexChunks($metadata[10]);
                $debug['certificate'] = [
                    'extracted' => true,
                    'size' => strlen($certData),
                    'starts_with' => bin2hex(substr($certData, 0, 10)),
                    'is_der_format' => ord($certData[0]) === 0x30,
                ];

                $keyResult = $this->extractEd25519PublicKey($certData);
                $debug['public_key_extraction'] = $keyResult;

            } catch (Exception $e) {
                $debug['certificate'] = [
                    'extracted' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $debug;
    }
}
