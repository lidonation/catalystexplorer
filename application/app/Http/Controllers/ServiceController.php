<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CategoryData;
use App\DataTransferObjects\ServiceData;
use App\Enums\ServiceWorkflowParams;
use App\Enums\ServiceTypeEnum;
use App\Models\Category;
use App\Models\Location;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionMethod;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Service::with(['user:id,name,email', 'categories:id,name,slug', 'locations:id,city'])
            ->latest();
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'ilike', '%'.$request->search.'%')
                    ->orWhere('description', 'ilike', '%'.$request->search.'%');
            });
        }

        return Inertia::render('Services/Index', [
            'services' => ServiceData::collection($query->paginate(24)),
            'viewType' => 'all',
        ]);
    }

    public function myServices(): Response
    {
        return Inertia::render('My/Services/Index', [
            'services' => ServiceData::collection(
                Service::with(['user:id,name,email', 'categories:id,name,slug', 'locations:id,city'])
                    ->where('user_id', auth()->id())
                    ->latest()
                    ->paginate(24)
            ),
            'viewType' => 'user',
        ]);
    }

    public function show(Service $service): Response
    {
        return Inertia::render('Services/Show', [
            'service' => ServiceData::from($service->load([
                'user:id,name,email',
                'categories:id,name,slug',
                'locations:id,city,region,country',
            ])),
            'relatedServices' => $this->getRelatedServices($service),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Services/Create', [
            'categories' => Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with('children:id,name,parent_id,slug')
                ->get(['id', 'name', 'slug']),
            'locations' => Location::select('id', 'city', 'region')
                ->whereNotNull('city')
                ->orderBy('city')
                ->get(),
            'defaults' => [
                'contact' => [
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'website' => auth()->user()->website,
                    'github' => auth()->user()->github,
                    'linkedin' => auth()->user()->linkedin,
                ],
                'location' => auth()->user()->location?->id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'type' => 'required|string|in:' . implode(',', ServiceTypeEnum::toValues()),
            'header_image' => 'nullable|image|max:5120',
            'categories' => 'required|array|min:1|max:5',
            'categories.*' => 'exists:categories,id',
            'location' => 'nullable|exists:locations,id',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'github' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
        ]);

        $service = auth()->user()->services()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'name' => $validated['name'] ?? null,
            'email' => $validated['email'] ?? null,
            'website' => $validated['website'] ?? null,
            'github' => $validated['github'] ?? null,
            'linkedin' => $validated['linkedin'] ?? null,
        ]);

        if ($request->hasFile('header_image')) {
            $service->addMedia($request->file('header_image'))
                ->toMediaCollection('header');
        }

        $service->categories()->attach($validated['categories']);

        if ($validated['location'] ?? false) {
            $service->locations()->attach($validated['location']);
        }

        return redirect()
            ->route('services.show', $service)
            ->with('success', 'Service created successfully!');
    }

    protected function getRelatedServices(Service $service, int $limit = 4)
    {
        return ServiceData::collection(
            Service::with(['user:id,name', 'categories:id,name'])
                ->where('id', '!=', $service->id)
                ->whereHas('categories', fn ($q) => $q->whereIn('id', $service->categories->pluck('id')))
                ->limit($limit)
                ->get()
        );
    }

    // Workflow methods
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
        $validated = $request->validate([
            ServiceWorkflowParams::SERVICE_HASH()->value => 'nullable|string',
        ]);

        $existingService = null;
        $serviceData = [];

        if (!empty($validated[ServiceWorkflowParams::SERVICE_HASH()->value])) {
            $existingService = Service::byHash($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);
            if ($existingService && $existingService->user_id === auth()->id()) {
                $serviceData = [
                    ServiceWorkflowParams::TITLE()->value => $existingService->title,
                    ServiceWorkflowParams::DESCRIPTION()->value => $existingService->description,
                    ServiceWorkflowParams::TYPE()->value => $existingService->type->value,
                    ServiceWorkflowParams::CATEGORIES()->value => $existingService->categories->pluck('slug')->toArray(),
                ];
            }
        }

        return Inertia::render('Workflows/CreateService/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'categories' => Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with('children:id,name,parent_id,slug')
                ->get(['id', 'name', 'slug']),
            'serviceHash' => $validated[ServiceWorkflowParams::SERVICE_HASH()->value] ?? null,
            'serviceData' => $serviceData,
        ]);
    }

    public function step2(Request $request): Response
    {
        $validated = $request->validate([
            ServiceWorkflowParams::SERVICE_HASH()->value => 'nullable|string',
        ]);

        $existingService = null;
        $serviceData = [];

        if (!empty($validated[ServiceWorkflowParams::SERVICE_HASH()->value])) {
            $existingService = Service::byHash($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);
            if ($existingService && $existingService->user_id === auth()->id()) {
                $serviceData = [
                    ServiceWorkflowParams::NAME()->value => $existingService->name,
                    ServiceWorkflowParams::EMAIL()->value => $existingService->email,
                    ServiceWorkflowParams::WEBSITE()->value => $existingService->website,
                    ServiceWorkflowParams::GITHUB()->value => $existingService->github,
                    ServiceWorkflowParams::LINKEDIN()->value => $existingService->linkedin,
                    ServiceWorkflowParams::CATEGORIES()->value => $existingService->categories->pluck('slug')->toArray(),
                    ServiceWorkflowParams::LOCATION()->value => $existingService->locations->first()?->city,
                ];
            }
        }

        return Inertia::render('Workflows/CreateService/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'serviceHash' => $validated[ServiceWorkflowParams::SERVICE_HASH()->value] ?? null,
            'serviceData' => $serviceData,
            'defaults' => [
                'contact' => [
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'website' => auth()->user()->website,
                    'github' => auth()->user()->github,
                    'linkedin' => auth()->user()->linkedin,
                ],
                'location' => auth()->user()->location?->city,
            ],
        ]);
    }

    public function saveServiceDetails(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            ServiceWorkflowParams::TITLE()->value => 'required|string|max:255',
            ServiceWorkflowParams::DESCRIPTION()->value => 'required|string|max:5000',
            ServiceWorkflowParams::TYPE()->value => 'required|string|in:' . implode(',', \App\Enums\ServiceTypeEnum::toValues()),
            ServiceWorkflowParams::CATEGORIES()->value => 'required|array|min:1|max:5',
            ServiceWorkflowParams::CATEGORIES()->value.'.*' => 'exists:categories,slug',
            ServiceWorkflowParams::SERVICE_HASH()->value => 'nullable|string',
        ]);

        $existingService = null;

        if (!empty($validated[ServiceWorkflowParams::SERVICE_HASH()->value])) {
            $existingService = Service::byHash($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);
        }

        $serviceData = [
            'title' => $validated[ServiceWorkflowParams::TITLE()->value],
            'description' => $validated[ServiceWorkflowParams::DESCRIPTION()->value],
            'type' => $validated[ServiceWorkflowParams::TYPE()->value],
            'user_id' => auth()->id(),
        ];

        if ($existingService && $existingService->user_id === auth()->id()) {
            $existingService->update($serviceData);
            $service = $existingService;
        } else {
            $service = Service::create($serviceData);
        }

        if ($request->hasFile(ServiceWorkflowParams::HEADER_IMAGE()->value)) {
            $service->clearMediaCollection('header');
            $service->addMedia($request->file(ServiceWorkflowParams::HEADER_IMAGE()->value))
                ->toMediaCollection('header');
        }
        
        $categoryIds = Category::whereIn('slug', $validated[ServiceWorkflowParams::CATEGORIES()->value])->pluck('id')->toArray();
        $service->categories()->sync($categoryIds);

        return redirect()->route('workflows.createService.index', [
            ServiceWorkflowParams::STEP()->value => 2,
            ServiceWorkflowParams::SERVICE_HASH()->value => $service->hash,
        ]);
    }

    public function saveContactAndLocation(Request $request): RedirectResponse
    {

        $validated = $request->validate([
            ServiceWorkflowParams::SERVICE_HASH()->value => 'required|string',
            ServiceWorkflowParams::LOCATION()->value => 'nullable|string|max:255',
            ServiceWorkflowParams::NAME()->value => 'nullable|string|max:255',
            ServiceWorkflowParams::EMAIL()->value => 'nullable|email|max:255',
            ServiceWorkflowParams::WEBSITE()->value => 'nullable|url|max:255',
            ServiceWorkflowParams::GITHUB()->value => 'nullable|string|max:255',
            ServiceWorkflowParams::LINKEDIN()->value => 'nullable|string|max:255',
        ]);

        $service = Service::byHash($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);

        if (!$service || $service->user_id !== auth()->id()) {
            return redirect()->route('workflows.createService.index', [ServiceWorkflowParams::STEP()->value => 1])
                ->with('error', 'Service not found or access denied.');
        }

        $service->update([
            'name' => $validated[ServiceWorkflowParams::NAME()->value] ?? null,
            'email' => $validated[ServiceWorkflowParams::EMAIL()->value] ?? null,
            'website' => $validated[ServiceWorkflowParams::WEBSITE()->value] ?? null,
            'github' => $validated[ServiceWorkflowParams::GITHUB()->value] ?? null,
            'linkedin' => $validated[ServiceWorkflowParams::LINKEDIN()->value] ?? null,
        ]);
;

        if (!empty($validated[ServiceWorkflowParams::LOCATION()->value])) {
            $cityName = trim($validated[ServiceWorkflowParams::LOCATION()->value]);
            $location = Location::firstOrCreate(
                ['city' => $cityName],
                ['city' => $cityName]
            );
            $service->locations()->sync([$location->id]);
        } else {
            $service->locations()->detach();
        }

        return back()->with('success', 'Service created successfully!');
    }

    public function saveContactInfo(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            ServiceWorkflowParams::SERVICE_HASH()->value => 'required|string',
            ServiceWorkflowParams::NAME()->value => 'nullable|string',
            ServiceWorkflowParams::EMAIL()->value => 'nullable|email',
            ServiceWorkflowParams::WEBSITE()->value => 'nullable|url',
            ServiceWorkflowParams::GITHUB()->value => 'nullable|string',
            ServiceWorkflowParams::LINKEDIN()->value => 'nullable|string',
        ]);

       
        $service = Service::byHash($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);

        if (!$service || $service->user_id !== auth()->id()) {
            return back()->withErrors(['error' => 'Service not found or access denied.']);
        }

        $service->update([
            'name' => $validated[ServiceWorkflowParams::NAME()->value] ?? null,
            'email' => $validated[ServiceWorkflowParams::EMAIL()->value] ?? null,
            'website' => $validated[ServiceWorkflowParams::WEBSITE()->value] ?? null,
            'github' => $validated[ServiceWorkflowParams::GITHUB()->value] ?? null,
            'linkedin' => $validated[ServiceWorkflowParams::LINKEDIN()->value] ?? null,
        ]);

        return back();
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.createService.stepDetails.serviceDetails'
            ],
            [
                'title' => 'workflows.createService.stepDetails.contactDetails',
            ],
        ]);
    }
}
