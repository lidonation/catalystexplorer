<?php

declare(strict_types=1);

use App\DataTransferObjects\CommentData;
use App\DataTransferObjects\UserData;
use App\Models\Comment;
use App\Models\User;
use Tests\TestCase;
use Spatie\LaravelData\DataCollection;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts Comment model to CommentData DTO successfully', function () {
    $user = User::factory()->create();
    
    $comment = new Comment([
        'text' => 'This is a test comment',
        'commentator_id' => $user->id,
        'commentator_type' => User::class,
        'commentable_type' => 'App\Models\Post',
        'commentable_id' => 1,
    ]);
    $comment->save();
    $comment->load('commentator');

    $dto = $comment->toDto();

    expect($dto)->toBeInstanceOf(CommentData::class)
        ->and($dto->id)->toBe($comment->id)
        ->and($dto->text)->toBe('This is a test comment')
        ->and($dto->commentator)->toBeInstanceOf(UserData::class)
        ->and($dto->commentator->id)->toBe($user->id)
        ->and($dto->commentator->name)->toBe($user->name);
});

it('handles Comment with nested comments', function () {
    $user = User::factory()->create();
    
    // Create parent comment
    $parentComment = new Comment([
        'text' => 'Parent comment',
        'commentator_id' => $user->id,
        'commentator_type' => User::class,
        'commentable_type' => 'App\Models\Post',
        'commentable_id' => 1,
    ]);
    $parentComment->save();
    
    // Create nested comment
    $nestedComment = new Comment([
        'text' => 'Nested comment',
        'commentator_id' => $user->id,
        'commentator_type' => User::class,
        'commentable_type' => 'App\Models\Post',
        'commentable_id' => 1,
        'parent_id' => $parentComment->id,
    ]);
    $nestedComment->save();
    
    $parentComment->load(['commentator', 'nestedComments.commentator']);

    $dto = $parentComment->toDto();

    expect($dto)->toBeInstanceOf(CommentData::class)
        ->and($dto->text)->toBe('Parent comment')
        ->and($dto->parent_id)->toBeNull()
        ->and($dto->nested_comments)->toBeInstanceOf(DataCollection::class)
        ->and($dto->nested_comments)->toHaveCount(1);
    
    $nestedDto = $dto->nested_comments->first();
    expect($nestedDto)->toBeInstanceOf(CommentData::class)
        ->and($nestedDto->text)->toBe('Nested comment')
        ->and($nestedDto->parent_id)->toBe($parentComment->id);
});

it('serializes CommentData to array correctly', function () {
    $user = User::factory()->create();
    
    $comment = new Comment([
        'text' => 'Serialization test comment',
        'commentator_id' => $user->id,
        'commentator_type' => User::class,
        'commentable_type' => 'App\Models\Post',
        'commentable_id' => 1,
    ]);
    $comment->save();
    $comment->load('commentator');

    $dto = $comment->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $comment->id)
        ->toHaveKey('text', 'Serialization test comment')
        ->toHaveKey('created_at')
        ->toHaveKey('updated_at')
        ->toHaveKey('parent_id')
        ->toHaveKey('commentator')
        ->toHaveKey('nested_comments');
        
    expect($array['commentator'])->toBeArray()
        ->toHaveKey('id', $user->id)
        ->toHaveKey('name', $user->name);
});

it('creates CommentData from array data', function () {
    $userData = [
        'id' => fake()->uuid(),
        'name' => 'Test User',
        'email' => 'test@example.com',
        'hero_img_url' => null,
        'email_verified_at' => null,
        'locations' => null,
    ];
    
    $data = [
        'id' => fake()->uuid(),
        'text' => 'Comment from array',
        'original_text' => null,
        'created_at' => now()->format('Y-m-d H:i:s'),
        'updated_at' => now()->format('Y-m-d H:i:s'),
        'parent_id' => null,
        'commentator' => $userData,
        'nested_comments' => null,
    ];

    $dto = CommentData::from($data);

    expect($dto)->toBeInstanceOf(CommentData::class)
        ->and($dto->id)->toBe($data['id'])
        ->and($dto->text)->toBe('Comment from array')
        ->and($dto->commentator)->toBeInstanceOf(UserData::class)
        ->and($dto->commentator->name)->toBe('Test User')
        ->and($dto->nested_comments)->toBeNull();
});

it('handles Comment without commentator', function () {
    $comment = new Comment([
        'text' => 'Anonymous comment',
        'commentator_id' => null,
        'commentator_type' => null,
        'commentable_type' => 'App\\Models\\Post',
        'commentable_id' => 1,
    ]);
    $comment->save();

    $dto = $comment->toDto();

    expect($dto)->toBeInstanceOf(CommentData::class)
        ->and($dto->text)->toBe('Anonymous comment')
        ->and($dto->commentator)->toBeNull();
});

// Type Validation Tests
it('validates CommentData field types from factory', function () {
    $user = User::factory()->create();
    $comment = new Comment([
        'text' => 'Type check',
        'commentator_id' => $user->id,
        'commentator_type' => User::class,
        'commentable_type' => 'App\\Models\\Post',
        'commentable_id' => 1,
    ]);
    $comment->save();
    $comment->load('commentator');

    $dto = $comment->toDto();

    expect($dto->id)->toBeString();
    expect($dto->text)->toBeString();
    expect($dto->original_text)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->created_at)->toBeString();
    expect($dto->updated_at)->toBeString();
    expect($dto->parent_id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->commentator)->toSatisfy(fn($v) => is_null($v) || $v instanceof UserData);
    expect($dto->nested_comments)->toSatisfy(fn($v) => is_null($v) || $v instanceof \Spatie\LaravelData\DataCollection);
});

it('rejects invalid types for CommentData', function () {
    expect(fn() => CommentData::from([
        'id' => 'abc',
        'text' => ['invalid'],
        'created_at' => 123,
        'updated_at' => 123
    ]))->toThrow();
});

it('accepts null values for CommentData nullable fields', function () {
    $dto = CommentData::from([
        'id' => '1',
        'text' => 'ok',
        'original_text' => null,
        'created_at' => now()->format('Y-m-d H:i:s'),
        'parent_id' => null,
        'updated_at' => now()->format('Y-m-d H:i:s'),
        'commentator' => null,
        'nested_comments' => null,
    ]);

    expect($dto->original_text)->toBeNull();
    expect($dto->parent_id)->toBeNull();
    expect($dto->commentator)->toBeNull();
    expect($dto->nested_comments)->toBeNull();
});
