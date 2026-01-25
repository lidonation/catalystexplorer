<?php

namespace App\Jobs;

use App\Actions\DecodeCatalystRegistrationMetadata;
use App\Models\CatalystProfile;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MergeCatalystProfileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $stakeKey
    ) {}

    /**
     * Execute the job.
     */
    public function handle(DecodeCatalystRegistrationMetadata $decoder): void
    {

        $transactions = Transaction::where('stake_key', $this->stakeKey)
            ->where('type', 'x509_envelope')
            ->orderBy('created_at', 'asc')
            ->get();

        if ($transactions->isEmpty()) {
            return;
        }

        $rotations = [];
        $catalystIds = [];

        foreach ($transactions as $tx) {
            // Convert object to array for decoder
            $metadata = json_decode(json_encode($tx->json_metadata), true);

            // Attempt decode
            $decoded = $decoder($metadata);

            if (isset($decoded['error'])) {
                continue;
            }

            $catId = $decoded['identity']['catalyst_id'] ?? null;

            if ($catId) {
                $catalystIds[] = $catId;
                $rotations[] = [
                    'tx_hash' => $tx->tx_hash,
                    'catalyst_id' => $catId,
                    'registered_at' => $tx->created_at?->toIso8601String(),
                    'slot' => $tx->block,
                    'role0_key' => $decoded['identity']['role0_public_key'] ?? null,
                    'previous_tx_id' => $decoded['transaction_links']['previous_tx_id'] ?? null,
                ];
            }
        }

        $catalystIds = array_unique($catalystIds);

        if (empty($catalystIds)) {
            Log::info("No valid Catalyst IDs found for stake key: {$this->stakeKey}");

            return;
        }

        $profiles = CatalystProfile::whereIn('catalyst_id', $catalystIds)
            ->get();

        if ($profiles->isEmpty()) {
            Log::info('No profiles found for IDs: '.implode(', ', $catalystIds));

            return;
        }

        $latestRotation = end($rotations);
        $latestId = $latestRotation['catalyst_id'];

        $primaryProfile = $profiles->firstWhere('catalyst_id', $latestId);

        if (! $primaryProfile) {
            $primaryProfile = $profiles->first();
            $primaryProfile->catalyst_id = $latestId;
        }

        // Check if any of the matched profiles are claimed using the relationship
        $claimedProfile = $profiles->first(fn ($p) => $p->claimed_by_users()->exists());
        $existingClaimUser = $primaryProfile->claimed_by_users()->first();

        if ($claimedProfile && ! $existingClaimUser) {
            $claimer = $claimedProfile->claimed_by_users()->first();
            if ($claimer) {
                $primaryProfile->claimed_by_users()->attach($claimer->id, ['claimed_at' => now(), 'id' => \Illuminate\Support\Str::uuid()]);
            }
        } elseif ($claimedProfile && $existingClaimUser) {
            $claimer = $claimedProfile->claimed_by_users()->first();
            if ($claimer && $claimer->id !== $existingClaimUser->id) {
                Log::warning("Merge Conflict: Profile {$claimedProfile->id} is claimed by user {$claimer->id}, but primary {$primaryProfile->id} is already claimed by {$existingClaimUser->id}. Keeping primary.");
            }
        }

        DB::transaction(function () use ($primaryProfile, $profiles, $rotations) {
            // Update Primary Profile
            $primaryProfile->stake_address = $this->stakeKey;
            $primaryProfile->keys = $rotations;
            $primaryProfile->save();

            // Merge others
            foreach ($profiles as $profile) {
                if ($profile->id === $primaryProfile->id) {
                    continue;
                }

                // Move relationships
                $profile->proposals()->update(['catalyst_profile_id' => $primaryProfile->id]);

                Log::info("Merging profile {$profile->id} ({$profile->catalyst_id}) into {$primaryProfile->id} ({$primaryProfile->catalyst_id})");

                // Soft Delete
                $profile->delete();
            }
        });

        Log::info('Merged '.$profiles->count()." profiles into {$primaryProfile->username} for stake key {$this->stakeKey}");
    }
}
