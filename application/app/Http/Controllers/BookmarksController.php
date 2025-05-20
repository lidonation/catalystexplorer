<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Enums\QueryParamsEnum;
use App\Models\BookmarkCollection;
use Illuminate\Support\Collection;
use Illuminate\Http\RedirectResponse;

class BookmarksController extends Controller
{
    /**
     * Display the bookmarks index page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Bookmarks/Index');
    }

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
        return Inertia::render('Workflows/CreateBookmark/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step2(Request $request): Response
    {


        return Inertia::render('Workflows/CreateBookmark/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }


    public function saveList(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'visibility' => 'required|string',
            'content' => 'nullable|string|',
            'comments_enabled' => 'nullable|boolean',
            'color' => 'nullable|string|max:7',
            'status' => 'nullable|string',
        ]);

        $bookmarkCollection = BookmarkCollection::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'color' => $validated['color'] ?? '#2596BE',
            'allow_comments' => $validated['comments_enabled'] ?? false,
            'visibility' => strtoupper($validated['visibility']),
            'status' => strtoupper($validated['status'] ?? 'DRAFT'),
            'type' => BookmarkCollection::class,
        ]);

        return to_route('workflows.boolmarks.index', [
            'step' => 3,
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => $bookmarkCollection->id,
        ]);
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.bookmarks.details',
            ],
            [
                'title' => 'workflows.bookmarks.listDetail',
                'info' => 'workflows.bookmarks.listDetailInfo',
            ],
            [
                'title' => 'workflows.bookmarks.listItems',
                'info' => 'workflows.bookmarks.listItemsInfo',
            ],
            [
                'title' => 'workflows.bookmarks.rationale',
                'info' => 'workflows.bookmarks.rationaleInfo',
            ],
        ]);
    }
}
