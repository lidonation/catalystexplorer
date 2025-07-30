<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\CategoryData;
use App\DataTransferObjects\ServiceData;
use App\Models\Category;
use App\Models\Location;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $this->validateFilters($request);
        $services = $this->buildQuery($validated)->paginate(12);

        $transformer = app(TransformIdsToHashes::class);

        return Inertia::render('Services/Index', [
            'services' => [
                'data' => $transformer($services->getCollection(), new Service),
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
                'from' => $services->firstItem(),
                'to' => $services->lastItem(),
                'links' => $services->linkCollection()->toArray(),
                'prev_page_url' => $services->previousPageUrl(),
                'next_page_url' => $services->nextPageUrl(),
                'path' => $services->path(),
                'first_page_url' => $services->url(1),
                'last_page_url' => $services->url($services->lastPage()),
            ],
            'categories' => $this->getCategoryTree(),
            'filters' => $this->formatFilters($validated),
        ]);
    }

    public function myServices(Request $request): Response
    {
        $validated = $this->validateFilters($request);
        $validated['viewType'] = 'user';

        $services = $this->buildQuery($validated)->paginate(12);

        $transformer = app(TransformIdsToHashes::class);

        return Inertia::render('My/Services/Index', [
            'services' => [
                'data' => $transformer($services->getCollection(), new Service),
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
                'from' => $services->firstItem(),
                'to' => $services->lastItem(),
                'links' => $services->linkCollection()->toArray(),
                'prev_page_url' => $services->previousPageUrl(),
                'next_page_url' => $services->nextPageUrl(),
                'path' => $services->path(),
                'first_page_url' => $services->url(1),
                'last_page_url' => $services->url($services->lastPage()),
            ],
            'filters' => $this->formatFilters($validated),
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
            $validated['categories'] = array_filter(array_map(
                fn ($hash) => Category::byHash($hash)?->id,
                $hashes
            ));
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

        // Only format categories for 'all' view
        if (! empty($filters['categories']) && ($filters['viewType'] ?? 'all') === 'all') {
            $formattedCategories = array_filter(array_map(
                fn ($id) => Category::find($id)?->hash,
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

    public function show(string $hash): Response
    {
        $service = Service::byHash($hash);

        return Inertia::render('Services/Show', [
            'service' => ServiceData::fromModel($service->load([
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
                ->get(['id', 'name', 'slug'])
                ->map(fn ($category) => CategoryData::fromModel($category)),
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
            'type' => 'required|string|in:offering,requesting',
            'header_image' => 'nullable|image|max:2048',
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

        if ($validated['header_image'] ?? false) {
            $service->addMedia($validated['header_image'])
                ->toMediaCollection('header');
        }

        $service->categories()->attach($validated['categories']);

        if ($validated['location'] ?? false) {
            $service->locations()->attach($validated['location']);
        }

        return redirect()
            ->route('services.show', $service->hash)
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
}
