<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

class WalletDTO
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly ?string $walletName,
        public readonly string $walletProvider,
        public readonly string $stakeAddress,
        public readonly array $paymentAddresses,
        public readonly int $signatureCount,
        public readonly array $walletDetails,
        public readonly string $balance,
        public readonly int $allTimeVotes,
        public readonly array $fundsParticipated,
    ) {}

    public static function fromSignature(object $signature, array $walletStats, ?object $latestInfo = null): self
    {
        $userAddress = ! empty($walletStats['payment_addresses'])
            ? $walletStats['payment_addresses'][0]
            : $signature->stake_address;

        return new self(
            id: $signature->id,
            name: $signature->display_name,
            walletName: $latestInfo?->wallet_name ?? $signature->wallet_name,
            walletProvider: $signature->formatted_wallet_provider,
            stakeAddress: $signature->stake_address,
            paymentAddresses: $walletStats['payment_addresses'] ?? [],
            signatureCount: (int) $signature->signature_count,
            walletDetails: $walletStats,
            balance: $walletStats['balance'] ?? 'N/A',
            allTimeVotes: $walletStats['all_time_votes'] ?? 0,
            fundsParticipated: $walletStats['funds_participated'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'wallet_name' => $this->walletName,
            'wallet_provider' => $this->walletProvider,
            'stakeAddress' => $this->stakeAddress,
            'paymentAddresses' => $this->paymentAddresses,
            'signature_count' => $this->signatureCount,
            'walletDetails' => $this->walletDetails,
            'balance' => $this->balance,
            'all_time_votes' => $this->allTimeVotes,
            'funds_participated' => $this->fundsParticipated,
        ];
    }
}
