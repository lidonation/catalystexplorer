<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CatalystDrepData;
use App\Models\CatalystDrep;
use App\Models\Drep;
use App\Models\Signature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CatalystDrepController extends Controller
{
    /**
     * Display a landing page.
     */
    public function index(Request $request): Response
    {
        $drep = '';

        return Inertia::render('Dreps/Index');
    }

    /**
     * Display the specified resource.
     */
    public function list()
    {

        return Inertia::render('Dreps/DrepList', [
            'catalystDreps' => to_length_aware_paginator(
                CatalystDrepData::collect(
                    CatalystDrep::query()
                        ->paginate(11, ['*'], 'p', 1)
                )
            )->onEachSide(0),
            'filters' => [],
        ]);
    }

    /**
     * Summary of drep sign up Steps
     *
     * @param  mixed  $step
     */
    public function handleStep(Request $request, $step)
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {

        return Inertia::render('Workflows/CatalystDrepSignup/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step2(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => '1']);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Step2', [
            'catalystDrep' => $catalystDrep->hash,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step3(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => '1']);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Step3', [
            'catalystDrep' => $catalystDrep->hash,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step4(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => 1]);
        }

        if (empty($catalystDrep?->modelSignatures)) {
            return to_route('workflows.drepSignUp.index', ['step' => 3]);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Success', [
            'catalystDrep' => $catalystDrep->hash,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step5(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => 1]);
        }

        if (empty($catalystDrep?->modelSignatures)) {
            return to_route('workflows.drepSignUp.index', ['step' => 3]);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Step5', [
            'catalystDrep' => CatalystDrepData::from($catalystDrep),
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function saveDrep(Request $request)
    {
        $attributes = $request->validate([
            'name' => 'required|min:3',
            'bio' => 'min:100',
            'link' => 'url:http,https',
            'email' => 'email|unique:catalyst_dreps',
        ]);

        CatalystDrep::updateOrCreate(['user_id' => Auth::user()->id], $attributes);

        return to_route('workflows.drepSignUp.index', ['step' => 2]);
    }

    public function validateDrepWallet(CatalystDrep $catalystDrep, Request $request)
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

        $prevVotingHistory = DB::select('SELECT reg.stake_pub,
                            COUNT(DISTINCT cs.model_id) AS distinct_fund_ids
                        FROM public.voting_powers cvp
                        JOIN public.delegations d ON cvp.voter_id = d.cat_onchain_id
                        LEFT JOIN public.snapshots cs ON cvp.snapshot_id = cs.id
                        LEFT JOIN public.registrations reg ON d.registration_id = reg.id
                        WHERE cvp.consumed = true
                        AND cs.model_id IS NOT NULL
                        AND reg.stake_pub = ?
                        GROUP BY reg.stake_pub
            ', [$request->stakeAddress]);

        if (empty($prevVotingHistory) || $prevVotingHistory[0]?->distinct_fund_ids < 2) {
            return back()->withErrors(['message' => 'workflows.catalystDrepSignup.2roundsRule']);
        }

        return to_route('workflows.drepSignUp.index', ['step' => 3]);
    }

    public function captureSignature(CatalystDrep $catalystDrep, Request $request)
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

        // Create or update the signature
        $signature = Signature::updateOrCreate(
            [
                'signature' => $validated['signature'],
                'stake_key' => $validated['stake_key'],
                'stake_address' => $validated['stakeAddress'],
            ],
            $validated
        );

        // Attach the signature to the CatalystDrep if not already attached
        $catalystDrep->modelSignatures()->firstOrCreate([
            'model_id' => $catalystDrep->id,
            'model_type' => CatalystDrep::class,
            'signature_id' => $signature->id,
        ]);

        return to_route('workflows.drepSignUp.index', ['step' => 4]);
    }

    public function updateDrep(CatalystDrep $catalystDrep, Request $request)
    {

        $attributes = $request->validate([
            'objective' => 'required|min:200',
            'motivation' => 'required|min:200',
            'qualifications' => 'required|min:200',
        ]);

        $drep = $catalystDrep->update($attributes);

        if ($drep) {
            return to_route('workflows.drepSignUp.index', ['step' => 5]);
        }
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.catalystDrepSignup.createAccount',
                'info' => 'workflows.catalystDrepSignup.createAccountInfo',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.connectWallet',
                'info' => 'workflows.catalystDrepSignup.connectWalletInfo',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.signWallet',
                'info' => 'workflows.catalystDrepSignup.signWalletInfo',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.success',
                'info' => 'workflows.catalystDrepSignup.successInfo',
            ],
            [
                'title' => 'workflows.catalystDrepSignup.platformStatement',
                'info' => 'workflows.catalystDrepSignup.platformStatementInfo',
            ],
        ]);
    }
}
