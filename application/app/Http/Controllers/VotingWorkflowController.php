<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Proposal;
use App\Models\Snapshot;
use App\Models\Voter;
use App\Models\VoterHistory;
use App\Models\VotingPower;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionMethod;

class VotingWorkflowController extends Controller
{
    public function handleStep(Request $request, $step, ?string $sessionId = null): mixed
    {
        $method = "step$step";

        if (method_exists($this, $method)) {
            $reflection = new ReflectionMethod($this, $method);
            $sessionParams = collect($reflection->getParameters())
                ->contains(fn ($param) => $param->getName() === 'sessionId');

            if ($sessionParams && $sessionId) {
                if (!$this->getVotingSession($sessionId)) {
                    return redirect()->route('workflows.voting.index', ['step' => 1])
                        ->withErrors(['error' => 'Invalid or expired voting session.']);
                }
                return $this->$method($request, $sessionId);
            }

            return $this->$method($request);
        }

        abort(404, "Step '$step' not found.");
    }

    private function createVotingSession()
    {
        $sessionId = Str::uuid()->toString();
        $userId = Auth::id();
        session(["voting_session_{$sessionId}" => [
            'user_id' => $userId,
            'created_at' => now()->timestamp,
            'proposals' => [],
            'decisions' => [],
            'signature' => null,
            'transaction_id' => null,
        ]]);

        return $sessionId;
    }

    private function getVotingSession($sessionId)
    {
        if (!empty($session) && $session['user_id'] !== Auth::id()) {
            return [];
        }
        return session("voting_session_{$sessionId}", []);
    }

