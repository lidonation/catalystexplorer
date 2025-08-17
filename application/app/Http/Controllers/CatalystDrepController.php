<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CatalystDrepData;
use App\Models\CatalystDrep;
use App\Models\Drep;
use App\Models\Signature;
use App\Models\User;
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

        $user = Auth::user();


        $delegatedDrepStakeAddress = DB::table('catalyst_drep_user')
            ->where('user_id', $user?->id)
            ->pluck('catalyst_drep_stake_address')
            ->first();

        return Inertia::render('Dreps/DrepList', [
            'catalystDreps' => to_length_aware_paginator(
                CatalystDrepData::collect(
                    CatalystDrep::query()
                        ->paginate(11, ['*'], 'p', 1)
                )
            )->onEachSide(0),
            'filters' => [],
            'delegatedDrepStakeAddress' => $delegatedDrepStakeAddress
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
        $catalystDrep = CatalystDrep::find($request->catalystDrep);

        return Inertia::render('Workflows/CatalystDrepSignup/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'catalystDrep' => $catalystDrep,
        ]);
    }

    public function step2(Request $request): RedirectResponse|Response
    {
        $catalystDrep = CatalystDrep::where('user_id', Auth::user()->id)->first();

        if (empty($catalystDrep?->id)) {
            return to_route('workflows.drepSignUp.index', ['step' => '1']);
        }

        return Inertia::render('Workflows/CatalystDrepSignup/Step2', [
            'catalystDrep' => $catalystDrep->id,
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
            'catalystDrep' => $catalystDrep->id,
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
            'catalystDrep' => $catalystDrep->id,
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
            'email' => 'email',
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
                'stake_key' => $validated['stake_key'],
                'stake_address' => $validated['stakeAddress'],
                'user_uuid' => Auth::user()->id,
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
            'objective' => 'required|min:69',
            'motivation' => 'required|min:69',
            'qualifications' => 'required|min:69',
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

    public function delegate()
    {
        return $this->collectUserSignature(Auth::user(), request());
    }

    public function collectUserSignature(User $user, Request $request)
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

        $userStakeAddress = $validated['stakeAddress'];
        $hasAuthenticatedUserDelegated = false;

        if ($user) {
            $hasAuthenticatedUserDelegated = DB::table('catalyst_drep_user')->where('user_id', $user->id)
                ->where('user_stake_address', $userStakeAddress)
                ->exists();
        }

        if ($hasAuthenticatedUserDelegated) {
            return response()->json([
                'error' => 'You can only delegate once',
            ], 422);
        }

        $signature = Signature::updateOrCreate(
            [
                'stake_key'    => $validated['stake_key'],
                'stake_address' => $validated['stakeAddress'],
                'user_uuid' => Auth::user()->id,
            ],
            $validated
        );

        $user->modelSignatures()->firstOrCreate(
            [
                'model_id' => $user->id,
                'model_type' => User::class,
                'signature_id' => $signature->id,
            ]
        );

        $drepStakeAddress = $request->validate(
            [
                'drep_stake_address' => [
                    'required',
                    "regex:$stakeAddressPattern",
                ],
            ],
            [
                'drep_stake_address.required' => 'DRep stake address is required.',
                'drep_stake_address.regex' => 'DRep stake address format is invalid.',
            ]
        );
        if (empty($drepStakeAddress['drep_stake_address'])) {
            return response()->json([
                'error' => 'The DRep stake address is required and cannot be empty.',
            ], 422);
        }

        $drepId = DB::table('signatures')
            ->join('catalyst_dreps', 'catalyst_dreps.user_id', '=', 'signatures.user_uuid')
            ->where('signatures.stake_address', $drepStakeAddress['drep_stake_address'])
            ->value('catalyst_dreps.id');

        if (!$drepId) {
            return response()->json([
                'error' => 'DRep not found for provided stake address',
            ], 422);
        }


        DB::table('catalyst_drep_user')->updateOrInsert(
            [
                'user_id'         => $user->id,
                'catalyst_drep_id'         => $drepId,
                'user_stake_address'     => $validated['stakeAddress'],
                'catalyst_drep_stake_address' => $drepStakeAddress['drep_stake_address'],
            ],
            [
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );


        return response()->json([
            'message' => 'Delegation successful!',
        ], 200);
    }

    public function undelegate(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'stakeAddress' => 'required|string',
            'drepStakeAddress' => 'required|string',
        ]);

        DB::table('catalyst_drep_user')->where([
            'user_id' => $user->id,
            'user_stake_address' => $validated['stakeAddress'],
            'catalyst_drep_stake_address' => $validated['drepStakeAddress'],
        ])->delete();

        return response()->json([
            'message' => 'Undelegation successful!'
        ], 200);
    }
};
