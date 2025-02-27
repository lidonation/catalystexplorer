<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers\My;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\BookmarkItemData;
use App\Enums\BookmarkableType;
use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
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
use Illuminate\Validation\ValidationException;
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
            if (! Auth::check()) {
                return response()->json(['errors' => 'Unauthorized'], 401);
            }
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
            DB::commit();

            return response()->json([
                'bookmarkId' => $bookmarkItem->id, 
                'isBookmarked' => true,
                'bookmarkItems' => $bookmarkItem,

            ]);

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'error' => 'Failed to create bookmark',
                'model_id' => $modelId,
                'exception' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete(Request $request, $id): JsonResponse
    {
        try {
            $bookmarkItem = BookmarkItem::findOrFail($id);

            if ($bookmarkItem->user_id !== Auth::id()) {
                return response::json([
                    'errors' => 'Unauthorized action'], 401);
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

    private function getBookmarkItemCollection($id): BookmarkCollection | null
    {
        if (! $id) {
            return null;
        }
        return BookmarkCollection::findOrFail($id) ?? null;
    }

    public function status(string $modelType, $id): JsonResponse
    {
        $modelType = class_basename($modelType);
        if (! BookmarkableType::isValid($modelType)) {
            return response()->json([
                'error' => 'Invalid model type',
                'modelType' => $modelType,
            ]);
        }

        $modelClass = BookmarkableType::toArray()[$modelType];
        $modelName = class_basename($modelClass);

        $bookmarkItem = BookmarkItem::where('user_id', Auth::id())
            ->where('model_id', $id)
            ->where(fn ($query) => $query->where('model_type', $modelClass)
                ->orWhere('model_type', $modelName)
            )->first();

        if ($bookmarkItem) {
            return response()->json([
                'isBookmarked' => true,
                'id' => $bookmarkItem->id,
                'collection' => $this->getBookmarkItemCollection($bookmarkItem->bookmark_collection_id),
            ]);
        }

        return response()->json([
            'isBookmarked' => false,
            'id' => null,
            'collection' => null
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
                hash: null,
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

    public function addBookmarkToCollection(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bookmark_collection_id' => ['required'],
            'bookmark_ids' => ['required', 'array'],
            'bookmark_ids.*' => ['required'],
        ]);

        try {
            DB::beginTransaction();

            $decoded_collection_id = (new HashIdService(new BookmarkCollection()))
                ->decode($data['bookmark_collection_id']);
            $decoded_bookmark_ids = (new HashIdService(new BookmarkItem()))
                ->decodeArray($data['bookmark_ids']);

            $collection = BookmarkCollection::findOrFail($decoded_collection_id);

            if ($collection->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], SymfonyResponse::HTTP_FORBIDDEN);
            }

            // $this->authorize('create', $collection);

            $bookmarks = BookmarkItem::whereIn('id', $decoded_bookmark_ids)
                ->where('user_id', Auth::id())
                ->get();

            if ($bookmarks->count() !== count($decoded_bookmark_ids)) {
                return response()->json([
                    'errors' => ['Invalid bookmark selection'],
                ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
            }


            BookmarkItem::whereIn('id', $decoded_bookmark_ids)
                ->where('user_id', Auth::id())
                ->update(['bookmark_collection_id' => $decoded_collection_id]);

            DB::commit();

            return response()->json([
                'type' => 'success',
                'message' => 'Bookmarks added to collection successfully',
                'count' => $bookmarks->count()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'errors' => ['Failed to add bookmarks to collection'],
            ], SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function removeBookmarkFromCollection(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bookmark_collection_id' => ['required'],
            'bookmark_ids' => ['required', 'array'],
            'bookmark_ids.*' => ['required'],
        ]);

        try {
            DB::beginTransaction();

            $decoded_collection_id = (new HashIdService(new BookmarkCollection()))
                ->decode($data['bookmark_collection_id']);
            $decoded_bookmark_ids = (new HashIdService(new BookmarkItem()))
                ->decodeArray($data['bookmark_ids']);

            $collection = BookmarkCollection::findOrFail($decoded_collection_id);

            if ($collection->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], SymfonyResponse::HTTP_FORBIDDEN);
            }

            // $this->authorize('update', $collection);

            $bookmarks = BookmarkItem::whereIn('id', $decoded_bookmark_ids)
                ->where('bookmark_collection_id', $data['bookmark_collection_id'])
                ->where('user_id', Auth::id())
                ->get();

            if ($bookmarks->count() !== count($decoded_bookmark_ids)) {
                return response()->json([
                    'errors' => ['Invalid bookmark selection'],
                ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
            }

            BookmarkItem::whereIn('id', $decoded_bookmark_ids)
                ->where('user_id', Auth::id())
                ->update(['bookmark_collection_id' => null]);

            DB::commit();

            return response()->json([
                'type' => 'success',
                'message' => 'Bookmarks removed from collection successfully',
                'count' => $bookmarks->count()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'errors' => ['Failed to remove bookmarks from collection'],
            ], SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    public function retrieveCollections(): JsonResponse
    {
        try {

            // $this->authorize('viewAny', BookmarkCollection::class);

            $collections = BookmarkCollection::where('user_id', Auth::id())
                ->withCount('items')
                ->get();

            return response()->json([
                'type' => 'success',
                'message' => 'Collections retrieved successfully',
                'collections' => $collections,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'error',
                'message' => 'Failed to retrieve collections',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ]);
        }
    }

    public function createCollection(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'title' => ['required', 'string', 'min:5'],
                'content' => ['nullable', 'string', 'min:10'],
                'visibility' => ['nullable', 'string', 'in:public,unlisted,private'],
            ]);

            $collection = BookmarkCollection::create([
                'user_id' => Auth::id(),
                'title' => $data['title'],
                'content' => $data['content'] ?? null,
                'visibility' => $data['visibility'] ?? BookmarkVisibility::UNLISTED()->value,
                'color' => $data['color'] ?? '#000000', // since not passing from quick list create, just adding a default color
                'status' => BookmarkStatus::DRAFT()->value,
                'type' => BookmarkCollection::class,
                'type_id' => null,
                'type_type' => null,
                'parent_id' => null
            ]);

            return response()->json([
                'type' => 'success',
                'message' => 'Collection created successfully',
                'collection' => $collection,
            ]);

        } catch (ValidationException $e) {
            $firstError = collect($e->errors())->first();
            $firstErrorMessage = is_array($firstError) ? $firstError[0] : 'Please check your input';

            return response()->json([
                'type' => 'validation_error',
                'message' => $firstErrorMessage,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'server_error',
                'message' => 'Unable to create collection',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
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
}
