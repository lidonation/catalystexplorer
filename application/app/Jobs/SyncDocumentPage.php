<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Actions\DecodeCatalystDocument;
use App\Http\Integrations\CatalystGateway\CatalystGatewayConnector;
use App\Http\Integrations\CatalystGateway\Requests\GetDocumentIndexRequest;
use App\Http\Integrations\CatalystGateway\Requests\GetDocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Symfony\Component\Process\Process;

class SyncDocumentPage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public array $docs,
        public int $page,
        public int $limit,
        public string $fund
    ) {}

    public function handle(): void
    {
        $successCount = 0;
        $errorCount = 0;
        $connector = new CatalystGatewayConnector;

        foreach ($this->docs as $doc) {
            $documentId = $doc['id'] ?? 'unknown';

            try {
                $request = new GetDocumentRequest($documentId);
                $response = $connector->send($request);

                if (! $response->successful()) {
                    Log::error("Failed to fetch document: {$documentId} — HTTP ".$response->status());
                    $errorCount++;

                    continue;
                }

                $binary = $response->body();

                // Validate response body
                if (empty($binary)) {
                    Log::error("Empty response body for document: {$documentId}");
                    $errorCount++;

                    continue;
                }

                $decoded = (new DecodeCatalystDocument)($binary);

                // Check if we got actual proposal content or just metadata
                $hasProposalContent = isset($decoded['payload'][1]) && ! empty($decoded['payload'][1]);

                if (! $hasProposalContent) {
                    // Check if payload[2] contains hex-encoded brotli data directly
                    if (isset($decoded['payload'][2]) && ! empty($decoded['payload'][2]) && is_string($decoded['payload'][2])) {
                        $proposalContent = $this->tryDecodeHexBrotliContent($decoded['payload'][2]);

                        if ($proposalContent) {
                            $decoded['payload'][1] = $proposalContent;
                        }
                    }

                    if (empty($decoded['payload'][1])) {
                        $proposalContent = $this->fetchProposalContent($documentId, $decoded, $connector);

                        if ($proposalContent) {
                            $decoded['payload'][1] = $proposalContent;
                        } else {
                            Log::warning("Could not retrieve proposal content for {$documentId} - processing as metadata-only");
                        }
                    }
                }

                if (isset($decoded['payload'][0]) && is_string($decoded['payload'][0])) {
                    $decodedPayload0 = $this->tryDecodePayload0($decoded['payload'][0]);
                    if ($decodedPayload0) {
                        $decoded['payload'][0] = $decodedPayload0;
                        Log::info("Successfully decoded payload[0] for {$documentId}");
                    }
                }

                if (isset($decoded['payload'][3]) && is_array($decoded['payload'][3])) {
                    $decodedPayload3 = $this->tryDecodePayload3($decoded['payload'][3]);
                    if ($decodedPayload3) {
                        $decoded['payload'][3] = $decodedPayload3;
                    }
                }

                if (isset($decoded['payload'][1]['setup'])) {
                    // Safely create Fluent object from version data
                    $versionData = $doc['ver'][0] ?? null;
                    $documentVersion = $versionData ? new Fluent($versionData) : null;

                    try {
                        SyncProposalJob::dispatch($decoded, $this->fund, $documentId, $documentVersion);
                        $successCount++;
                    } catch (\Exception $e) {
                        $errorCount++;
                        Log::error("Failed to sync proposal for document {$documentId}: ".$e->getMessage(), [
                            'document_id' => $documentId,
                            'exception' => get_class($e),
                            'message' => $e->getMessage(),
                        ]);
                    }
                } else {
                    Log::warning("Document {$documentId} missing required payload.setup structure");
                    $errorCount++;
                }

            } catch (\Exception $e) {
                $errorCount++;
                Log::error("Error processing document {$documentId}: ".$e->getMessage(), [
                    'document_id' => $documentId,
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                continue;
            }
        }

        Log::info('Completed processing page {page}: {success} successful, {errors} errors', [
            'page' => $this->page,
            'success' => $successCount,
            'errors' => $errorCount,
            'total' => count($this->docs),
        ]);

        // Fail the job if there were any errors
        if ($errorCount > 0) {
            throw new \Exception("SyncDocumentPage failed: {$errorCount} documents failed to process out of ".count($this->docs));
        }
    }

    /**
     * Attempt to fetch actual proposal content using multiple strategies
     */
    private function fetchProposalContent(string $documentId, array $metadataDoc, CatalystGatewayConnector $connector): ?array
    {
        // Strategy 1: Try fetching with different version parameter
        if (isset($metadataDoc['payload'][0]['ver'])) {
            $versionId = $metadataDoc['payload'][0]['ver'];
            $content = $this->tryFetchDocumentWithVersion($documentId, $versionId, $connector);
            if ($content) {
                return $content;
            }
        }

        // Strategy 2: Try fetching the template document (might contain actual content)
        if (isset($metadataDoc['payload'][0]['template'][0])) {
            $templateId = $metadataDoc['payload'][0]['template'][0];
            Log::info("Trying template document: {$templateId}");
            $content = $this->tryFetchContentById($templateId, 'template', $connector);
            if ($content) {
                return $content;
            }

            // Try template with different version
            if (isset($metadataDoc['payload'][0]['template'][1]) &&
                $metadataDoc['payload'][0]['template'][1] !== $templateId) {
                $altTemplateId = $metadataDoc['payload'][0]['template'][1];
                Log::info("Trying alternate template document: {$altTemplateId}");
                $content = $this->tryFetchContentById($altTemplateId, 'alt-template', $connector);
                if ($content) {
                    return $content;
                }
            }
        }

        // Strategy 3: Check if this document is actually a metadata pointer
        // and we need to use a v2 index query to find the actual content
        $content = $this->tryFetchWithIndexQuery($documentId, $metadataDoc, $connector);
        if ($content) {
            return $content;
        }

        return null;
    }

    /**
     * Try to decode hex-encoded brotli content from payload.value[2]
     */
    private function tryDecodeHexBrotliContent(string $hexString): ?array
    {
        try {
            // Convert hex to binary
            $binaryData = hex2bin($hexString);
            if ($binaryData === false) {
                return null;
            }

            // Try brotli decompression (venv has required packages)
            $python = '/venv/bin/python3';
            $script = '/tmp/decode_brotli.py';

            // Create a temporary Python script to handle brotli decompression
            $pythonCode = '
import sys
import brotli
import json

try:
    # Read binary data from stdin
    binary_data = sys.stdin.buffer.read()

    # Try brotli decompression
    decompressed = brotli.decompress(binary_data)

    # Try to parse as JSON
    try:
        json_data = json.loads(decompressed.decode("utf-8"))
        print(json.dumps(json_data))
    except json.JSONDecodeError:
        # If not JSON, return as text
        print(json.dumps({"text_content": decompressed.decode("utf-8", errors="replace")}))

except Exception as e:
    print(json.dumps({"error": str(e)}))
';

            file_put_contents($script, $pythonCode);

            $process = new Process([$python, $script]);
            $process->setTimeout(5);  // Shorter timeout to prevent hanging
            $process->setInput($binaryData);
            $process->run();

            unlink($script);

            if ($process->isSuccessful()) {
                $result = json_decode($process->getOutput(), true);
                if (is_array($result) && ! isset($result['error'])) {
                    Log::info('Successfully decoded hex-brotli content', [
                        'size' => strlen($hexString),
                        'decompressed_keys' => is_array($result) ? array_keys($result) : 'not_array',
                    ]);

                    return $result;
                }
            }

        } catch (\Exception $e) {
            Log::debug('Failed to decode hex-brotli content: '.$e->getMessage());
        }

        return null;
    }

    private function tryFetchContentById(string $id, string $idType, CatalystGatewayConnector $connector): ?array
    {
        Log::debug("Trying to fetch content using {$idType} ID: {$id}");

        try {
            $request = new GetDocumentRequest($id);
            $response = $connector->send($request);

            if (! $response->successful()) {
                return null;
            }

            $binary = $response->body();
            if (empty($binary)) {
                return null;
            }

            $decoded = (new DecodeCatalystDocument)($binary);

            // Check if this document has actual content
            // Handle both regular structure and CBOR tag structure
            $contentFound = false;
            $content = null;

            if (isset($decoded['payload'][1]) && ! empty($decoded['payload'][1])) {
                $content = $decoded['payload'][1];
                $contentFound = true;
            } elseif (isset($decoded['payload']['_cbor_tag']) && isset($decoded['payload']['value'])) {
                // Handle CBOR tag structure - check value[1] and value[2]
                if (isset($decoded['payload']['value'][1]) && ! empty($decoded['payload']['value'][1])) {
                    $content = $decoded['payload']['value'][1];
                    $contentFound = true;
                } elseif (isset($decoded['payload']['value'][2]) && ! empty($decoded['payload']['value'][2])) {
                    // Check if value[2] contains hex-encoded brotli data
                    $content = $this->tryDecodeHexBrotliContent($decoded['payload']['value'][2]);
                    if ($content) {
                        $contentFound = true;
                    }
                }
            }

            if ($contentFound) {
                Log::info("Found content using {$idType} ID: {$id}");

                return is_array($content) ? $content : ['content' => $content];
            }

        } catch (\Exception $e) {
            Log::debug("Failed to fetch content using {$idType} ID {$id}: ".$e->getMessage());
        }

        return null;
    }

    private function tryFetchDocumentWithVersion(string $documentId, string $versionId, CatalystGatewayConnector $connector): ?array
    {
        Log::debug("Trying to fetch document {$documentId} with version {$versionId}");

        try {
            $request = new GetDocumentRequest($documentId, $versionId);
            $response = $connector->send($request);

            if (! $response->successful()) {
                return null;
            }

            $binary = $response->body();
            if (empty($binary)) {
                return null;
            }

            $decoded = (new DecodeCatalystDocument)($binary);

            // Check if this version has actual content
            // Handle both regular structure and CBOR tag structure
            $contentFound = false;
            $content = null;

            if (isset($decoded['payload'][1]) && ! empty($decoded['payload'][1])) {
                $content = $decoded['payload'][1];
                $contentFound = true;
            } elseif (isset($decoded['payload']['_cbor_tag']) && isset($decoded['payload']['value'])) {
                // Handle CBOR tag structure - check value[1] and value[2]
                if (isset($decoded['payload']['value'][1]) && ! empty($decoded['payload']['value'][1])) {
                    $content = $decoded['payload']['value'][1];
                    $contentFound = true;
                } elseif (isset($decoded['payload']['value'][2]) && ! empty($decoded['payload']['value'][2])) {
                    // Check if value[2] contains hex-encoded brotli data
                    $content = $this->tryDecodeHexBrotliContent($decoded['payload']['value'][2]);
                    if ($content) {
                        $contentFound = true;
                    }
                }
            }

            if ($contentFound) {
                Log::info("Found content using version {$versionId} for document {$documentId}");

                return is_array($content) ? $content : ['content' => $content];
            }

        } catch (\Exception $e) {
            Log::debug("Failed to fetch document {$documentId} with version {$versionId}: ".$e->getMessage());
        }

        return null;
    }

    private function tryFetchWithIndexQuery(string $documentId, array $metadataDoc, CatalystGatewayConnector $connector): ?array
    {
        Log::debug("Trying index query to find related content for {$documentId}");

        try {
            // Use the v2 index endpoint to find related documents that might have content
            $queryFilters = [];

            // Add template filter if available
            if (isset($metadataDoc['payload'][0]['template'][0])) {
                $queryFilters['template'] = [
                    'id' => ['eq' => $metadataDoc['payload'][0]['template'][0]],
                ];
            }

            // Add type filter
            if (isset($metadataDoc['payload'][0]['type'])) {
                $queryFilters['type'] = $metadataDoc['payload'][0]['type'];
            }

            if (empty($queryFilters)) {
                return null;
            }

            $request = new GetDocumentIndexRequest($queryFilters, 10);
            $response = $connector->send($request);

            if (! $response->successful()) {
                return null;
            }

            $results = $response->json();

            if (! empty($results['docs'])) {
                foreach ($results['docs'] as $relatedDoc) {
                    if (isset($relatedDoc['id']) && $relatedDoc['id'] !== $documentId) {
                        // Try to fetch this related document
                        $content = $this->tryFetchContentById($relatedDoc['id'], 'index-related', $connector);
                        if ($content) {
                            return $content;
                        }
                    }
                }
            }

        } catch (\Exception $e) {
            Log::debug("Failed to fetch with index query for {$documentId}: ".$e->getMessage());
        }

        return null;
    }

    /**
     * Try to decode payload[0] if it contains encoded data
     */
    private function tryDecodePayload0(string $payload0Data): ?array
    {
        try {
            // Strategy 1: Check if it's hex-encoded data (like payload[2])
            if (ctype_xdigit($payload0Data)) {
                Log::debug('Attempting hex-brotli decode on payload[0]');
                $result = $this->tryDecodeHexBrotliContent($payload0Data);
                if ($result) {
                    return $result;
                }
            }

            // Strategy 2: Try CBOR decoding directly
            Log::debug('Attempting CBOR decode on payload[0]');
            $binaryData = hex2bin($payload0Data);
            if ($binaryData !== false) {
                $decoded = (new DecodeCatalystDocument)($binaryData);
                if (is_array($decoded) && ! empty($decoded)) {
                    return $decoded;
                }
            }

            // Strategy 3: Check if it contains Content-Encoding headers (brotli compressed)
            if (strpos($payload0Data, 'Content-Encoding') !== false || strpos($payload0Data, 'br') !== false) {
                Log::debug('Payload[0] appears to contain brotli-related metadata');

                // Try to extract and decode any hex content within
                if (preg_match('/[a-f0-9]{32,}/', $payload0Data, $matches)) {
                    $hexContent = $matches[0];
                    $result = $this->tryDecodeHexBrotliContent($hexContent);
                    if ($result) {
                        return $result;
                    }
                }
            }

        } catch (\Exception $e) {
            Log::debug('Failed to decode payload[0]: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Try to decode payload[3] nested array structures with potential hex data
     */
    private function tryDecodePayload3(array $payload3Data): ?array
    {
        try {
            $decodedPayload3 = $payload3Data;
            $hasChanges = false;

            // Recursively process nested arrays looking for hex strings
            $decodedPayload3 = $this->processNestedArrayForDecoding($payload3Data, $hasChanges);

            return $hasChanges ? $decodedPayload3 : null;

        } catch (\Exception $e) {
            Log::debug('Failed to decode payload[3]: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Recursively process nested arrays looking for hex strings to decode
     */
    private function processNestedArrayForDecoding(array $data, &$hasChanges): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            if (is_string($value)) {
                // Check if this string looks like hex data
                if (strlen($value) > 64 && ctype_xdigit($value)) {
                    Log::debug('Found potential hex data in nested structure', [
                        'key' => $key,
                        'length' => strlen($value),
                        'sample' => substr($value, 0, 32),
                    ]);

                    // Try multiple decoding strategies
                    $decoded = $this->tryDecodeHexString($value);
                    if ($decoded) {
                        $result[$key] = $decoded;
                        $hasChanges = true;
                        Log::info("Successfully decoded hex string at key: {$key}");
                    } else {
                        $result[$key] = $value; // Keep original if decoding fails
                    }
                } else {
                    $result[$key] = $value; // Not hex data, keep as-is
                }
            } elseif (is_array($value)) {
                // Recursively process nested arrays
                $result[$key] = $this->processNestedArrayForDecoding($value, $hasChanges);
            } else {
                $result[$key] = $value; // Other types, keep as-is
            }
        }

        return $result;
    }

    /**
     * Try multiple strategies to decode a hex string
     */
    private function tryDecodeHexString(string $hexString): mixed
    {
        // Strategy 1: Try hex-brotli decoding
        $result = $this->tryDecodeHexBrotliContent($hexString);
        if ($result) {
            return $result;
        }

        // Strategy 2: Try direct CBOR decoding
        try {
            $binaryData = hex2bin($hexString);
            if ($binaryData !== false) {
                $decoded = (new DecodeCatalystDocument)($binaryData);
                if (is_array($decoded) && ! empty($decoded)) {
                    return $decoded;
                }
            }
        } catch (\Exception $e) {
            // Ignore CBOR decoding errors, try other strategies
        }

        // Strategy 3: Try as plain hex-to-text conversion
        try {
            $binaryData = hex2bin($hexString);
            if ($binaryData !== false) {
                $text = $binaryData;
                // Check if it's valid UTF-8 text
                if (mb_check_encoding($text, 'UTF-8')) {
                    // Check if it looks like JSON
                    $jsonData = json_decode($text, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return $jsonData;
                    }
                    // Return as text if it's readable
                    if (strlen(trim($text)) > 10) {
                        return ['decoded_text' => $text];
                    }
                }
            }
        } catch (\Exception $e) {
            // Ignore text conversion errors
        }

        return null;
    }
}
