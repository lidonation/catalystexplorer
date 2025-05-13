<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformHashToIds;
use App\DataTransferObjects\IdeascaleProfileData;
use App\Models\IdeascaleProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionMethod;
use Spatie\LaravelData\DataCollection;

class ClaimIdeascaleProfileController extends Controller
{
    public function handleStep(Request $request, $step, ?IdeascaleProfile $ideascaleProfile): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            $reflection = new ReflectionMethod($this, $method);

            $ideascaleParams = collect($reflection->getParameters())
                ->contains(fn ($param) => $param->getName() === 'ideascaleProfile');

            if ($ideascaleParams) {
                Log::info('here'.$ideascaleParams);

                return $this->$method($request, $ideascaleProfile);
            }

            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {
        return Inertia::render('Workflows/ClaimIdeascaleProfile/Step1', [
            'profiles' => $this->getIdeascaleProfiles($request->search),
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step2(Request $request): Response
    {

        $profileIdArr = (new TransformHashToIds)(collect($request->profile), new IdeascaleProfile);

        $profile = null;

        if (! empty($profileIdArr)) {
            $profile = IdeascaleProfile::find($profileIdArr[0]);
        }

        return Inertia::render('Workflows/ClaimIdeascaleProfile/Step2', [
            'profile' => $profile,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step3(Request $request, IdeascaleProfile $ideascaleProfile): Response
    {
        $profileIdArr = (new TransformHashToIds)(collect($request->profile), new IdeascaleProfile);

        $profile = null;

        if (! empty($profileIdArr)) {
            $profile = IdeascaleProfile::find($profileIdArr[0]);
        }

        return Inertia::render('Workflows/ClaimIdeascaleProfile/Step3', [
            'profile' => IdeascaleProfileData::from($profile),
            'verificationCode' => $profile->meta_info?->ideascale_verification_code,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 3,
        ]);
    }

    public function getIdeascaleProfiles($search): DataCollection|Collection
    {
        if (isset($search)) {
            return IdeascaleProfileData::collect(IdeascaleProfile::query()
                ->withCount(['proposals'])
                ->filter(request(['search']))->limit(15)->get());
        }

        return collect([]);
    }

    public function claimIdeascaleProfile(Request $request, IdeascaleProfile $ideascaleProfile): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'bio' => 'nullable|string|min:200',
            'ideascaleProfile' => 'nullable|string',
            'twitter' => 'nullable|string',
            'discord' => 'nullable|string',
            'linkedIn' => 'nullable|string',
        ]);

        $randomCode = Str::random(5);

        $ideascaleProfile->saveMeta('claim_data', (string) json_encode($request->all()));
        $ideascaleProfile->saveMeta('ideascale_verification_code', $randomCode);

        return to_route('workflows.claimIdeascaleProfile.index', ['step' => 3, 'profile' => $ideascaleProfile->hash]);
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.claimIdeascale.selectProfile',
                'info' => 'workflows.claimIdeascale.chooseProfile',
            ],
            [
                'title' => 'workflows.claimIdeascale.submitDetails',
                'info' => 'workflows.claimIdeascale.submitDetailsForm',
            ],
            [
                'title' => 'workflows.claimIdeascale.verification',
                'info' => 'workflows.claimIdeascale.verifyOnIdeascale',
            ],
        ]);
    }
}
