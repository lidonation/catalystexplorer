<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\Comment;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CommentData extends Data
{
    public function __construct(
        public string $id,
        public string $text,
        public ?string $original_text,
        public string $created_at,
        public ?string $parent_id,
        public string $updated_at,
        public ?UserData $commentator,
        #[DataCollectionOf(CommentData::class)]
        public ?DataCollection $nested_comments,
    ) {}

    public static function fromComment(Comment $comment): self
    {
        // Handle nested comments recursively
        $nestedComments = null;
        if ($comment->nestedComments && $comment->nestedComments->count() > 0) {
            $nestedCommentsArray = $comment->nestedComments->map(function (Comment $nestedComment) {
                return self::fromComment($nestedComment);
            })->toArray();
            $nestedComments = new DataCollection(self::class, $nestedCommentsArray);
        }

        return new self(
            id: $comment->id,
            text: $comment->text,
            original_text: $comment->original_text,
            created_at: $comment->created_at->utc()->toISOString(), // Format as ISO string with timezone
            parent_id: $comment->parent_id,
            updated_at: $comment->updated_at->utc()->toISOString(), // Format as ISO string with timezone
            commentator: $comment->commentator ? UserData::from($comment->commentator) : null,
            nested_comments: $nestedComments,
        );
    }
}
