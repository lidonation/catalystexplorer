<?php

declare(strict_types=1);

namespace App\Http\Intergrations\LidoNation\Blockfrost;

use App\Jobs\CheckBlockfrostHealth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Saloon\Contracts\Authenticator;
use Saloon\Contracts\RequestInterface;
use Saloon\Exceptions\SaloonException;
use Saloon\Http\Auth\QueryAuthenticator;
use Saloon\Http\Connector;
use Saloon\Http\Response;

class BlockfrostConnector extends Connector
{
    protected ?string $activeBaseUrl = null;

    protected bool $isConfigured = true;

    public function __construct()
    {
        $this->isConfigured = ! empty(config('services.blockfrost.project_id'));

        if (! $this->isConfigured) {
            Log::warning('BlockfrostConnector initialized without project_id configuration', [
                'env_var' => 'BLOCKFROST_PROJECT_ID',
                'config_path' => 'services.blockfrost.project_id',
            ]);
        }

        parent::__construct();
    }

    public function isConfigured(): bool
    {
        return $this->isConfigured;
    }

    public function send(RequestInterface $request): Response
    {
        if (! $this->isConfigured) {
            Log::error('Attempted to use Blockfrost without proper configuration', [
                'request_endpoint' => $request->getUri(),
                'env_var' => 'BLOCKFROST_PROJECT_ID',
            ]);

            throw new SaloonException('Blockfrost is not configured. Missing BLOCKFROST_PROJECT_ID environment variable.');
        }

        return parent::send($request);
    }

    public function resolveBaseUrl(): string
    {
        $cachedUrl = Cache::get('blockfrost_base_url');
        Log::info('Checking Blockfrost base URL', [
            'cachedUrl' => $cachedUrl,
        ]);

        if ($cachedUrl) {
            $this->activeBaseUrl = $cachedUrl;

            return $cachedUrl;
        }

        CheckBlockfrostHealth::dispatchSync();

        $cachedUrl = Cache::get('blockfrost_base_url');
        Log::info('Rechecking Blockfrost base URL', [
            'cachedUrl' => $cachedUrl,
        ]);

        if ($cachedUrl) {
            $this->activeBaseUrl = $cachedUrl;

            return $cachedUrl;
        }

        Log::error('No healthy Blockfrost base URL could be determined.');

        throw new SaloonException('BlockfrostConnector failed: No healthy base URL found.');
    }

    public function defaultHeaders(): array
    {
        $headers = [
            'Accept' => 'application/json',
        ];

        $projectId = config('services.blockfrost.project_id');
        if (! empty($projectId)) {
            $headers['project_id'] = $projectId;
        }

        return $headers;
    }

    public function defaultAuth(): ?Authenticator
    {
        if (! $this->isConfigured) {
            // Return null to skip authentication when not configured
            // The send() method will catch this and throw a proper exception
            return null;
        }

        $projectId = config('services.blockfrost.project_id');

        return new QueryAuthenticator(
            'project_id',
            $projectId
        );
    }
}
