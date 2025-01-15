<?php declare(strict_types=1);

namespace App\Http\Controllers\My;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookmarkCollectionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\BookmarkItem;
use App\Models\BookmarkCollection;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Review;
use App\Models\Proposal;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Fluent;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\JsonResponse;

class MyBookmarksController extends Controller
{
    protected array $bookmarkableTypes = [
        'proposals' => 'App\Models\Proposal',
        'ideascale_profiles' => 'App\Models\IdeascaleProfile',
        'groups' => 'App\Models\Group',
        'reviews' => 'App\Models\Review',
        'articles' => 'App\Models\Article',
        'lists' => 'App\Models\BookmarkCollection',
    ];

    public function index(Request $request): Response
    {
        $collections = BookmarkCollection::where('user_id', Auth::id())->whereNotNull('user_id')
            ->withCount(['items']);
    
        $hashes = $request->get('hashes', false);
    
        if ($hashes) {
            $collections = $collections->whereHashIn($hashes);
        }
    
        $collections = $collections->get(['id', 'title', 'items.id']);
    
        return Inertia::render('My/Bookmarks/Index', [
            'collections' => $collections
        ]);
    }

    public function show(Request $request, string $id): Response
    {
        $user = Auth::user();

        $bookmark = BookmarkItem::where('user_id', $user->id)
            ->where('id', $id)
            ->with('model')
            ->firstOrFail();

        $bookmarkType = array_search($bookmark->model_type, $this->bookmarkableTypes) ?: 'unknown';

        $links = [
            [
                'type' => $bookmarkType,
                'count' => BookmarkItem::where('user_id', $user->id)
                    ->where('model_type', $bookmark->model_type)
                    ->count()
            ]
        ];

        return Inertia::render('My/Bookmarks/Partials/Show', [
            'bookmark' => $bookmark,
            'bookmarkType' => $bookmarkType,
            'links' => $links,
        ]);
    }

