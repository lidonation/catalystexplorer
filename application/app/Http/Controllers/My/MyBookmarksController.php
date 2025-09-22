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

        $bookmarkItem = BookmarkItem::where('user_id', Auth::id())
            ->where('model_id', $id)
            ->where(
                fn ($query) => $query->where('model_type', $modelClass)
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
            'collection' => null,
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
            'per_page' => 'int|nullable',
        ]);

        $page = $this->queryParams[ProposalSearchParams::PAGE()->value] ?? 1;
        $perPage = $this->queryParams[ProposalSearchParams::LIMIT()->value] ?? 5;

        $bookmarkCollections = BookmarkCollection::where(function ($query) use ($userId) {
            $query->where('user_id', $userId)
                ->orWhereHas('collaborators', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                });
        })
            ->with(['author', 'collaborators'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('My/Lists/Index', [
            'bookmarkCollections' => BookmarkCollectionData::collect($bookmarkCollections),
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

            BookmarkItem::whereIn('id', $decoded_bookmark_ids)
                ->where('user_id', Auth::id())
                ->update(['bookmark_collection_id' => $decoded_collection_id]);

            DB::commit();

            $collection->searchable();

            return response()->json([
                'type' => 'success',
                'message' => 'Bookmarks added to collection successfully',
                'count' => $bookmarks->count(),
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

            // $this->authorize('viewAny', BookmarkCollection::class);

            $collections = BookmarkCollection::where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhereHas('contributors', function ($query) use ($userId) {
                        $query->where('user_id', $userId);
                    });
            })
                ->withCount('items')
                ->with(['author', 'contributors'])
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

    public function deleteCollection(BookmarkCollection $bookmarkCollection, Request $request)
    {
        // Add comprehensive logging for debugging
        \Log::info('Starting collection deletion', [
            'collection_id' => $bookmarkCollection->id,
            'collection_title' => $bookmarkCollection->title,
            'user_id' => Auth::id(),
            'collection_owner_id' => $bookmarkCollection->user_id,
            'request_method' => $request->method(),
            'request_ajax' => $request->ajax(),
            'request_wants_json' => $request->wantsJson(),
            'request_params' => $request->all(),
        ]);

        try {
            // Only owners can delete collections, not collaborators
            if ($bookmarkCollection->user_id !== Auth::id()) {
                \Log::warning('Unauthorized deletion attempt', [
                    'collection_id' => $bookmarkCollection->id,
                    'attempted_by_user_id' => Auth::id(),
                    'actual_owner_id' => $bookmarkCollection->user_id,
                ]);

                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'type' => 'error',
                        'message' => 'Unauthorized. Only the owner can delete this collection.',
                    ], 403);
                }

                return back()->with(
                    'error',
                    'Unauthorized. Only the owner can delete this collection.',
                );
            }

            \Log::info('Authorization passed, beginning deletion transaction', [
                'collection_id' => $bookmarkCollection->id,
                'user_id' => Auth::id(),
            ]);

            // Begin database transaction for data consistency
            DB::beginTransaction();

            // Delete all bookmark items in this collection
            $bookmarks = BookmarkItem::where('bookmark_collection_id', $bookmarkCollection->id)
                ->where('user_id', Auth::id())
                ->get();

            \Log::info('Found bookmark items to delete', [
                'collection_id' => $bookmarkCollection->id,
                'bookmark_items_count' => $bookmarks->count(),
                'bookmark_item_ids' => $bookmarks->pluck('id')->toArray(),
            ]);

            $bookmarks->each(function ($bookmark) {
                \Log::debug('Deleting bookmark item', [
                    'bookmark_id' => $bookmark->id,
                    'model_type' => $bookmark->model_type,
                    'model_id' => $bookmark->model_id,
                ]);
                $bookmark->delete();
            });

            \Log::info('Bookmark items deleted, now deleting comments');

            // Delete all comments associated with this collection
            $comments = $bookmarkCollection->comments()->get();
            \Log::info('Found comments to delete', [
                'collection_id' => $bookmarkCollection->id,
                'comments_count' => $comments->count(),
                'comment_ids' => $comments->pluck('id')->toArray(),
            ]);

            $comments->each(function ($comment) {
                \Log::debug('Deleting comment', [
                    'comment_id' => $comment->id,
                    'commentator_id' => $comment->commentator_id,
                ]);
                $comment->delete();
            });

            \Log::info('Comments deleted, now deleting collection itself', [
                'collection_id' => $bookmarkCollection->id,
            ]);

            // Delete the collection itself
            $deleted = $bookmarkCollection->delete();

            \Log::info('Collection delete operation completed', [
                'collection_id' => $bookmarkCollection->id,
                'delete_result' => $deleted,
                'collection_exists_after_delete' => BookmarkCollection::find($bookmarkCollection->id) !== null,
                'collection_exists_with_trashed' => BookmarkCollection::withTrashed()->find($bookmarkCollection->id) !== null,
            ]);

            // Commit the transaction
            DB::commit();

            \Log::info('Database transaction committed successfully', [
                'collection_id' => $bookmarkCollection->id,
            ]);

            // Handle different response types
            if ($request->wantsJson() || $request->ajax()) {
                \Log::info('Returning JSON success response', [
                    'collection_id' => $bookmarkCollection->id,
                ]);

                return response()->json([
                    'type' => 'success',
                    'message' => 'Collection deleted successfully',
                ]);
            }

            $noRedirect = $request->boolean('no_redirect', false);
            if ($noRedirect) {
                \Log::info('Returning JSON success response (no_redirect=true)', [
                    'collection_id' => $bookmarkCollection->id,
                ]);

                return response()->json([
                    'type' => 'success',
                    'message' => 'Collection deleted successfully',
                ]);
            }

            \Log::info('Redirecting to lists index after successful deletion', [
                'collection_id' => $bookmarkCollection->id,
            ]);

            return to_route('my.lists.index');

        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();

            // Enhanced error logging
            \Log::error('Exception occurred during collection deletion', [
                'collection_id' => $bookmarkCollection->id,
                'user_id' => Auth::id(),
                'exception_message' => $e->getMessage(),
                'exception_file' => $e->getFile(),
                'exception_line' => $e->getLine(),
                'exception_trace' => $e->getTraceAsString(),
                'request_method' => $request->method(),
                'request_params' => $request->all(),
            ]);

            // Log the error for debugging
            report($e);

            if ($request->wantsJson() || $request->ajax()) {
                \Log::info('Returning JSON error response due to exception', [
                    'collection_id' => $bookmarkCollection->id,
                ]);

                return response()->json([
                    'type' => 'error',
                    'message' => 'Failed to delete collection. Please try again.',
                    'debug' => config('app.debug') ? $e->getMessage() : null,
                ], 500);
            }

            \Log::info('Returning back with error message due to exception', [
                'collection_id' => $bookmarkCollection->id,
            ]);

            return back()->with(
                'error',
                'Failed to delete collection. Please try again.',
            );
        }
    }
}
