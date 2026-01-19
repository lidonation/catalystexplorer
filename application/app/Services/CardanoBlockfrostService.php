<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Integrations\LidoNation\Blockfrost\Requests\BlockfrostRequest;
use Saloon\Enums\Method;
use Saloon\Http\Response;

class CardanoBlockfrostService
{
    public function __call($method, $args)
    {
        $path = $args[0] ?? '';
        $data = $args[1] ?? [];

        return $this->request($method, $path, $data);
    }

    public function request(string $method, string $relativePath, array $data = []): Response
    {
        $request = new BlockfrostRequest($relativePath, Method::from(strtoupper($method)));

        if (! empty($data)) {
            $request->query()->merge($data);
        }

        return $request->send();
    }

    /**
     * Get the JSON decoded body of the response as an array or scalar value.
     *
     * @return array<array-key, mixed>
     */
    public static function queryBlockFrost(string $endpoint)
    {
        $request = new BlockfrostRequest($endpoint);

        return $request->send()->json();
    }
}
