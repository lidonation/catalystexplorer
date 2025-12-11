<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Integrations\LidoNation\Blockfrost\IpfsConnector;
use App\Http\Integrations\LidoNation\Blockfrost\Requests\IpfsAddRequest;
use App\Http\Integrations\LidoNation\Blockfrost\Requests\IpfsPinRequest;
use Illuminate\Http\UploadedFile;
use Saloon\Exceptions\Request\RequestException;

class IpfsService
{
    public function __construct(
        protected IpfsConnector $connector
    ) {}

    public function upload(mixed $file, string $filename = 'file'): string
    {
        try {
            // Handle different file input types
            $fileContent = $this->prepareFileContent($file, $filename);

            $request = new IpfsAddRequest($fileContent['content'], $fileContent['filename']);
            $response = $this->connector->send($request);

            if (! $response->successful()) {
                throw new \Exception('IPFS upload failed: '.$response->body());
            }

            $data = $response->json();
            $cid = $data['ipfs_hash'] ?? $data['Hash'] ?? null;

            if (! $cid) {

                throw new \Exception('No IPFS hash returned from Blockfrost');
            }

            return $cid;

        } catch (RequestException $e) {

            throw new \Exception('IPFS upload request failed: '.$e->getMessage());
        }
    }

    /**
     * Get the public gateway URL for an IPFS CID
     */
    public function getGatewayUrl(string $cid): string
    {
        $gateway = config('services.blockfrost.ipfs_public_gateway', 'https://ipfs.io/ipfs/');

        return rtrim($gateway, '/').'/'.$cid;
    }

    /**
     * Pin a file on IPFS via Blockfrost
     */
    public function pin(string $cid): bool
    {
        try {
            $request = new IpfsPinRequest($cid);
            $response = $this->connector->send($request);

            if (! $response->successful()) {
                throw new \Exception('IPFS pin failed: '.$response->body());
            }

            return true;

        } catch (RequestException $e) {
            throw new \Exception('IPFS pin request failed: '.$e->getMessage());
        }
    }

    /**
     * Prepare file content for upload based on input type
     */
    private function prepareFileContent(mixed $file, string $filename): array
    {
        if ($file instanceof UploadedFile) {
            return [
                'content' => $file->getContent(),
                'filename' => $file->getClientOriginalName() ?: $filename,
            ];
        }

        if (is_string($file) && file_exists($file)) {
            return [
                'content' => file_get_contents($file),
                'filename' => basename($file),
            ];
        }

        if (is_string($file)) {
            return [
                'content' => $file,
                'filename' => $filename,
            ];
        }

        throw new \InvalidArgumentException('File must be an UploadedFile, file path, or content string');
    }
}