    private function updateVotingSession($sessionId, $data)
    {
        $session = $this->getVotingSession($sessionId);
        if (empty($session)) {
            return false;
        }
        session(["voting_session_{$sessionId}" => array_merge($session, $data)]);
        return true;
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.voting.selectVotes',
                'info' => 'workflows.voting.makeVotingDecisions',
            ],
            [
                'title' => 'workflows.voting.reviewVotes',
                'info' => 'workflows.voting.verifyYourVotes',
            ],
            [
                'title' => 'workflows.voting.signBallot',
                'info' => 'workflows.voting.signWithWallet',
            ],
            [
                'title' => 'workflows.voting.submitVotes',
                'info' => 'workflows.voting.confirmSubmission',
            ],
        ]);
    }


    public function step1(Request $request): Response
    {
        $snapshot = Snapshot::where('active', true)->latest()->first();

        if (!$snapshot) {
            abort(404, 'No active voting snapshot found.');
        }

        $user = Auth::user();
        $voter = Voter::where('stake_pub', $user->stake_address)->first();

        if (!$voter) {
            abort(403, 'No voter record found for your account.');
        }

        $votingPower = VotingPower::where('stake_pub', $voter->id)
            ->where('consumed', false)
            ->where('snapshot_id', $snapshot->id)
            ->first();

        if (!$votingPower) {
            abort(403, 'You have no available voting power for the current snapshot.');
        }

        $proposals = Proposal::whereHas('fund', function($query) use ($snapshot) {
            $query->where('snapshot_id', $snapshot->id);
        })->get();

        $sessionId = $this->createVotingSession();
        $this->updateVotingSession($sessionId, [
            'proposals' => $proposals->pluck('id')->toArray(),
            'snapshot_id' => $snapshot->id,
            'voter_id' => $voter->id,
            'voting_power_id' => $votingPower->id,
        ]);

        return Inertia::render('Workflows/Voting/Step1', [
            'proposals' => $proposals,
            'snapshot' => $snapshot,
            'votingPower' => $votingPower,
            'sessionId' => $sessionId,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 1,
        ]);
    }

    public function saveVotingDecisions(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sessionId' => 'required|string',
            'decisions' => 'required|array',
        ]);

        $this->updateVotingSession($validated['sessionId'], [
            'decisions' => $validated['decisions']
        ]);

        return redirect()->route('workflows.voting.index', [
            'step' => 2,
            'sessionId' => $validated['sessionId']
        ]);
    }

    public function step2(Request $request, string $sessionId): Response
    {
        $session = $this->getVotingSession($sessionId);

        if (empty($session['decisions'])) {
            return redirect()->route('workflows.voting.index', ['step' => 1]);
        }

        $proposals = Proposal::whereIn('id', array_keys($session['decisions']))->get();

        return Inertia::render('Workflows/Voting/Step2', [
            'session' => $session,
            'proposals' => $proposals,
            'sessionId' => $sessionId,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 2,
        ]);
    }

    public function step3(Request $request, string $sessionId): Response
    {
        $session = $this->getVotingSession($sessionId);

        if (empty($session['decisions'])) {
            return redirect()->route('workflows.voting.index', ['step' => 1]);
        }

        $signatureData = [
            'snapshot_id' => $session['snapshot_id'] ?? null,
            'decisions' => $session['decisions'],
            'timestamp' => now()->timestamp,
        ];

        return Inertia::render('Workflows/Voting/Step3', [
            'session' => $session,
            'signatureData' => json_encode($signatureData),
            'sessionId' => $sessionId,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 3,
        ]);
    }

    public function signBallot(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sessionId' => 'required|string',
            'signature' => 'required|string',
            'signingMethod' => 'required|string|in:online,offline',
        ]);

        $this->updateVotingSession($validated['sessionId'], [
            'signature' => $validated['signature'],
            'signingMethod' => $validated['signingMethod'],
        ]);

        return redirect()->route('workflows.voting.index', [
            'step' => 4,
            'sessionId' => $validated['sessionId'],
        ]);
    }

    public function step4(Request $request, string $sessionId): Response
    {
        $session = $this->getVotingSession($sessionId);

        if (empty($session['signature'])) {
            return redirect()->route('workflows.voting.index', ['step' => 3, 'sessionId' => $sessionId]);
        }

        return Inertia::render('Workflows/Voting/Step4', [
            'session' => $session,
            'sessionId' => $sessionId,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 4,
            'transactionId' => $session['transaction_id'] ?? null,
        ]);
    }

    public function submitVotes(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sessionId' => 'required|string',
        ]);

        $sessionId = $validated['sessionId'];
        $session = $this->getVotingSession($sessionId);

        if (empty($session['signature'])) {
            return redirect()->route('workflows.voting.index', ['step' => 3, 'sessionId' => $sessionId]);
        }

        \DB::beginTransaction();

        try {
            $voter = Voter::findOrFail($session['voter_id']);
            $votingPower = VotingPower::findOrFail($session['voting_power_id']);

            if ($votingPower->consumed) {
                throw new \Exception('This voting power has already been consumed.');
            }

            foreach ($session['decisions'] as $proposalId => $decision) {
                VoterHistory::create([
                    'caster' => $voter->cat_id,
                    'stake_address' => $voter->stake_pub,
                    'proposal_id' => $proposalId,
                    'vote' => $decision === 'yes' ? 1 : 0, // 1 for yes, 0 for abstain
                    'created_at' => now(),
                ]);
            }

            $votingPower->update([
                'consumed' => true,
                'votes_cast' => count($session['decisions']),
            ]);

            $transactionId = 'tx_' . Str::random(32);

            $this->updateVotingSession($sessionId, [
                'transaction_id' => $transactionId,
                'submitted_at' => now()->toDateTimeString(),
            ]);

            \DB::commit();

            return redirect()->route('workflows.voting.index', [
                'step' => 4,
                'sessionId' => $sessionId,
            ])->with('success', 'Votes submitted successfully!');

        } catch (\Exception $e) {
            \DB::rollBack();

            return back()->withErrors(['error' => 'Failed to submit votes: ' . $e->getMessage()]);
        }
    }
}
