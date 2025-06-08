<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Signature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionMethod;

class SignatureWorkflowController extends Controller
{
    public function handleStep(Request $request, $step): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            $reflection = new ReflectionMethod($this, $method);

            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {

        return Inertia::render('Workflows/SignatureCapture/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step2(Request $request): Response
    {
        $walletData = $request->session()->get('wallet_data', []);
        $signatureData = $request->session()->get('signature_data', []);

        $existingSignatures = [];
        if (isset($walletData['stake_key'])) {
            $existingSignatures = Signature::where('user_id', Auth::id())
                ->where('stake_key', $walletData['stake_key'])
                ->get();
        }

        return Inertia::render('Workflows/SignatureCapture/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'walletData' => $walletData,
            'signatureData' => $signatureData,
            'existingSignatures' => $existingSignatures,
            'flash' => session()->only(['success', 'error']),
        ]);
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Workflows/SignatureCapture/Success');
    }

    public function signMessage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'wallet' => 'required|string',
            'walletAddress' => 'nullable|string',
            'network' => 'nullable|string',
            'networkId' => 'nullable|string',
            'stake_key' => 'nullable|string',
            'stake_address' => 'nullable|string',
        ]);

        $request->session()->put('wallet_data', $validated);

        return to_route('workflows.signature.index', [
            'step' => 2,
        ]);
    }

    public function saveSignature(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'signature' => 'required|string:signatures,signature',
            'signature_key' => 'required|string|unique:signatures,signature_key',
            'message' => 'required|string',
        ]);

        $walletData = $request->session()->get('wallet_data', []);

        $signatureData = [
            'stake_key' => $walletData['stake_key'] ?? '',
            'stake_address' => $walletData['stake_address'] ?? '',
            'signature' => $validated['signature'],
            'signature_key' => $validated['signature_key'],
            'message' => $validated['message'],
            'wallet_provider' => $walletData['wallet'] ?? '',
        ];

        $request->session()->put('signature_data', $signatureData);

        $existingSignature = Signature::where('user_id', Auth::id())
            ->where('stake_key', $signatureData['stake_key'])
            ->where('signature', $signatureData['signature'])
            ->first();

        if ($existingSignature) {
            return to_route('workflows.signature.index', [
                'step' => 2,
            ])->with('error', 'Duplicate signature detected. This signature has already been saved.');
        }

        try {
            Signature::updateOrCreate([
                'stake_key' => $signatureData['stake_key'],
                'stake_address' => $signatureData['stake_address'],
                'signature' => $signatureData['signature'],
                'signature_key' => $signatureData['signature_key'],
            ], [

                'wallet_provider' => $signatureData['wallet_provider'],
                'user_id' => Auth::id(),
            ]);

            return to_route('workflows.signature.success');
        } catch (\Exception $e) {
            return to_route('workflows.signature.index', [
                'step' => 2,
            ])->with('error', 'Failed to save signature: ' . $e->getMessage());
        }
    }

    private function getStepDetails(): array
    {
        return [
            [
                'title' => __('workflows.signature.steps.connectWallet'),
            ],
            [
                'title' => __('workflows.signature.steps.signHotWallet'),
            ],
        ];
    }
}
