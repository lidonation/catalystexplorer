<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CategoryData;
use App\DataTransferObjects\ServiceData;
use App\Enums\ServiceTypeEnum;
use App\Enums\ServiceWorkflowParams;
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
    protected function formatPaginator($paginator, ?array $transformedData = null): array
    {
        return [
            'data' => $transformedData ?: $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'links' => $paginator->linkCollection()->toArray(),
            'next_page_url' => $paginator->nextPageUrl(),
            'prev_page_url' => $paginator->previousPageUrl(),
            'first_page_url' => $paginator->url(1),
            'last_page_url' => $paginator->url($paginator->lastPage()),
            'path' => $paginator->path(),
        ];
    }

    public function index(Request $request): Response
    {
        $services = Service::withStandardRelations()
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->categories, function ($q) use ($request) {
                $categoryIds = array_filter(explode(',', (string) $request->categories));

                $q->filterByCategories($categoryIds);
            })
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate(12, ['*'], 'p')
            ->withQueryString()
            ->onEachSide(1);

        $transformedServices = $services->getCollection()->map(fn ($service) => ServiceData::fromModel($service))->toArray();

        return Inertia::render('Services/Index', [
            'services' => $this->formatPaginator($services, $transformedServices),
            'categories' => $this->getCategoryTree(),
            'filters' => $request->only(['search', 'categories', 'type']),
        ]);
    }

    public function myServices(Request $request): Response
    {
        $services = Service::withStandardRelations()
            ->forUser(auth()->id())
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->orderBy($request->sort ?? 'created_at', $request->order ?? 'desc')
            ->paginate(12, ['*'], 'p')
            ->withQueryString();

        $transformedServices = $services->getCollection()->map(fn ($service) => ServiceData::fromModel($service))->toArray();

        return Inertia::render('My/Services/Index', [
            'services' => $this->formatPaginator($services, $transformedServices),
            'filters' => $request->only(['search', 'type', 'sort', 'order']),
        ]);
    }

    protected function validateFilters(Request $request): array
    {
        $validated = $request->validate([
            'search' => 'sometimes|string|max:255',
            'categories' => 'sometimes|string',
            'type' => 'sometimes|in:offered,needed',
            'sort' => 'sometimes|in:newest,oldest,title',
            'viewType' => 'sometimes|in:all,user',
            'page' => 'sometimes|integer|min:1',
        ]);

        if (! empty($validated['categories'])) {
            $hashes = explode(',', $validated['categories']);
            $validated['categories'] = array_filter($hashes);
        }

        return $validated;
    }

    protected function buildQuery(array $filters)
    {
        $query = Service::query()
            ->withStandardRelations()
            ->forUser(($filters['viewType'] ?? 'all') === 'user' ? auth()->id() : null);

        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['categories']) && ($filters['viewType'] ?? 'all') === 'all') {
            $query->filterByCategories($filters['categories']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (empty($filters['search'])) {
            match ($filters['sort'] ?? 'newest') {
                'oldest' => $query->oldest(),
                'title' => $query->orderBy('title'),
                default => $query->latest()
            };
        }

        return $query;
    }

    protected function getCategoryTree()
    {
        return Category::where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->where('is_active', true)])
            ->get()
            ->map(fn ($category) => CategoryData::fromModel($category));
    }

    protected function formatFilters(array $filters): array
    {
        $formattedCategories = null;
        if (! empty($filters['categories']) && ($filters['viewType'] ?? 'all') === 'all') {
            $formattedCategories = array_filter(array_map(
                fn ($id) => $id,
                $filters['categories']
            ));
        }

        return [
            'search' => $filters['search'] ?? null,
            'categories' => $formattedCategories,
            'type' => $filters['type'] ?? null,
            'sort' => $filters['sort'] ?? null,
            'viewType' => $filters['viewType'] ?? 'all',
        ];
    }

    public function show(string $id): Response
    {
        $service = Service::find($id);

        return Inertia::render('Services/Show', [
            'service' => ServiceData::fromModel($service->load([
                'user:id,name,email',
                'categories:id,name,slug',
                'locations:id,city,region,country',
            ])),
            'relatedServices' => $this->getRelatedServices($service),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'type' => 'required|string|in:'.implode(',', ServiceTypeEnum::toValues()),
            'header_image' => 'nullable|image|max:5120',
            'categories' => 'required|array|min:1',
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
            ->route('services.show', $service->id)
            ->with('success', 'Service created successfully!');
    }

    protected function getRelatedServices(Service $service, int $limit = 4)
    {
        return Service::query()
            ->with(['user:id,name', 'categories:id,name'])
            ->where('id', '!=', $service->id)
            ->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $service->categories->pluck('id')))
            ->limit($limit)
            ->get()
            ->map(fn ($relatedService) => ServiceData::fromModel($relatedService));
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

        if (! empty($validated[ServiceWorkflowParams::SERVICE_HASH()->value])) {
            $existingService = Service::byHash($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);
            if ($existingService && $existingService->user_id === auth()->id()) {
                $serviceData = [
                    ServiceWorkflowParams::TITLE()->value => $existingService->title,
                    ServiceWorkflowParams::DESCRIPTION()->value => $existingService->description,
                    ServiceWorkflowParams::TYPE()->value => $existingService->type->value,
                    ServiceWorkflowParams::CATEGORIES()->value => $existingService->categories->pluck('slug')->toArray(),
                    ServiceWorkflowParams::HEADER_IMAGE_URL()->value => $existingService->header_image_url,
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

        if (! empty($validated[ServiceWorkflowParams::SERVICE_HASH()->value])) {
            $existingService = Service::find($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);
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
            'serviceId' => $validated[ServiceWorkflowParams::SERVICE_HASH()->value] ?? $request->input('serviceId') ?? null,
            'serviceId' => $validated[ServiceWorkflowParams::SERVICE_HASH()->value] ?? null,
            'serviceId' => $validated[ServiceWorkflowParams::SERVICE_HASH()->value] ?? null,
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

        $validator = \Validator::make($request->all(), [
            ServiceWorkflowParams::TITLE()->value => 'required|string|max:255',
            ServiceWorkflowParams::DESCRIPTION()->value => 'required|string|max:5000',
            ServiceWorkflowParams::TYPE()->value => 'required|string|in:'.implode(',', \App\Enums\ServiceTypeEnum::toValues()),
            ServiceWorkflowParams::CATEGORIES()->value => 'required|array|min:1',
            ServiceWorkflowParams::CATEGORIES()->value.'.*' => 'exists:categories,slug',
            ServiceWorkflowParams::SERVICE_HASH()->value => 'nullable|string',
        ]);

        if ($validator->fails()) {
            $request->session()->flash('error', $validator->errors()->toArray());

            return back()->withInput();
        }

        $validated = $validator->validated();

        $existingService = null;

        if (! empty($validated[ServiceWorkflowParams::SERVICE_HASH()->value])) {
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
            ServiceWorkflowParams::SERVICE_HASH()->value => $service->id,
        ]);
    }

    public function saveContactAndLocation(Request $request): RedirectResponse
    {
        $validator = \Validator::make($request->all(), [
            ServiceWorkflowParams::SERVICE_HASH()->value => 'required|string',
            ServiceWorkflowParams::LOCATION()->value => 'nullable|string|max:255',
            ServiceWorkflowParams::NAME()->value => 'nullable|string|max:255',
            ServiceWorkflowParams::EMAIL()->value => 'nullable|email|max:255',
            ServiceWorkflowParams::WEBSITE()->value => 'nullable|url|max:255',
            ServiceWorkflowParams::GITHUB()->value => 'nullable|string|max:255',
            ServiceWorkflowParams::LINKEDIN()->value => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            $request->session()->flash('error', $validator->errors()->toArray());

            return back()->withInput();
        }

        $validated = $validator->validated();

        $service = Service::find($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);

        if (! $service || $service->user_id !== auth()->id()) {
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

        if (! empty($validated[ServiceWorkflowParams::LOCATION()->value])) {
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
        $validator = \Validator::make($request->all(), [
            ServiceWorkflowParams::SERVICE_HASH()->value => 'required|string',
            ServiceWorkflowParams::NAME()->value => 'nullable|string',
            ServiceWorkflowParams::EMAIL()->value => 'nullable|email',
            ServiceWorkflowParams::WEBSITE()->value => 'nullable|url',
            ServiceWorkflowParams::GITHUB()->value => 'nullable|string',
            ServiceWorkflowParams::LINKEDIN()->value => 'nullable|string',
        ]);

        if ($validator->fails()) {
            $request->session()->flash('error', $validator->errors()->toArray());

            return back()->withInput();
        }

        $validated = $validator->validated();

        $service = Service::find($validated[ServiceWorkflowParams::SERVICE_HASH()->value]);

        if (! $service || $service->user_id !== auth()->id()) {
            $request->session()->flash('error', ['general' => ['Service not found or access denied.']]);

            return back();
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
                'title' => 'workflows.createService.stepDetails.serviceDetails',
            ],
            [
                'title' => 'workflows.createService.stepDetails.contactDetails',
            ],
        ]);
    }
}
