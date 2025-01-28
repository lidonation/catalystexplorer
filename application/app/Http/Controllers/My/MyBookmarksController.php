<?php

declare(strict_types=1);

namespace App\Http\Controllers\My;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\BookmarkItemData;
use App\Enums\BookmarkableType;
use App\Http\Controllers\Controller;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $counts = [];
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

        return Inertia::render('My/Bookmarks/Partials/Show', [
            'bookmark' => BookmarkItemData::from($bookmarkItem),
        ]);
    }

    public function create(Request $request): JsonResponse|InertiaResponse
    {
        // $this->authorize('create', BookmarkItem::class);

        try {
            if ($request && $request['entity'] === 'bookmark') {
                //skipping bookmark creation. A bit faulty
                return response()->json(['message' => 'Bookmark entity validated'])
                    ->header('X-Inertia', 'true')
                    ->header('Vary', 'Accept');
            }

            $validated = $request->validate([
                // 'model_type' => ['required', 'string'],
                // 'model_id' => ['required', 'integer'],
                'collection.title' => ['required', 'string', 'min:5'],
                'collection.content' => ['string'],
                'collection.visibility' => ['required', 'string'],
            ]);

            // $bookmarkableType = BookmarkableType::tryFrom($validated['model_type']);

            // if (!$bookmarkableType) {
            //     return response()->json([
            //         'errors' => ['model_type' => ['Invalid model type']],
            //     ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
            // }

            // $modelType = $bookmarkableType->getModelClass();

            // // Verify model exists
            // $modelExists = DB::table($validated['model_type'])
            //     ->where('id', $validated['model_id'])
            //     ->exists();

            // if (!$modelExists) {
            //     return response()->json([
            //         'errors' => ['Model not found'],
            //     ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
            // }

            DB::beginTransaction();
            

            dd($validated);
           
            $collection = BookmarkCollection::create([
                'user_id' => Auth::id(),
                'title' => $validated['collection']['title'],
                'content' => $validated['collection']['content'],
                'visibility' => $validated['collection']['visibility']
            ]);
            // $itemData->bookmark_collection_id = $collection->id;


            // $itemData = new BookmarkItemData(
            //     id: null,
            //     user_id: Auth::id(),
            //     model_id: $validated['model_id'],
            //     model_type: $modelType,
            //     bookmark_collection_id: null,
            //     title: null,
            //     content: null
            // );



            // BookmarkItem::create($itemData->toArray());



            DB::commit();

            // return response()->json(['message' => 'Bookmark created successfully']);
            return response()->json([
                'message' => 'List created successfully',
                'collection' => $collection->id
            ])
                ->header('X-Inertia', 'true')
                ->header('Vary', 'Accept');

        } catch (\Exception $e) {
            DB::rollback();
            report($e);

            dd($e);

            // return response()->json([
            //     'errors' => ['Failed to create bookmark'],
            // ], SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR);
            return response()->json(['errors' => ['Operation failed']], SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR)
                ->header('X-Inertia', 'true')
                ->header('Vary', 'Accept');
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

    public function deleteItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bookmark_item_id' => ['required', 'integer', 'exists:bookmark_items,id'],
        ]);

        try {
            $bookmarkItem = BookmarkItem::findOrFail($data['bookmark_item_id']);

            if ($bookmarkItem->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], SymfonyResponse::HTTP_FORBIDDEN);
            }

            $this->authorize('delete', $bookmarkItem);

            $bookmarkItem->delete();

            return response()->json(['message' => 'Bookmark item deleted successfully']);

        } catch (\Exception $e) {
            return response()->json([
                'errors' => ['Failed to delete bookmark item'],
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
}
