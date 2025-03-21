<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;

class ClaimIdeascaleProfileController extends Controller
{
    public function handleStep($step)
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($step);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1()
    {

        return Inertia::render('Workflows/ClaimIdeascaleProfile/Step1', [
            // 'profiles' => $claimedIdeascaleProfiles,
        ]);
    }
}