    public function createItem(Request $request): Response
    {
        DB::beginTransaction();
        try {
            $modelTable = $request->get('model_type');
            $modelType = match ($request->get('model_type')) {
                'proposals' => Proposal::class,
                'ideascale_profiles' => IdeascaleProfile::class,
                'groups' => Group::class,
                'reviews' => Review::class,
                'lists' => BookmarkCollection::class,
                default => throw new \Exception('Unsupported model type provided'),
            };

            $data = new Fluent($request->validate([
                'model_id' => "required|exists:{$modelTable},id",
                'parent_id' => "nullable|bail|hashed_exists:{$modelTable},id",
                'content' => 'nullable|bail|string',
                'link' => 'nullable|bail|active_url',
                'collection.hash' => 'nullable|bail',
                'collection.title' => 'required_without:collection.hash|min:5',
            ]));

            $collection = null;
            if (isset($data->collection['hash'])) {
                $collection = BookmarkCollection::byHash($data->collection['hash']) ?? DraftBallot::byHash($data->collection['hash']);
            }

            if (! $collection instanceof BookmarkCollection && ! $collection instanceof DraftBallot) {
                $collection = new BookmarkCollection;
                $collection->title = $data->collection['title'] ?? null;
                $collection->content = $data->collection['content'] ?? null;
                $collection->visibility = 'unlisted';
                $collection->status = 'published';
                $collection->user_id = Auth::id();
                $collection->color = '#'.str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT);
                $collection->save();
            } elseif ($collection instanceof DraftBallot && $modelTable === 'proposals') {
                $proposal = Proposal::find($data->model_id);
                $fund = $proposal->fund->parent ?? $proposal->fund;
                $activeFund = Fund::find($collection->fund_id);

                $proposalFundMatched = $fund->id == $activeFund->id ? true : false;

                if (! $proposalFundMatched) {
                    throw new \Exception('Proposal is not in '.$activeFund->title);
                }

                $collection->fund_id = $fund->id;
                $collection->save();
            }

            $item = new BookmarkItem;
            $item->user_id = Auth::id();
            $item->bookmark_collection_id = $collection->raw_id;
            $item->model_id = $data->model_id;
            $item->model_type = $data->model_type ?? $modelType;
            $item->content = $data->content;
            $item->save();

            DB::commit();

            $collection->refresh();
            $collection->load(['items']);

            return Inertia::render('My/Bookmarks/Index', [
                'bookmarkCollection' => new BookmarkCollectionResource($collection),
                'message' => 'Bookmark created successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            report($e->getMessage());

            return Inertia::render('My/Bookmarks/Index', [
                'errors' => ['Failed to create bookmark: ' . $e->getMessage()]
            ]);
        }
    }

    public function view(Request $request, BookmarkCollection $bookmarkCollection): Response
    {
        return Inertia::render('BookmarkCollection')->with([
            'bookmarkCollection' => new BookmarkCollectionResource($bookmarkCollection),
        ]);
    }

    public function getCollectionsOfProposal(Request $request): Response
    {
        $userId = Auth::id();
        $proposalId = $request->input('model_id');

        $collections = BookmarkItem::where('bookmark_items.model_id', $proposalId)
            ->join('bookmark_collections', 'bookmark_items.bookmark_collection_id', '=', 'bookmark_collections.id')
            ->where('bookmark_collections.user_id', $userId)
            ->select('bookmark_collections.*')
            ->get();

        return Inertia::render('My/Bookmarks/Index', [
            'collections' => $collections,
            'proposalId' => $proposalId
        ]);
    }

    public function getBookmarksByType(Request $request): Response
    {
        try {
            $userId = Auth::id();
            $modelType = $request->input('model_type');

            if (!array_key_exists($modelType, $this->bookmarkableTypes)) {
                throw new \Exception("Invalid or unsupported model type: {$modelType}");
            }

            $bookmarkItems = BookmarkItem::where('user_id', $userId)
                ->where('model_type', $this->bookmarkableTypes[$modelType])
                ->with(['model', 'collection'])
                ->get();

            return Inertia::render('My/Bookmarks/Index', [
                'bookmarkItems' => $bookmarkItems,
                'modelType' => $modelType
            ]);
        } catch (\Exception $e) {
            report($e);
            
            return Inertia::render('My/Bookmarks/Index', [
                'errors' => [$e->getMessage()]
            ]);
        }
    }

    public function deleteFromCollection(Request $request): Response
    {
        try {
            $userId = Auth::id();
            $modelId = $request->input('model_id');
            $modelTypeKey = $request->input('model_type');

            if (!array_key_exists($modelTypeKey, $this->bookmarkableTypes)) {
                throw new \Exception("Invalid or unsupported model type: {$modelTypeKey}");
            }

            $modelType = $this->bookmarkableTypes[$modelTypeKey];

            $item = BookmarkItem::where('bookmark_items.model_id', $modelId)
                ->where('bookmark_items.model_type', $modelType)
                ->join('bookmark_collections', 'bookmark_items.bookmark_collection_id', '=', 'bookmark_collections.id')
                ->where('bookmark_collections.user_id', $userId)
                ->select('bookmark_items.*')
                ->firstOrFail();

            $collection = $item->collection;
            $item->delete();

            return Inertia::render('My/Bookmarks/Partials/Show', [
                'bookmarkCollection' => new BookmarkCollectionResource($collection),
                'message' => 'Bookmark removed successfully'
            ]);

        } catch (\Exception $e) {
            return Inertia::render('My/Bookmarks/Partials/Show', [
                'errors' => ['Failed to remove bookmark: ' . $e->getMessage()]
            ]);
        }
    }

    public function deleteCollection(Request $request): Response
    {
        $data = $request->validate([
            'bookmark_collection_id' => 'required|integer|exists:bookmark_collections,id',
            'bookmark_ids' => 'required|array',
            'bookmark_ids.*' => 'required|integer|exists:bookmark_items,id',
        ]);

        try {
            DB::beginTransaction();
            
            $collection = BookmarkCollection::findOrFail($data['bookmark_collection_id']);
            
            if ($collection->user_id !== Auth::id()) {
                throw new \Exception('Unauthorized to modify this collection');
            }

            BookmarkItem::whereIn('id', $data['bookmark_ids'])
                ->where('bookmark_collection_id', $data['bookmark_collection_id'])
                ->where('user_id', Auth::id())
                ->delete();

            DB::commit();

            $collection->refresh();
            $collection->load(['items']);

            return Inertia::render('BookmarkCollection', [
                'bookmarkCollection' => new BookmarkCollectionResource($collection),
                'message' => 'Bookmarks deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return Inertia::render('BookmarkCollection', [
                'bookmarkCollection' => new BookmarkCollectionResource($collection),
                'errors' => ['Failed to delete bookmarks: ' . $e->getMessage()]
            ]);
        }
    }
}
