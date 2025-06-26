<?php

declare(strict_types=1);

namespace App\Http\Intergrations\LidoNation\Blockfrost;

use App\Jobs\CheckBlockfrostHealth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Saloon\Contracts\Authenticator;
use Saloon\Exceptions\SaloonException;
use Saloon\Http\Auth\QueryAuthenticator;
use Saloon\Http\Connector;

class BlockfrostConnector extends Connector
{
    protected ?string $activeBaseUrl = null;

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

    protected function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'project_id' => config('services.blockfrost.project_id'),
        ];
    }

    protected function defaultAuth(): ?Authenticator
    {
        return new QueryAuthenticator(
            'project_id',
            config('services.blockfrost.project_id'),
        );
    }
}
