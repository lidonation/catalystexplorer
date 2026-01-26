<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Actions\DecodeCatalystRegistrationMetadata;
use App\Enums\SyncSource;
use App\Models\Transaction;
use App\Services\CardanoBlockfrostService;
use Exception;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\SkipIfBatchCancelled;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class SyncTransactionJob implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public function __construct(
        public array $voterTransaction,
        public SyncSource $source = SyncSource::Blockfrost,
        public int $processedCount = 0,
        public int $skipCount = 0,
        public int $errorCount = 0,
        public array $metadataLabels = ['61284']
    ) {}

    public function handle(): void
    {
        $txHash = $this->voterTransaction['tx_hash'] ?? 'unknown';
        $blockfrostService = new CardanoBlockfrostService;

        $existingTx = Transaction::where('tx_hash', $txHash)->first();

        $shouldReprocess = $existingTx && ! empty($existingTx->json_metadata) && is_null($existingTx->stake_key);

        if ($existingTx && $this->isTransactionComplete($existingTx) && ! $shouldReprocess) {
            return;
        }

        $basicTxData = $this->getBasicTransactionData($blockfrostService, $txHash);
        if (! $basicTxData) {
            return;
        }

        $metadata = $this->getTransactionMetadata($blockfrostService, $txHash);

        $needsFullProcessing = ! empty($metadata['json_metadata']);

        if ($needsFullProcessing) {
            $transactionData = $this->processTransactionWithMetadata($basicTxData, $metadata, $blockfrostService);
        } else {
            $transactionData = $this->processSimpleTransaction($basicTxData, $metadata);
        }

        $this->saveTransaction($transactionData);
    }

    private function getBasicTransactionData(CardanoBlockfrostService $service, string $txHash): ?array
    {
        try {
            $txnResponse = $this->safeGet($service, "/txs/{$txHash}");
            $utxosResponse = $this->safeGet($service, "/txs/{$txHash}/utxos");

            if ($txnResponse->get('status_code') || $utxosResponse->get('status_code')) {
                Log::error("Blockfrost API error for basic data: {$txHash}", [
                    'txn_response' => $txnResponse->toArray(),
                    'utxos_response' => $utxosResponse->toArray(),
                ]);

                throw new Exception("Blockfrost API error for basic data: {$txHash}");
            }

            $blockResponse = $this->safeGet($service, "/blocks/{$txnResponse['block']}");

            if ($blockResponse->get('status_code')) {
                Log::error("Blockfrost API error for block data: {$txHash}", [
                    'block_response' => $blockResponse->toArray(),
                ]);

                throw new Exception("Blockfrost API error for block data: {$txHash}");
            }

            return [
                'tx_data' => $txnResponse->toArray(),
                'utxos' => $utxosResponse->toArray(),
                'block_data' => $blockResponse->toArray(),
            ];
        } catch (Exception $e) {
            Log::error("Error fetching basic transaction data for {$txHash}: ".$e->getMessage());
            throw $e;
        }
    }

    private function getTransactionMetadata(CardanoBlockfrostService $service, string $txHash): ?array
    {
        try {
            if ($this->source === SyncSource::HashArray) {
                $response = $this->safeGet($service, "/txs/{$txHash}/metadata");

                if ($response->get('status_code')) {
                    throw new Exception("Blockfrost API error for metadata: {$txHash}");
                }

                $responseArray = $response->toArray();

                return $this->normalizeTxsFromBlockfrostHashArrayResponse($responseArray);
            }

            return $this->voterTransaction ?? null;
        } catch (Exception $e) {
            Log::warning("Error fetching metadata for {$txHash}: ".$e->getMessage());
            throw $e;
        }
    }

    private function normalizeTxsFromBlockfrostHashArrayResponse(array $hashArrayResponse)
    {
        $jsonMetadata = null;

        foreach ($hashArrayResponse as $txMetadatum) {
            if (in_array($txMetadatum['label'], $this->metadataLabels)) {
                $jsonMetadata = $txMetadatum['json_metadata'] ?? null;
                break;
            }
        }

        return [
            'json_metadata' => $jsonMetadata,
        ];
    }

    private function processSimpleTransaction(array $basicData, ?array $metadata): array
    {
        $txData = $basicData['tx_data'];
        $utxosData = $basicData['utxos'];
        $blockData = $basicData['block_data'];

        return [
            'tx_hash' => $txData['hash'],
            'epoch' => $blockData['epoch'],
            'stake_key' => null,
            'stake_pub' => null,
            'json_metadata' => $metadata['json_metadata'] ?? null,
            'raw_metadata' => $metadata['json_metadata'] ?? null,
            'witness' => null,
            'status' => 'simple',
            'controlled_amount' => 0,
            'block' => $txData['block'],
            'inputs' => $utxosData['inputs'] ?? [],
            'outputs' => $utxosData['outputs'] ?? [],
            'type' => $this->determineTransactionType($metadata),
            'created_at' => $blockData['time'],
        ];
    }

    private function processTransactionWithMetadata(array $basicData, array $metadata, CardanoBlockfrostService $service): array
    {
        $txHash = $basicData['tx_data']['hash'];
        $transactionData = $this->processSimpleTransaction($basicData, $metadata);

        try {
            $decoder = new DecodeCatalystRegistrationMetadata;
            $decodedMetadata = $decoder($metadata['json_metadata']);

            if (isset($decodedMetadata['error'])) {
                Log::error("Decode Action returned error for {$txHash}: ".$decodedMetadata['error']);

                return $transactionData;
            }

            $stakeAddress = $decodedMetadata['identity']['stake_address'] ?? null;
            $accountData = [];

            if ($stakeAddress) {
                $accountData = $this->getAccountData($service, $stakeAddress);
            }

            $requiredSigners = $this->getRequiredSigners($service, $txHash);

            $transactionData = array_merge($transactionData, [
                'stake_key' => $stakeAddress,
                'stake_pub' => $decodedMetadata['identity']['role0_public_key'] ?? null,
                'json_metadata' => $decodedMetadata,
                'witness' => $requiredSigners,
                'status' => $accountData['active'] ?? 'unknown',
                'controlled_amount' => $accountData['controlled_amount'] ?? 0,
                'type' => $decodedMetadata['type'] ?? 'catalyst_transaction',
            ]);

            $transactionData = $this->processVoterDelegations($transactionData, $decodedMetadata);
        } catch (Exception $e) {
            Log::warning("Error in full processing for {$txHash}, falling back to simple: ".$e->getMessage());
        }

        return $transactionData;
    }

    private function getAccountData(CardanoBlockfrostService $service, string $stakeAddress): array
    {
        try {
            $response = $this->safeGet($service, "/accounts/{$stakeAddress}");

            return $response->toArray();
        } catch (Exception $e) {
            Log::warning('Error fetching account data: '.$e->getMessage());

            return ['active' => 'unknown', 'controlled_amount' => 0];
        }
    }

    private function getRequiredSigners(CardanoBlockfrostService $service, string $txHash): array
    {
        try {
            $response = $this->safeGet($service, "/txs/{$txHash}/required_signers");

            return $response->toArray();
        } catch (Exception $e) {
            Log::warning('Error fetching required signers: '.$e->getMessage());

            return [];
        }
    }

    private function processVoterDelegations(array $transactionData, array $decodedMetadata): array
    {
        try {
            if (! empty($decodedMetadata['stake_pub'])) {
                $catId = $this->getCatId($decodedMetadata['stake_pub']);
                $decodedMetadata['cat_id'] = $catId;
            }

            if (! empty($decodedMetadata['voter_delegations'])) {
                $delegations = collect($decodedMetadata['voter_delegations'])->map(function ($drep) {
                    if (! empty($drep['votePublicKey'])) {
                        $drep['catId'] = $this->getCatId($drep['votePublicKey']);
                    }

                    return $drep;
                })->toArray();

                $decodedMetadata['voter_delegations'] = $delegations;
            }

            $transactionData['json_metadata'] = $decodedMetadata;
        } catch (Exception $e) {
            Log::warning('Error processing voter delegations: '.$e->getMessage());
        }

        return $transactionData;
    }

    private function getCatId(string $publicKey): ?string
    {
        try {
            $command = Process::fromShellCommandline('/opt/jcli address account '.$publicKey);
            $command->run();

            if (! $command->isSuccessful()) {
                return null;
            }

            return str_replace(["\r", "\n"], '', $command->getOutput());
        } catch (Exception $e) {
            return null;
        }
    }

    private function determineTransactionType(?array $metadata): string
    {
        if (empty($metadata) || empty($metadata['json_metadata'])) {
            return 'simple_transfer';
        }

        if (! empty($metadata['json_metadata']['txType'])) {
            return $metadata['json_metadata']['txType'];
        }

        return 'metadata_transaction';
    }

    private function saveTransaction(array $transactionData): void
    {
        try {
            Transaction::updateOrCreate(
                ['tx_hash' => $transactionData['tx_hash']],
                $transactionData
            );
        } catch (Exception $e) {
            Log::error("Error saving transaction {$transactionData['tx_hash']}: ".$e->getMessage());
        }
    }

    private function isTransactionComplete(Transaction $transaction): bool
    {
        $requiredFields = [
            'epoch',
            'block',
        ];

        foreach ($requiredFields as $field) {
            if (is_null($transaction->{$field})) {
                return false;
            }
        }

        return true;
    }

    private function safeGet(CardanoBlockfrostService $service, string $endpoint): \Illuminate\Support\Collection
    {
        $response = $service->get($endpoint, []);

        try {
            return $response->collect();
        } catch (\JsonException $e) {
            $status = $response->status();
            $body = substr($response->body(), 0, 1000); // truncate for log safety
            Log::error("Blockfrost API Invalid JSON [{$status}] for {$endpoint}: {$body}");
            throw new Exception("Blockfrost API Invalid JSON [{$status}] for {$endpoint}");
        }
    }

    public function middleware(): array
    {
        return [new SkipIfBatchCancelled];
    }
}
