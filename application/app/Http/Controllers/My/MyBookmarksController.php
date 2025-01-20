<?php

declare(strict_types=1);

namespace App\Http\Controllers\My;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\BookmarkItemData;
use App\Enums\BookmarkableType;
use App\Http\Controllers\Controller;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class MyBookmarksController extends Controller
{
    use AuthorizesRequests;

    protected int $defaultLimit = 36;

    protected int $defaultPage = 1;

    protected function getBookmarkableTypes(): array
    {
        return BookmarkableType::toArray();
    }

    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', BookmarkCollection::class);

        $page = (int) $request->input('page', $this->defaultPage);
        $limit = (int) $request->input('limit', $this->defaultLimit);

        $query = BookmarkCollection::where('user_id', Auth::id())
            ->whereNotNull('user_id')
            ->withCount(['items']);

        $total = $query->count();

        $collections = $query->offset(($page - 1) * $limit)
            ->limit($limit)
            ->get(['id', 'title', 'items.id'])
            ->map(fn ($collection) => BookmarkCollectionData::from($collection));

        $paginator = new LengthAwarePaginator(
            $collections,
            $total,
            $limit,
            $page,
            ['pageName' => 'page']
        );

        return Inertia::render('My/Bookmarks/Index', [
            'collections' => $paginator->onEachSide(1)->toArray(),
        ]);
    }

    public function show(BookmarkItem $bookmarkItem): InertiaResponse|JsonResponse
    {
        if ($bookmarkItem->user_id !== Auth::id()) {
            return response()->json([], SymfonyResponse::HTTP_NOT_FOUND);
        }

        $this->authorize('view', $bookmarkItem);

        return Inertia::render('My/Bookmarks/Partials/Show', [
            'bookmark' => BookmarkItemData::from($bookmarkItem),
        ]);
    }

    public function createItem(Request $request): JsonResponse|InertiaResponse
    {
        $this->authorize('create', BookmarkItem::class);

        try {
            $validated = $request->validate([
                'model_type' => ['required', 'string'],
                'model_id' => ['required', 'integer'],
                'collection.title' => ['required', 'string', 'min:5'],
            ]);

            $bookmarkableType = BookmarkableType::tryFrom($validated['model_type']);

            if (! $bookmarkableType) {
                return response()->json([
                    'errors' => ['model_type' => ['Invalid model type']],
                ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
            }

            $modelType = $bookmarkableType->getModelClass();

            // Verify model exists
            $modelExists = DB::table($validated['model_type'])
                ->where('id', $validated['model_id'])
                ->exists();

            if (! $modelExists) {
                return response()->json([
                    'errors' => ['Model not found'],
                ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
            }

            DB::beginTransaction();

            $collection = BookmarkCollection::create([
                'user_id' => Auth::id(),
                'title' => $validated['collection']['title'],
            ]);

            $itemData = new BookmarkItemData(
                id: null,
                user_id: Auth::id(),
                bookmark_collection_id: $collection->id,
                model_id: $validated['model_id'],
                model_type: $modelType,
                content: null
            );

            BookmarkItem::create($itemData->toArray());

            DB::commit();

            return response()->json(['message' => 'Bookmark created successfully']);

        } catch (\Exception $e) {
            DB::rollback();
            report($e);

            return response()->json([
                'errors' => ['Failed to create bookmark'],
            ], SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function deleteCollection(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bookmark_collection_id' => ['required', 'integer', 'exists:bookmark_collections,id'],
            'bookmark_ids' => ['required', 'array'],
            'bookmark_ids.*' => ['required', 'integer', 'exists:bookmark_items,id'],
        ]);

        try {
            DB::beginTransaction();

            $collection = BookmarkCollection::findOrFail($data['bookmark_collection_id']);

            if ($collection->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], SymfonyResponse::HTTP_FORBIDDEN);
            }

            $this->authorize('delete', $collection);

            // Verify all bookmarks belong to user and collection
            $bookmarks = BookmarkItem::whereIn('id', $data['bookmark_ids'])
                ->where('bookmark_collection_id', $data['bookmark_collection_id'])
                ->where('user_id', Auth::id())
                ->get();

            if ($bookmarks->count() !== count($data['bookmark_ids'])) {
                return response()->json([
                    'errors' => ['Invalid bookmark selection'],
                ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
            }

            $bookmarks->each->delete();
            $collection->delete();

            DB::commit();

            return response()->json(['message' => 'Collection deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'errors' => ['Failed to delete bookmarks'],
            ], SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function view(BookmarkCollection $bookmarkCollection): InertiaResponse|JsonResponse
    {
        if ($bookmarkCollection->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], SymfonyResponse::HTTP_FORBIDDEN);
        }

        $this->authorize('view', $bookmarkCollection);

        return Inertia::render('BookmarkCollection', [
            'bookmarkCollection' => BookmarkCollectionData::from($bookmarkCollection),
        ]);
    }

    public function getBookmarksByType(Request $request, string $type): InertiaResponse
    {
        $this->authorize('viewAny', BookmarkItem::class);

        try {
            $modelType = BookmarkableType::from($type)->getModelClass();

            $bookmarkItems = BookmarkItem::where('user_id', Auth::id())
                ->where('model_type', $modelType)
                ->paginate($this->defaultLimit);

            return Inertia::render('My/Bookmarks/Index', [
                'bookmarkItems' => $bookmarkItems->onEachSide(1)->toArray(),
            ]);

        } catch (\Exception $e) {
            report($e);

            return Inertia::render('My/Bookmarks/Index', [
                'errors' => ['Invalid bookmark type'],
            ]);
        }
    }
}
