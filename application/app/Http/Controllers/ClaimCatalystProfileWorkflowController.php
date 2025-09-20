<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\DecodeTransactionMetadataKey10;
use App\Models\CatalystProfile;
use App\Models\Proposal;
use App\Models\Signature;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ClaimCatalystProfileWorkflowController extends Controller
{
    public function handleStep(Request $request, $step, ?Proposal $proposal = null): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($request, $proposal);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {
        $proposal = $request->proposal;

        return Inertia::render('Workflows/ClaimCatalystProfile/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'proposal' => $proposal,
        ]);
    }

    public function step2(Request $request, ?Proposal $proposal = null): Response
    {
        $proposal = $request->proposal;

        return Inertia::render('Workflows/ClaimCatalystProfile/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'proposal' => $proposal,
        ]);
    }

    public function step3(Request $request, ?Proposal $proposal = null): RedirectResponse|Response
    {
        $context = '';
        if ($request->proposal) {
            $context = 'Claiming proposal';
        }
        $proposal = $request->proposal;

        $stakeAddress = $request->stakeAddress;

        $transaction = Transaction::where('stake_key', $stakeAddress)
            ->where('type', 'x509_envelope')
            ->first();

        if (! $transaction) {
            return Inertia::render('Workflows/ClaimCatalystProfile/Step3', [
                'stepDetails' => $this->getStepDetails(),
                'activeStep' => intval($request->step),
                'catalystProfile' => null,
                'stakeAddress' => $stakeAddress,
                'context' => $context,
                'proposal' => null,
            ]);
        }

        $metadataArray = json_decode(json_encode($transaction->raw_metadata), true);

        $decodedData = (new DecodeTransactionMetadataKey10)($metadataArray);

        $catalystId = rtrim($decodedData['catalyst_profile_id'] ?? '', '=');

        $catalystProfile = CatalystProfile::where('catalyst_id', 'LIKE', "%{$catalystId}%")
            ->first();

        if (! $catalystProfile) {
            return Inertia::render('Workflows/ClaimCatalystProfile/Step3', [
                'stepDetails' => $this->getStepDetails(),
                'activeStep' => intval($request->step),
                'catalystProfile' => null,
                'stakeAddress' => $stakeAddress,
                'context' => $context,
                'proposal' => null,
            ]);
        }

        $proposalBelongsToProfile = $proposal && $catalystProfile &&
            $catalystProfile->proposals()->where('proposals.id', $proposal->id)->exists();

        if (! $proposalBelongsToProfile) {
            return Inertia::render('Workflows/ClaimCatalystProfile/Step3', [
                'stepDetails' => $this->getStepDetails(),
                'activeStep' => intval($request->step),
                'catalystProfile' => $catalystProfile,
                'stakeAddress' => $stakeAddress,
                'context' => $context,
                'proposal' => null,
            ]);
        }

        return Inertia::render('Workflows/ClaimCatalystProfile/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'catalystProfile' => $catalystProfile,
            'stakeAddress' => $stakeAddress,
            'context' => $context,
            'proposal' => $proposal,
        ]);
    }

    public function step4(Request $request, ?Proposal $proposal = null): Response
    {
        return Inertia::render('Workflows/ClaimCatalystProfile/Success', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function signWallet()
    {
        return $this->collectUserSignature(Auth::user(), request());
    }

    public function collectUserSignature(User $user, Request $request): RedirectResponse|Response
    {
        $proposal = $request->proposal;
        $stakeAddressPattern = app()->environment('production')
            ? '/^stake1[0-9a-z]{38,}$/'
            : '/^stake_test1[0-9a-z]{38,}$/';

        $validated = $request->validate([
            'signature' => 'required|string',
            'signature_key' => 'required|string',
            'stake_key' => 'required|string',
            'stakeAddress' => [
                'required',
                "regex:$stakeAddressPattern",
            ],
        ]);

        $signature = Signature::updateOrCreate(
            [
                'stake_key' => $validated['stake_key'],
                'stake_address' => $validated['stakeAddress'],
                'user_id' => Auth::user()->id,
            ],
            $validated
        );

        $user->modelSignatures()->updateOrCreate(
            [
                'model_id' => Auth::user()->id,
                'model_type' => User::class,
                'signature_id' => $signature->id,
            ]
        );

        return to_route('workflows.claimCatalystProfile.index', [
            'step' => 3,
            'stakeAddress' => $signature->stake_address,
            'proposal' => $proposal,
        ]);
    }

    public function validateWallet(Request $request)
    {
        $stakeAddressPattern = app()->environment('production')
            ? '/^stake1[0-9a-z]{38,}$/'
            : '/^stake_test1[0-9a-z]{38,}$/';

        $request->validate([
            'stakeAddress' => [
                'required',
                "regex:$stakeAddressPattern",
            ],
        ]);

        $proposalId = $request->proposal;

        return to_route('workflows.claimCatalystProfile.index', [
            'step' => 2,
            'proposal' => $proposalId,
        ]);
    }

    public function claimCatalystProfile(Request $request, CatalystProfile $catalystProfile): RedirectResponse|Response
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'username' => 'required|string',
            'catalystId' => 'nullable|string',
            'stakeAddress' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Check if profile can be claimed by this user
        if (! $this->canClaimProfile($catalystProfile, $user)) {
            return redirect()->back()->withErrors([
                'profile' => 'This profile has already been claimed by another user.',
            ]);
        }

        DB::transaction(function () use ($catalystProfile, $validated, $user) {
            // the claimed_by update here is just here for backward compatibility.
            // do not rely on it
            $catalystProfile->update([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'claimed_by' => $user->id,
            ]);

            // Create claimed profile entry using BelongsToMany attach (like Proposal pattern)
            if (! $user->claimed_catalyst_profiles()->where('claimable_id', $catalystProfile->id)->exists()) {
                $user->claimed_catalyst_profiles()->attach($catalystProfile->id, [
                    'claimable_type' => CatalystProfile::class,
                    'claimed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        // Update search index for related proposals
        $relatedProposals = $catalystProfile->proposals;
        if ($relatedProposals->isNotEmpty()) {
            $relatedProposals->searchable();
        }

        Log::info('Catalyst profile claimed', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'catalyst_profile_id' => $catalystProfile->id,
            'catalyst_profile_name' => $catalystProfile->name,
            'catalyst_profile_username' => $catalystProfile->username,
        ]);

        $user->load('claimed_catalyst_profiles', 'claimed_ideascale_profiles');

        return to_route('workflows.claimCatalystProfile.index', ['step' => 4])
            ->with('success', 'Catalyst profile successfully claimed!');
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.claimCatalystProfile.connectWallet',
            ],
            [
                'title' => 'workflows.claimCatalystProfile.signWallet',
            ],
            [
                'title' => 'workflows.claimCatalystProfile.confirmAction',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.success',
            ],
        ]);
    }

    /**
     * Check if a CatalystProfile can be claimed by the given user
     * Uses BelongsToMany relationship like Proposal pattern
     */
    private function canClaimProfile(CatalystProfile $catalystProfile, User $user): bool
    {
        // Check if current user already claimed this profile
        $claimedByCurrentUser = $user->claimed_catalyst_profiles()
            ->where('claimable_id', $catalystProfile->id)
            ->exists();

        // Check if profile is claimed by others
        $claimedByOthers = $catalystProfile->claimed_by_users()->where('user_id', '!=', $user->id)->exists();

        return ! $claimedByOthers || $claimedByCurrentUser;
    }

    /**
     * Check if a profile is already claimed using BelongsToMany relationship
     */
    private function isProfileClaimed(CatalystProfile $catalystProfile): bool
    {
        return $catalystProfile->claimed_by_users()->exists();
    }
}
