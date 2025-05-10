<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Drep;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Signature;
use App\Models\CatalystDrep;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\DataTransferObjects\CatalystDrepData;
use Illuminate\Validation\ValidationException;

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
        $catalysDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalysDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => '1']);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Step2', [
            'catalysDrep' => $catalysDrep->hash,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step3(Request $request): Response
    {
        return Inertia::render('Workflows/CatalystDrepSignup/Step3', [
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
    public function validateDrepWallet(CatalystDrep $catalysDrep, Request $request)
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
            ',  ['stake1u80hpp5qp7k58q5v3qztfee0vzdaf3pt6ff0e3hvxegtugs64a6qm']);


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
                'stake_key' => $validated['stake_key']
            ],
            $validated
        );

        // Attach the signature to the CatalystDrep if not already attached
        $catalystDrep->modelSignatures()->firstOrCreate([
            'model_id' => $catalystDrep->id,
            'model_type' => CatalystDrep::class,
            'signature_id' => $signature->id,
        ]);
    }

    public function updateDrep(CatalystDrep $catalysDrep, Request $request)
    {

        $attributes = $request->validate([
            'objective' => 'nullable|min:100',
            'motivation' => 'nullable|min:100',
            'qualifications' => 'nullable|min:100'
        ]);

        $drep = CatalystDrep::update(['id' => $catalysDrep->id], $attributes);

        return $drep;
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
        ]);
    }
}
