<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Actions\DecodeCatalystRegistrationMetadata;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Http\Requests\NovaRequest;

class FillStakeAddressFromTransaction extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     *
     * @var string
     */
    public $name = 'Fill Stake Address from Transaction';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): ActionResponse
    {
        $decoder = new DecodeCatalystRegistrationMetadata;
        $successCount = 0;
        $failedCount = 0;
        $messages = [];

        foreach ($models as $profile) {
            try {
                // Skip if already has stake_address
                if (! empty($profile->stake_address)) {
                    $messages[] = "Profile {$profile->username} already has stake address: {$profile->stake_address}";

                    continue;
                }

                // Skip if no catalyst_id
                if (empty($profile->catalyst_id)) {
                    $messages[] = "Profile {$profile->username} has no catalyst_id";
                    $failedCount++;

                    continue;
                }

                Log::info('[FillStakeAddressFromTransaction] Processing profile', [
                    'username' => $profile->username,
                    'catalyst_id' => $profile->catalyst_id,
                ]);

                $catalystKey = null;
                if (preg_match('#id\.catalyst://[^/]+/([^/]+)#', $profile->catalyst_id, $matches)) {
                    $catalystKey = $matches[1];
                }

                if (! $catalystKey) {
                    $messages[] = "Could not extract catalyst key from {$profile->catalyst_id}";
                    $failedCount++;

                    continue;
                }

                Log::info('[FillStakeAddressFromTransaction] Searching using key', [
                    'key' => $catalystKey,
                ]);

                // Search for transactions containing this key in json_metadata
                $transaction = Transaction::whereNotNull('json_metadata')
                    ->whereRaw("json_metadata->>'catalyst_profile_id' LIKE ?", ["%{$catalystKey}%"])
                    ->orderBy('created_at', 'desc')
                    ->first();

                if (! $transaction) {
                    // Fallback: search in raw_metadata
                    $transaction = Transaction::whereNotNull('raw_metadata')
                        ->where(function ($query) use ($catalystKey) {
                            $query->whereRaw('raw_metadata::text LIKE ?', ["%{$catalystKey}%"]);
                        })
                        ->orderBy('created_at', 'desc')
                        ->first();
                }

                if (! $transaction) {
                    $messages[] = "No transaction found for profile {$profile->username} with catalyst_id {$profile->catalyst_id}";
                    $failedCount++;

                    continue;
                }

                Log::info('[FillStakeAddressFromTransaction] Found transaction', [
                    'tx_hash' => $transaction->tx_hash,
                    'profile' => $profile->username,
                ]);

                // Extract stake_address from json_metadata if already decoded
                $stakeAddress = null;
                if (isset($transaction->json_metadata->identity->stake_address)) {
                    $stakeAddress = $transaction->json_metadata->identity->stake_address;
                } elseif (isset($transaction->json_metadata->stake_address)) {
                    $stakeAddress = $transaction->json_metadata->stake_address;
                }

                // If not in json_metadata, try decoding raw_metadata
                if (! $stakeAddress && $transaction->raw_metadata) {
                    try {
                        $decoded = $decoder($transaction->raw_metadata);
                        if (isset($decoded['identity']['stake_address'])) {
                            $stakeAddress = $decoded['identity']['stake_address'];
                        }
                    } catch (\Exception $e) {
                        Log::error('[FillStakeAddressFromTransaction] Failed to decode metadata', [
                            'tx_hash' => $transaction->tx_hash,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                if ($stakeAddress) {
                    $profile->stake_address = $stakeAddress;
                    $profile->save();
                    $profile->searchable();

                    Log::info('[FillStakeAddressFromTransaction] Updated profile', [
                        'username' => $profile->username,
                        'stake_address' => $stakeAddress,
                    ]);

                    $messages[] = "✓ Updated {$profile->username} with stake address: {$stakeAddress}";
                    $successCount++;
                } else {
                    $messages[] = "✗ Could not extract stake address from transaction for {$profile->username}";
                    $failedCount++;
                }
            } catch (\Exception $e) {
                Log::error('[FillStakeAddressFromTransaction] Error processing profile', [
                    'username' => $profile->username ?? 'unknown',
                    'error' => $e->getMessage(),
                ]);
                $messages[] = "✗ Error processing {$profile->username}: {$e->getMessage()}";
                $failedCount++;
            }
        }

        $summary = "Processed {$models->count()} profile(s): {$successCount} updated, {$failedCount} failed.";

        $finalMessage = $summary."\n\n".implode("\n", $messages);

        if ($failedCount > 0) {
            return Action::danger($finalMessage);
        }

        return Action::message($finalMessage);
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        return [];
    }
}
