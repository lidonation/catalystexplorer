<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers\My;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\BookmarkItemData;
use App\Enums\BookmarkableType;
use App\Interfaces\Http\Controllers\Controller;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;
use App\Services\HashIdService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
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

        $bookmarkTypes = [
            Proposal::class => 'proposals',
            IdeascaleProfile::class => 'people',
            Review::class => 'reviews',
            Group::class => 'groups',
        ];

        $bookmarks = BookmarkItem::where('user_id', Auth::id())
            ->whereIn('model_type', array_keys($bookmarkTypes))
            ->with('model')
            ->get()
            ->groupBy('model_type')
            ->map(function ($items, $type) use ($bookmarkTypes) {
                $collection = $items->pluck('model');

                return [
                    'data' => $collection,
                    'count' => $collection->count(),
                    'key' => $bookmarkTypes[$type],
                ];
            });

        $result = [
            'counts' => [],
            'activeType' => null,
        ];

        foreach ($bookmarkTypes as $type => $key) {
            $result['counts'][$key] = $bookmarks[$type]['count'] ?? 0;
            $result[$key] = $bookmarks[$type]['data'] ?? collect();
        }

        return Inertia::render('My/Bookmarks/Index', $result);
    }

    public function show(BookmarkItem $bookmarkItem): InertiaResponse|JsonResponse
    {
        if ($bookmarkItem->user_id !== Auth::id()) {
            return response()->json([], SymfonyResponse::HTTP_NOT_FOUND);
        }

        $this->authorize('view', $bookmarkItem);

        return
            Inertia::render('My/Bookmarks/Partials/Show', [
                'bookmark' => BookmarkItemData::from($bookmarkItem),
            ]);
    }

    public function store(Request $request, string $modelType, int $modelId): JsonResponse
    {
        try {
            if (! BookmarkableType::isValid($modelType)) {
                return response()->json(['errors' => 'Invalid model types'], 422);
            }

            $bookmarkableType = BookmarkableType::from($modelType);
            $modelClass = $bookmarkableType->getModelClass();
            $modelType = class_basename($modelClass);

            DB::beginTransaction();
            $bookmarkItem = BookmarkItem::create([
                'user_id' => Auth::id(),
                'model_type' => $modelType,
                'model_id' => $modelId,
            ]);
            Log::info('Bookmark created', [
                'user_id' => Auth::id(),
                'model_id' => $modelId,
                'model_type' => $modelType,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Bookmark created successfully',
                'modeltype' => $modelType,
                'bookmarkItem' => $bookmarkItem,
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating bookmark', ['error' => $e->getMessage()]);

            return response()->json([
                'errors' => 'Failed to create bookmark',
                'err ' => $e]);
        }
    }

    public function delete(Request $request, $id): JsonResponse
    {
        try {
            $bookmarkItem = BookmarkItem::findOrFail($id);

            if ($bookmarkItem->user_id !== Auth::id()) {
                return response::json([
                    'errors' => 'Unauthorized action'], 403);
            }

            $bookmarkItem->delete();

            return response::json([
                'message' => 'Bookmark deleted successfully',
            ]);
        } catch (\Exception $e) {
            report($e);

            return response()->json([
                'message' => 'Not deleted',
            ]);
        }
    }

    public function status(string $modelType, string $hash): JsonResponse
    {
        if (! BookmarkableType::isValid($modelType)) {
            return response()->json([
                'error' => 'Invalid model type',
                'modelType' => $modelType,
            ]);
        }

        $modelClass = BookmarkableType::toArray()[$modelType];
        $modelName = class_basename($modelClass);
        $id = app(HashIdService::class, ['model' => new $modelClass])
            ->decode($hash);

        $bookmarkItem = BookmarkItem::where('user_id', Auth::id())
            ->where('model_id', $id)
            ->where(function ($query) use ($modelClass, $modelName) {
                $query->where('model_type', $modelClass)
                    ->orWhere('model_type', $modelName);
            })
            ->first();

        if ($bookmarkItem) {
            return response()->json([
                'isBookmarked' => true,
                'id' => $bookmarkItem->id,

            ]);
        }

        return response()->json([
            'isBookmarked' => false,
            'id' => null,
        ]);
    }

    public function create(Request $request): JsonResponse|InertiaResponse
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

    public function collectionIndex(Request $request): InertiaResponse
    {
        return Inertia::render('My/Lists/Index', []);
    }

    public function showCollection(BookmarkCollection $bookmarkCollection): InertiaResponse|JsonResponse
    {
        $this->authorize('view', $bookmarkCollection);

        return Inertia::render('BookmarkCollection', [
            'bookmarkCollection' => BookmarkCollectionData::from($bookmarkCollection),
        ]);
    }

    public function createCollection(Request $request): JsonResponse|InertiaResponse
    {
        $this->authorize('create', BookmarkCollection::class);

        $data = $request->validate([
            'title' => ['required', 'string', 'min:5'],
            'content' => ['nullable', 'string', 'min:10'],
            'visibility' => ['nullable', 'string', 'min:10'],
        ]);

        $collection = BookmarkCollection::create([
            'user_id' => Auth::id(),
            'title' => $data['title'],
            'content' => $data['content'],
            'visibility' => $data['visibility'],
        ]);

        return response()->json(
            [
                'message' => 'Collection created successfully',
                'collection' => $collection,
            ]
        );
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
}
