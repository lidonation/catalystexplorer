<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CommentData;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|string',
        ]);

        $className = $this->getCommentableModelClass($request->commentable_type);

        $model = $className::find($request->commentable_id);

        $comments = Comment::query()
            ->with(['nestedComments.commentator', 'commentator'])
            ->where([
                'commentable_type' => $className,
                'commentable_id' => $model->id,
            ])
            ->whereNull('parent_id')
            ->where(function ($query) {
                $query->whereNull('extra')
                    ->orWhereJsonDoesntContain('extra->type', 'rationale');
            })
            ->get();

        return $comments->map(function (Comment $comment) {
            return CommentData::fromComment($comment);
        });
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'text' => 'required|string',
            'parent_id' => 'nullable|string|',
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|string',
        ]);

        $parentId = ! empty($data['parent_id']) ? Comment::find($data['parent_id'])?->id : null;

        $className = $this->getCommentableModelClass($request->commentable_type);

        $model = $className::find($data['commentable_id']);

        if (empty($model)) {
            return ['error' => 'Cannot save comment'];
        }

        $user = auth()->user();

        // Manually create comment to ensure UUID is generated before save
        $comment = new Comment([
            'original_text' => $data['text'],
            'commentator_id' => $user?->getKey(),
            'commentator_type' => $user?->getMorphClass(),
            'parent_id' => $parentId,
        ]);

        // Set UUID before saving
        $comment->id = (string) \Str::uuid();
        $comment->commentable()->associate($model);
        $comment->save();

        // Approve the comment automatically
        $comment->approve();

        if (in_array(Searchable::class, class_uses_recursive($model))) {
            try {
                $model->searchable();
            } catch (\Throwable $e) {
                Log::error('Failed to make model searchable: '.$e->getMessage());
            }
        }

        $comments = Comment::query()
            ->with(['nestedComments.commentator', 'commentator'])
            ->where([
                'commentable_type' => $className,
                'commentable_id' => $model->id,
            ])
            ->whereNull('parent_id')
            ->where(function ($query) {
                $query->whereNull('extra')
                    ->orWhereJsonDoesntContain('extra->type', 'rationale');
            })
            ->get();

        return $comments->map(function (Comment $comment) {
            return CommentData::fromComment($comment);
        });
    }

    public function getCommentableModelClass(string $type): string
    {
        $modelClass = 'App\\Models\\'.Str::studly($type);

        if (! class_exists($modelClass)) {
            throw new \InvalidArgumentException("Model '$modelClass' does not exist.");
        }

        return $modelClass;
    }
}
