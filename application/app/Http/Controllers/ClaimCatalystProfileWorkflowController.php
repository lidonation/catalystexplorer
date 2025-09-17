<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\CatalystProfileData;
use App\Invokables\DecodeTransactionMetadataKey0;
use App\Invokables\DecodeTransactionMetadataKey10;
use App\Models\CatalystProfile;
use App\Models\Signature;
use App\Models\Transaction;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
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

    public function step3(Request $request): Response
    {
        return Inertia::render('Workflows/ClaimCatalystProfile/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'catalystProfile' => $request->catalystProfile,
            'stakeAddress' => $request->stakeAddress ?? null,
            'catalystId' => $request->catalystId ?? null,
        ]);
    }

    public function collectUserSignature(User $user, Request $request): string
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
                'model_id' => $user->id,
                'model_type' => User::class,
                'signature_id' => $signature->id,
            ]
        );

        return $signature->stake_address;
    }

    public function checkUserTransaction()
    {
        $user = Auth::user();
        $stakeAddress = $this->collectUserSignature($user, request());
        $catalystProfile = null;

        $transaction = Transaction::where('stake_key', $stakeAddress)
            ->where('type', 'x509_envelope')
            ->first();

        if (!$transaction) {
            return to_route('workflows.claimCatalystProfile.index', [
                'step' => 3,
                'catalystProfile' => [],
            ]);
        }

        $metadataArray = json_decode(json_encode($transaction->raw_metadata), true);

        $decodedData = (new DecodeTransactionMetadataKey10)($metadataArray);

        $catalystId = rtrim($decodedData['catalyst_profile_id'] ?? '', '=');

        $catalystProfile = CatalystProfileData::from(CatalystProfile::where('catalyst_id', $catalystId)->first());


        return to_route('workflows.claimCatalystProfile.index', [
            'step' => 3,
            'catalystProfile' => $catalystProfile,
            'stakeAddress' => $stakeAddress,
            'catalystId' => $catalystId,
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
            ]
        ]);
    }
}
