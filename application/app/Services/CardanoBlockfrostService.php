<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Intergrations\LidoNation\Blockfrost\Requests\BlockfrostRequest;
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

    public static function queryBlockFrost(string $endpoint)
    {
        $request = new BlockfrostRequest($endpoint);

        return $request->send()->json();
    }
}
