<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ServiceData;
use App\Models\Category;
use App\Models\Location;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Services/Index', [
            'services' => ServiceData::collection(
                Service::with(['user:id,name,email', 'categories:id,name,slug', 'locations:id,city'])
                    ->latest()
                    ->paginate(24)
            ),
            'viewType' => 'all',
        ]);
    }

    public function myServices(): Response
    {
        return Inertia::render('Services/Index', [
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
}
