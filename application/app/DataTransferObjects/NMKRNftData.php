<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Carbon\Carbon;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NMKRNftData extends Data
{
    public function __construct(
        public int $id,
        public string $ipfshash,
        public string $state,
        public string $name,
        public string $displayname,
        public string $detaildata,
        public bool $minted,
        public string $receiveraddress,
        public ?Carbon $selldate,
        public string $soldby,
        public ?Carbon $reserveduntil,
        public string $policyid,
        public string $assetid,
        public string $assetname,
        public string $fingerprint,
        public string $initialminttxhash,
        public string $title,
        public string $series,
        public string $ipfsGatewayAddress,
        public string $metadata,
        public float $singlePrice,
        public string $uid,
        public string $paymentGatewayLinkForSpecificSale,
        public int $sendBackCentralPaymentInLovelace,
        public int $sendBackCentralPaymentInLamport,
        public int $priceInLovelaceCentralPayments,
        public string $uploadSource,
        public int $priceInLamportCentralPayments,
        public float $singlePriceSolana,
    ) {}

    /**
     * Convert date strings into Carbon instances.
     */
    public static function fromArray(array $data): static
    {
        return new self(
            id: $data['id'] ?? 0,
            ipfshash: $data['ipfshash'] ?? '',
            state: $data['state'] ?? '',
            name: $data['name'] ?? '',
            displayname: $data['displayname'] ?? '',
            detaildata: $data['detaildata'] ?? '',
            minted: $data['minted'] ?? false,
            receiveraddress: $data['receiveraddress'] ?? '',
            selldate: isset($data['selldate']) ? Carbon::parse($data['selldate']) : null,
            soldby: $data['soldby'] ?? '',
            reserveduntil: isset($data['reserveduntil']) ? Carbon::parse($data['reserveduntil']) : null,
            policyid: $data['policyid'] ?? '',
            assetid: $data['assetid'] ?? '',
            assetname: $data['assetname'] ?? '',
            fingerprint: $data['fingerprint'] ?? '',
            initialminttxhash: $data['initialminttxhash'] ?? '',
            title: $data['title'] ?? '',
            series: $data['series'] ?? '',
            ipfsGatewayAddress: $data['ipfsGatewayAddress'] ?? '',
            metadata: $data['metadata'] ?? '',
            singlePrice: (float) ($data['singlePrice'] ?? 0.0),
            uid: $data['uid'] ?? '',
            paymentGatewayLinkForSpecificSale: $data['paymentGatewayLinkForSpecificSale'] ?? '',
            sendBackCentralPaymentInLovelace: $data['sendBackCentralPaymentInLovelace'] ?? 0,
            sendBackCentralPaymentInLamport: $data['sendBackCentralPaymentInLamport'] ?? 0,
            priceInLovelaceCentralPayments: $data['priceInLovelaceCentralPayments'] ?? 0,
            uploadSource: $data['uploadSource'] ?? '',
            priceInLamportCentralPayments: $data['priceInLamportCentralPayments'] ?? 0,
            singlePriceSolana: (float) ($data['singlePriceSolana'] ?? 0.0),

        );
    }

    public static function createDefault(): static
    {
        return new self(
            id: 0,
            ipfshash: '',
            state: '',
            name: '',
            displayname: '',
            detaildata: '',
            minted: false,
            receiveraddress: '',
            selldate: null,
            soldby: '',
            reserveduntil: null,
            policyid: '',
            assetid: '',
            assetname: '',
            fingerprint: '',
            initialminttxhash: '',
            title: '',
            series: '',
            ipfsGatewayAddress: '',
            metadata: '',
            singlePrice: 0.0,
            uid: '',
            paymentGatewayLinkForSpecificSale: '',
            sendBackCentralPaymentInLovelace: 0,
            sendBackCentralPaymentInLamport: 0,
            priceInLovelaceCentralPayments: 0,
            uploadSource: '',
            priceInLamportCentralPayments: 0,
            singlePriceSolana: 0.0
        );
    }
}
