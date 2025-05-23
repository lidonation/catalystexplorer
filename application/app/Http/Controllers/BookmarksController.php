<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\Enums\BookmarkableType;
use App\Enums\BookmarkStatus;
use App\Enums\StatusEnum;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

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

    public function step3(Request $request): RedirectResponse|Response
    {
        if (empty($request->bookmarkCollection)) {
            return to_route('workflows.bookmarks.index', [
                'step' => 2,
            ]);
        }

        $collection = BookmarkCollection::byHash($request->bookmarkCollection);

        $transformer = app(TransformIdsToHashes::class);

        $modelMap = [
            \App\Models\Proposal::class => 'proposals',
            \App\Models\Review::class => 'reviews',
            \App\Models\Group::class => 'groups',
            \App\Models\Community::class => 'communities',
            \App\Models\IdeascaleProfile::class => 'ideascale-profiles',
        ];

        $selectedItemsByType = $collection->items
            ->groupBy('model_type')
            ->mapWithKeys(function ($items, $modelType) use ($transformer, $modelMap) {
                $label = $modelMap[$modelType] ?? null;
                if (! $label) {
                    return [];
                }

                $modelClass = new $modelType;
                $modelIds = $items->pluck('model_id');
                $hashedItems = $transformer($modelIds->map(fn ($id) => ['id' => $id]), $modelClass);

                return [$label => $hashedItems->pluck('hash')->values()];
            });

        return Inertia::render('Workflows/CreateBookmark/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkCollection' => $request->bookmarkCollection,
            'collectionItems' => $selectedItemsByType,
        ]);
    }

    public function step4(Request $request): RedirectResponse|Response
    {
        if (empty($request->bookmarkCollection)) {
            return to_route('workflows.bookmarks.index', [
                'step' => 2,
            ]);
        }

        return Inertia::render('Workflows/CreateBookmark/Step4', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkCollection' => $request->bookmarkCollection,
        ]);
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Workflows/CreateBookmark/Success', [
            'stepDetails' => [],
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
            'color' => $validated['color'] ?? '#a23b72',
            'allow_comments' => (bool) $validated['comments_enabled'] ?? false,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'] ?? StatusEnum::draft()->value,
            'type' => BookmarkCollection::class,
        ]);

        return to_route('workflows.bookmarks.index', [
            'step' => 3,
            'bookmarkCollection' => $bookmarkCollection->hash,
        ]);
    }

    public function addBookmarkItem(BookmarkCollection $bookmarkCollection, Request $request)
    {
        $validated = $request->validate([
            'modelType' => ['required', 'string'],
            'hash' => ['required', 'string'],
        ]);

        $bookmarkableType = BookmarkableType::tryFrom($validated['modelType'])->getModelClass();

        $model = $bookmarkableType::byHash($validated['hash']);

        if (empty($model)) {
            return back()->withErrors(['message' => "Item {$validated['modelType']} if hash {$validated['hash']} not found."]);
        }

        BookmarkItem::updateOrCreate([
            'user_id' => Auth::id(),
            'bookmark_collection_id' => $bookmarkCollection->id,
            'model_id' => $model->id,
            'model_type' => $bookmarkableType,
        ], [
            'title' => null,
            'content' => null,
            'action' => null,
        ]);
    }

    public function removeBookmarkItem(BookmarkCollection $bookmarkCollection, Request $request)
    {
        $validated = $request->validate([
            'modelType' => ['required', 'string'],
            'hash' => ['required', 'string'],
        ]);

        $bookmarkableType = BookmarkableType::tryFrom($validated['modelType'])->getModelClass();

        $model = $bookmarkableType::byHash($validated['hash']);

        if (empty($model)) {
            return back()->withErrors([
                'message' => "Item {$validated['modelType']} with hash {$validated['hash']} not found.",
            ]);
        }

        $bookmark = BookmarkItem::where('user_id', Auth::id())
            ->where('bookmark_collection_id', $bookmarkCollection->id)
            ->where('model_id', $model->id)
            ->where('model_type', $bookmarkableType)
            ->first();

        if (! $bookmark) {
            return back()->withErrors([
                'message' => 'Bookmark does not exist.',
            ]);
        }

        $bookmark->delete();

        return back()->with('success', 'Bookmark removed.');
    }

    public function saveRationales(BookmarkCollection $bookmarkCollection, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rationale' => 'required|string|min:200',
        ]);

        $bookmarkCollection->saveMeta('rationale', $validated['rationale']);

        if ($bookmarkCollection && $bookmarkCollection->status === BookmarkStatus::DRAFT()->value) {
            $bookmarkCollection->update(['status' => BookmarkStatus::PUBLISHED()->value]);
        }

        return to_route('workflows.bookmarks.success');
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
