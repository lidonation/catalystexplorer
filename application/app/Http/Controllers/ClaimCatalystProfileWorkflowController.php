<?php

namespace App\Http\Controllers;

use App\Invokables\DecodeTransactionMetadataKey10;
use App\Models\CatalystProfile;
use App\Models\Signature;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClaimCatalystProfileWorkflowController extends Controller
{
    public function handleStep(Request $request, $step): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {

        return Inertia::render('Workflows/ClaimCatalystProfile/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step2(Request $request): Response
    {
        return Inertia::render('Workflows/ClaimCatalystProfile/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step3(Request $request): RedirectResponse|Response
    {

        $stakeAddress = $request->stakeAddress;
        $catalystProfile = null;

        $transaction = Transaction::where('stake_key', $stakeAddress)
            ->where('type', 'x509_envelope')
            ->first();

        if (! $transaction) {
            return Inertia::render('Workflows/ClaimCatalystProfile/Step3', [
                'stepDetails' => $this->getStepDetails(),
                'activeStep' => intval($request->step),
                'catalystProfile' => null,
                'stakeAddress' => $stakeAddress,
            ]);
        }

        $metadataArray = json_decode(json_encode($transaction->raw_metadata), true);

        $decodedData = (new DecodeTransactionMetadataKey10)($metadataArray);

        $catalystId = rtrim($decodedData['catalyst_profile_id'] ?? '', '=');

        $catalystProfile = DB::table('catalyst_profiles')->where('catalyst_id', 'LIKE', "%{$catalystId}%")->first();

        return Inertia::render('Workflows/ClaimCatalystProfile/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'catalystProfile' => $catalystProfile,
            'stakeAddress' => $stakeAddress,
        ]);
    }

    public function step4(Request $request): Response
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

        return to_route('workflows.claimCatalystProfile.index', ['step' => 2]);
    }

    public function claimCatalystProfile(Request $request, CatalystProfile $catalystProfile): RedirectResponse|Response
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'username' => 'required|string',
            'catalystId' => 'nullable|string',
            'stakeAddress' => 'nullable|string',
        ]);

        DB::table('catalyst_profiles')
            ->where('id', $catalystProfile->id)
            ->update([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'claimed_by' => Auth::id(),
                'updated_at' => now(),
            ]);

        return to_route('workflows.claimCatalystProfile.index', ['step' => 4]);
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
}
