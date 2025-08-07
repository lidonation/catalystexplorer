<?php

declare(strict_types=1);

namespace App\Traits;

use App\Services\IpfsService;

trait HasIpfsFiles
{
    /**
     * Upload a file to IPFS
     */
    public function uploadToIpfs(mixed $file, string $filename = 'file'): string
    {
        return app(IpfsService::class)->upload($file, $filename);
    }

    /**
     * Get the public gateway URL for an IPFS CID
     */
    public function getIpfsUrl(string $cid): string
    {
        return app(IpfsService::class)->getGatewayUrl($cid);
    }

    /**
     * Pin a file on IPFS
     */
    public function pinToIpfs(string $cid): bool
    {
        return app(IpfsService::class)->pin($cid);
    }
}
