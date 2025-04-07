<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Drep;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DrepController extends Controller
{
    /**
     * Display a landing page.
     */
    public function index(Request $request): Response
    {
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
        return Inertia::render('Workflows/DrepSignup/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step2(Request $request): Response
    {
        return Inertia::render('Workflows/DrepSignup/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.drepSignup.selectProfile',
                'info' => 'workflows.drepSignup.selectProfileInfo',
            ],
            [
                'title' => 'workflows.drepSignup.selectProposal',
                'info' => 'workflows.drepSignup.selectProposalInfo',
            ],
        ]);
    }
}
