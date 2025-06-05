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

        $model = $className::byHash($request->commentable_id);

        $comments = Comment::query()
            ->with(['nestedComments.commentator', 'commentator'])
            ->where([
                'commentable_type' => $className,
                'commentable_id' => $model->id,
            ])
            ->whereNull('parent_id')
            ->get();

        return CommentData::collect($comments);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'text' => 'required|string',
            'parent_id' => 'nullable|string|',
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|string',
        ]);

        $parentId = Comment::byHash($data['parent_id'])?->id;

        $className = $this->getCommentableModelClass($request->commentable_type);

        $model = $className::byHash($data['commentable_id']);

        if (empty($model)) {
            return ['error' => 'Cannot save comment'];
        }

        $comment = new Comment([
            'commentable_type' => $className,
            'text' => $data['text'],
            'parent_id' => $parentId,
            'commentable_id' => $model->id,
            'original_text' => $data['text'],
            'commentator_id' => auth()->user()?->id,
        ]);

        $comment->save();

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
            ->get();

        return CommentData::collect($comments);
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
