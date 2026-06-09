<?php

declare(strict_types=1);

use App\Models\BookmarkCollection;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('converts markdown original_text to sanitized html on save', function () {
    $user = User::factory()->create();
    $collection = BookmarkCollection::withoutSyncingToSearch(
        fn () => BookmarkCollection::factory()->create(['user_id' => $user->id])
    );

    $comment = new Comment([
        'original_text' => 'Hello **world**',
        'commentator_id' => $user->id,
        'commentator_type' => $user->getMorphClass(),
    ]);
    $comment->commentable()->associate($collection);
    $comment->save();

    expect($comment->text)->toContain('<strong>world</strong>');
});

it('strips unsafe html from comment text', function () {
    $user = User::factory()->create();
    $collection = BookmarkCollection::withoutSyncingToSearch(
        fn () => BookmarkCollection::factory()->create(['user_id' => $user->id])
    );

    $comment = new Comment([
        'original_text' => 'Hi <script>alert("xss")</script> there',
        'commentator_id' => $user->id,
        'commentator_type' => $user->getMorphClass(),
    ]);
    $comment->commentable()->associate($collection);
    $comment->save();

    expect($comment->text)->not->toContain('<script>');
});

it('approves a pending comment', function () {
    $user = User::factory()->create();
    $collection = BookmarkCollection::withoutSyncingToSearch(
        fn () => BookmarkCollection::factory()->create(['user_id' => $user->id])
    );

    $comment = new Comment([
        'original_text' => 'Approve me',
        'commentator_id' => $user->id,
        'commentator_type' => $user->getMorphClass(),
    ]);
    $comment->commentable()->associate($collection);
    $comment->save();

    expect($comment->isPending())->toBeTrue();

    $comment->approve();

    expect($comment->fresh()->isApproved())->toBeTrue();
});

it('exposes comments through the HasComments morph relation', function () {
    $user = User::factory()->create();
    $collection = BookmarkCollection::withoutSyncingToSearch(
        fn () => BookmarkCollection::factory()->create(['user_id' => $user->id])
    );

    Comment::create([
        'original_text' => 'A rationale',
        'commentator_id' => $user->id,
        'commentator_type' => $user->getMorphClass(),
        'commentable_type' => BookmarkCollection::class,
        'commentable_id' => $collection->id,
        'extra' => ['type' => 'rationale'],
    ]);

    $rationale = $collection->comments()
        ->where('commentator_id', $user->id)
        ->whereJsonContains('extra->type', 'rationale')
        ->first();

    expect($rationale)->not->toBeNull()
        ->and($rationale->original_text)->toBe('A rationale');
});

it('resolves nested comments and parent relations', function () {
    $user = User::factory()->create();
    $collection = BookmarkCollection::withoutSyncingToSearch(
        fn () => BookmarkCollection::factory()->create(['user_id' => $user->id])
    );

    $parent = Comment::create([
        'original_text' => 'Parent',
        'commentator_id' => $user->id,
        'commentator_type' => $user->getMorphClass(),
        'commentable_type' => BookmarkCollection::class,
        'commentable_id' => $collection->id,
    ]);

    $reply = Comment::create([
        'original_text' => 'Reply',
        'commentator_id' => $user->id,
        'commentator_type' => $user->getMorphClass(),
        'commentable_type' => BookmarkCollection::class,
        'commentable_id' => $collection->id,
        'parent_id' => $parent->id,
    ]);

    expect($parent->nestedComments)->toHaveCount(1)
        ->and($parent->nestedComments->first()->id)->toBe($reply->id)
        ->and($reply->parent->id)->toBe($parent->id)
        ->and($reply->commentator->id)->toBe($user->id);
});
