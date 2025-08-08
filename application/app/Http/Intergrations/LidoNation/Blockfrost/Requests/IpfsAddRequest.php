<?php

declare(strict_types=1);

namespace App\Http\Intergrations\LidoNation\Blockfrost\Requests;

use Saloon\Contracts\Body\HasBody;
use Saloon\Data\MultipartValue;
use Saloon\Enums\Method;
use Saloon\Http\Connector;
use Saloon\Traits\Body\HasMultipartBody;
use Saloon\Traits\Request\HasConnector;

class IpfsAddRequest extends BlockfrostRequest implements HasBody
{
    use HasConnector;
    use HasMultipartBody;

    protected Method $method = Method::POST;

    public function __construct(
        protected mixed $file,
        protected string $filename = 'file'
    ) {
        parent::__construct('');
    }

    public function resolveConnector(): Connector
    {
        return app(\App\Http\Intergrations\LidoNation\Blockfrost\IpfsConnector::class);
    }

    public function resolveEndpoint(): string
    {
        return '/ipfs/add';
    }

    protected function defaultBody(): array
    {
        return [
            new MultipartValue(
                name: 'file',
                value: $this->file,
                filename: $this->filename
            ),
        ];
    }

    protected function defaultConfig(): array
    {
        return [
            'timeout' => 120,
        ];
    }
}
