<?php

declare(strict_types=1);

namespace App\Http\Controllers\My;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\BookmarkItemData;
use App\Enums\BookmarkableType;
use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
use App\Enums\ProposalSearchParams;
use App\Http\Controllers\Controller;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class MyBookmarksController extends Controller
{
    protected int $defaultLimit = 36;

    protected int $defaultPage = 1;

    protected array $queryParams = [];

    protected function getBookmarkableTypes(): array
    {
        return BookmarkableType::toArray();
    }

    public function index(Request $request): InertiaResponse
    {
        // $this->authorize('viewAny', BookmarkCollection::class);

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

        Gate::authorize('view', $bookmarkItem);

        return
            Inertia::render('My/Bookmarks/Partials/Show', [
                'bookmark' => BookmarkItemData::from($bookmarkItem),
            ]);
    }

    public function store(Request $request, string $modelType, string $modelId): JsonResponse
    {
        try {
            if (! Auth::check()) {
                return response()->json(['errors' => 'Unauthorized'], 401);
            }
            if (! BookmarkableType::isValid($modelType)) {
                return response()->json(['errors' => 'Invalid model types'], 422);
            }

            $bookmarkableType = BookmarkableType::from($modelType);
            $modelType = $bookmarkableType->getModelClass();

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

    public function delete(BookmarkItem $bookmarkItem, Request $request): JsonResponse
    {
        try {

            if ($bookmarkItem->user_id !== Auth::id()) {
                return response()->json([
                    'errors' => 'Unauthorized action',
                ], 401);
            }

            $collection = $bookmarkItem?->collection;

            $bookmarkItem->delete();

            if ($collection) {
                $collection->searchable();
            }

            return response()->json([
                'message' => 'Bookmark deleted successfully',
            ]);
        } catch (\Exception $e) {
            report($e);

            return response()->json([
                'message' => 'Not deleted',
            ]);
        }
    }

    private function getBookmarkItemCollection($id): ?BookmarkCollection
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

        $bookmarkItems = BookmarkItem::where('user_id', Auth::id())
            ->where('model_id', $id)
            ->where(
                fn ($query) => $query->where('model_type', $modelClass)
                    ->orWhere('model_type', $modelName)
                // )->first();
            )->get();

        if ($bookmarkItems->isNotEmpty()) {
            $primaryBookmarkItem = $bookmarkItems->whereNull('bookmark_collection_id')->first()
                ?? $bookmarkItems->first();

            $collections = $bookmarkItems
                ->filter(fn ($item) => $item->bookmark_collection_id != null)
                ->map(fn ($item) => [
                    'bookmarkItemId' => $item->id,
                    'collectionId' => $item->bookmark_collection_id,
                    'title' => $this->getBookmarkItemCollection($item->bookmark_collection_id)?->title,
                ])
                ->filter(fn ($item) => $item['title'] != null)
                ->values()
                ->toArray();

            $allBookmarkItemIds = $bookmarkItems->pluck('id')->toArray();

            return response()->json([
                'isBookmarked' => true,
                'id' => $primaryBookmarkItem->id,
                'collection' => $this->getBookmarkItemCollection($primaryBookmarkItem->bookmark_collection_id),
                'collections' => $collections,
                'collectionsCount' => count($collections),
                'allBookmarkItemIds' => $allBookmarkItemIds,
            ]);
        }

        return response()->json([
            'isBookmarked' => false,
            'id' => null,
            'collection' => null,
            'collections' => [],
            'collectionsCount' => 0,
        ]);
    }

    public function create(Request $request): JsonResponse|InertiaResponse
    {
        Gate::authorize('create', BookmarkItem::class);

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

            BookmarkItem::updateOrCreate([
                'user_id' => Auth::id(),
                'bookmark_collection_id' => $collection->id,
                'model_id' => $validated['model_id'],
                'model_type' => $modelType,
            ], []);

            DB::commit();

            $collection->searchable();

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
        $userId = Auth::user()->id;

        $this->queryParams = $request->validate([
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::SORTS()->value => 'string|nullable',
        ]);

        $page = $this->queryParams[ProposalSearchParams::PAGE()->value] ?? 1;
        $perPage = $this->queryParams[ProposalSearchParams::LIMIT()->value] ?? 12;
        $search = $this->queryParams[ProposalSearchParams::QUERY()->value] ?? null;
        $sort = $this->queryParams[ProposalSearchParams::SORTS()->value] ?? '-latest_bookmarks';

        $query = BookmarkCollection::allVisibilities()
            ->whereNull('deleted_at')
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhereHas('collaborators', function ($query) use ($userId) {
                        $query->where('user_id', $userId);
                    });
            })
            ->with(['author', 'collaborators'])
            ->addSelect(['latest_item_at' => BookmarkItem::select('created_at')
                ->whereColumn('bookmark_collection_id', 'bookmark_collections.id')
                ->orderByDesc('created_at')
                ->limit(1),
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('content', 'ILIKE', "%{$search}%");
            });
        }

        $sortField = ltrim($sort, '-');
        $sortDirection = str_starts_with($sort, '-') ? 'desc' : 'asc';

        switch ($sortField) {
            case 'title':
                $query->orderBy('title', $sortDirection);
                break;
            case 'updated_at':
                $query->orderBy('updated_at', $sortDirection);
                break;
            case 'latest_bookmarks':
                // Sort by latest item created, then by collection created_at
                $query->orderByRaw("
                    COALESCE(
                        (SELECT created_at FROM bookmark_items 
                         WHERE bookmark_collection_id = bookmark_collections.id 
                         AND bookmark_items.deleted_at IS NULL
                         ORDER BY created_at DESC LIMIT 1),
                        bookmark_collections.created_at
                    ) {$sortDirection}
                ")
                    ->orderBy('bookmark_collections.created_at', $sortDirection);
                break;
            case 'created_at':
            default:
                $query->orderBy('created_at', $sortDirection);
                break;
        }

        $bookmarkCollections = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('My/Lists/Index', [
            'bookmarkCollections' => BookmarkCollectionData::collect($bookmarkCollections),
            'searchParams' => [
                ProposalSearchParams::QUERY()->value => $search,
                ProposalSearchParams::SORTS()->value => $sort,
                ProposalSearchParams::PAGE()->value => $page,
                ProposalSearchParams::LIMIT()->value => $perPage,
            ],
        ]);
    }

    public function showCollection(BookmarkCollection $bookmarkCollection): InertiaResponse|JsonResponse
    {
        return Inertia::render('My/Lists/BookmarkCollection', [
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

            $decoded_collection_id = $data['bookmark_collection_id'];
            $decoded_bookmark_ids = $data['bookmark_ids'];

            $collection = BookmarkCollection::findOrFail($decoded_collection_id);

            Gate::authorize('addItems', $collection);

            $bookmarks = BookmarkItem::whereIn('id', $decoded_bookmark_ids)
                ->where('user_id', Auth::id())
                ->get();

            if ($bookmarks->count() !== count($decoded_bookmark_ids)) {
                return response()->json([
                    'errors' => ['Invalid bookmark selection'],
                ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
            }

            $createdCount = 0;
            foreach ($bookmarks as $bookmark) {
                // Check if this model is already in this collection
                $existingInCollection = BookmarkItem::where('user_id', Auth::id())
                    ->where('bookmark_collection_id', $decoded_collection_id)
                    ->where('model_id', $bookmark->model_id)
                    ->where('model_type', $bookmark->model_type)
                    ->exists();

                if (! $existingInCollection) {
                    // Create a new bookmark item for this collection
                    BookmarkItem::create([
                        'user_id' => Auth::id(),
                        'bookmark_collection_id' => $decoded_collection_id,
                        'model_id' => $bookmark->model_id,
                        'model_type' => $bookmark->model_type,
                    ]);
                    $createdCount++;
                }
            }

            DB::commit();

            $collection->searchable();

            return response()->json([
                'type' => 'success',
                'message' => 'Bookmarks added to collection successfully',
                'count' => $createdCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'type' => 'error',
                'message' => 'Failed to add bookmarks to collection',
                'debug' => config('app.debug') ? $e->getMessage() : null,
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

            $decoded_bookmark_ids = $data['bookmark_ids'];

            $collection = BookmarkCollection::find($data['bookmark_collection_id']);

            // Check if user can manage this collection (owner or collaborator)
            Gate::authorize('removeItems', $collection);

            $bookmarks = BookmarkItem::whereIn('id', $decoded_bookmark_ids)
                ->where('bookmark_collection_id', $collection->id)
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
                'count' => $bookmarks->count(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'type' => 'error',
                'message' => 'Failed to remove bookmarks from collection',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function retrieveCollections(): JsonResponse
    {
        try {
            $userId = Auth::id();

            $collections = BookmarkCollection::allVisibilities()
                ->whereNull('deleted_at') // Explicitly exclude soft-deleted collections
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->orWhereHas('contributors', function ($query) use ($userId) {
                            $query->where('user_id', $userId);
                        });
                })
                ->withCount('items')
                ->with(['author', 'contributors'])
                ->orderByRaw('
                    COALESCE(
                        (SELECT created_at FROM bookmark_items 
                         WHERE bookmark_collection_id = bookmark_collections.id 
                         AND bookmark_items.deleted_at IS NULL
                         ORDER BY created_at DESC LIMIT 1),
                        bookmark_collections.created_at
                    ) DESC
                ')
                ->orderBy('bookmark_collections.created_at', 'desc')
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
                'color' => ['nullable', 'string'],
            ]);

            $collection = BookmarkCollection::create([
                'user_id' => Auth::id(),
                'title' => $data['title'],
                'content' => $data['content'] ?? null,
                'visibility' => $data['visibility'] ?? BookmarkVisibility::UNLISTED()->value,
                'color' => $data['color'] ?? '#000000',
                'status' => BookmarkStatus::DRAFT()->value,
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
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'server_error',
                'message' => 'Unable to create collection',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function updateCollection(BookmarkCollection $bookmarkCollection, Request $request): mixed
    {
        // Check if user can manage this collection (owner or collaborator)
        Gate::authorize('update', $bookmarkCollection);

        $data = $request->validate([
            'title' => ['required', 'string', 'min:5'],
            'content' => ['nullable', 'string', 'min:10'],
            'visibility' => ['nullable', 'string', 'in:public,unlisted,private'],
            'comments_enabled' => ['required'],
            'color' => ['required', 'string'],
            'status' => ['required', 'string'],
        ]);

        try {
            $bookmarkCollection->update([
                'user_id' => Auth::id(),
                'title' => $data['title'],
                'content' => $data['content'] ?? null,
                'visibility' => $data['visibility'] ?? BookmarkVisibility::UNLISTED()->value,
                'color' => $data['color'] ?? '#000000',
                'status' => $data['status'] ?? BookmarkStatus::DRAFT()->value,
                'type' => BookmarkCollection::class,
                'allow_comments' => $data['comments_enabled'],
            ]);

            $bookmarkCollection->searchable();

            return back()->with(
                'message',
                'Collection Updated',
            );
        } catch (ValidationException $e) {
            $firstError = collect($e->errors())->first();
            $firstErrorMessage = is_array($firstError) ? $firstError[0] : 'Please check your input';

            return response()->json([
                'type' => 'validation_error',
                'message' => $firstErrorMessage,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'server_error',
                'message' => 'Unable to update collection',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function deleteCollection($id, Request $request)
    {
        try {
            // Find the collection
            $bookmarkCollection = BookmarkCollection::findOrFail($id);

            // Only owners can delete collections, not collaborators
            if ($bookmarkCollection->user_id !== Auth::id()) {
                return back()->with('error', 'Unauthorized. Only the owner can delete this collection.');
            }

            // Begin database transaction for data consistency
            DB::beginTransaction();

            // Delete all bookmark items in this collection
            $bookmarks = BookmarkItem::where('bookmark_collection_id', $bookmarkCollection->id)
                ->where('user_id', Auth::id())
                ->get();

            $bookmarks->each(function ($bookmark) {
                $bookmark->delete();
            });

            // Delete all comments associated with this collection
            $bookmarkCollection->comments()->delete();

            // Delete the collection itself
            $bookmarkCollection->delete();

            // Commit the transaction
            DB::commit();

            // Redirect back to collections index with success message
            return redirect()->route('my.bookmarks.collections.index')
                ->with('message', 'Collection deleted successfully.');

        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();

            // Log the error for debugging
            report($e);

            return back()->with('error', 'Failed to delete collection. Please try again.');
        }
    }
}
