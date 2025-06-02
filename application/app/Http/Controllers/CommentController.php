<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\Log;

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
                'commentable_id' => $model->id
            ])
            ->whereNull('parent_id')
            ->get();

        return $comments;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'text' => 'required|string',
            'parent_id' => 'nullable|integer|exists:comments,id',
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|string',
        ]);

        $className = $this->getCommentableModelClass($request->commentable_type);

        $model = $className::byHash($data['commentable_id']);

        if (empty($model)) {
            return ['error' => 'Cannot save comment'];
        }

        $comment = new Comment([
            'commentable_type' => $className,
            'text' => $data['text'],
            'parent_id' => $data['parent_id'],
            'commentable_id' => $model->id,
            'original_text' =>  $data['text'],
            'commentator_id' => auth()->user()?->id
        ]);

        $comment->save();

        if (in_array(Searchable::class, class_uses_recursive($model))) {
            try {
                $model->searchable(); 
            } catch (\Throwable $e) {
                Log::error("Failed to make model searchable: " . $e->getMessage());
            }
        }
    }

    function getCommentableModelClass(string $type): string
    {
        $modelClass = 'App\\Models\\' . Str::studly($type);

        if (!class_exists($modelClass)) {
            throw new \InvalidArgumentException("Model '$modelClass' does not exist.");
        }

        return $modelClass;
    }
}
