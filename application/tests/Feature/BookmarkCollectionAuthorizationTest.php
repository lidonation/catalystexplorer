<?php

declare(strict_types=1);

use App\Enums\BookmarkableType;
use App\Enums\RoleEnum;
use App\Http\Middleware\WorkflowMiddleware;
use App\Models\BookmarkCollection;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->owner = User::factory()->create(['name' => 'Collection Owner']);
    $this->otherUser = User::factory()->create(['name' => 'Other User']);
    $this->admin = User::factory()->create(['name' => 'Admin User']);

    // Create the admin role
    Role::findOrCreate(RoleEnum::admin()->value);
    $this->admin->assignRole(RoleEnum::admin()->value);

    $this->bookmarkCollection = BookmarkCollection::factory()->create([
        'user_id' => $this->owner->id
    ]);

    $this->proposal = Proposal::factory()->create();

    // Mock the workflow middleware that's normally applied to these routes
    $this->withoutMiddleware(WorkflowMiddleware::class);
});

describe('BookmarkCollection addBookmarkItem authorization', function () {
    it('allows collection owner to add bookmark items', function () {
        $this->actingAs($this->owner)
            ->withSession(['_token' => 'test-token'])
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
                '_token' => 'test-token',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Bookmark added!.');
    });

    it('prevents other users from adding bookmark items', function () {
        $this->actingAs($this->otherUser)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertForbidden();
    });

    it('allows admin users to add bookmark items to any collection', function () {
        $this->actingAs($this->admin)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Bookmark added!.');
    });

    it('requires authentication to add bookmark items', function () {
        $this->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertRedirect(); // Should redirect to login
    });

    it('validates required fields when adding bookmark items', function () {
        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                // Missing required fields
            ])
            ->assertSessionHasErrors(['modelType', 'hash']);
    });

    it('handles invalid model type gracefully', function () {
        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'invalid-model-type',
                'hash' => $this->proposal->id,
            ])
            ->assertRedirect()
            ->assertSessionHasErrors();
    });

    it('handles non-existent model hash', function () {
        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => 'non-existent-uuid',
            ])
            ->assertRedirect()
            ->assertSessionHasErrors('message');
    });
});

describe('BookmarkCollection removeBookmarkItem authorization', function () {
    beforeEach(function () {
        // Create a bookmark item to remove
        $this->bookmarkItem = \App\Models\BookmarkItem::factory()->create([
            'user_id' => $this->owner->id,
            'bookmark_collection_id' => $this->bookmarkCollection->id,
            'model_id' => $this->proposal->id,
            'model_type' => Proposal::class,
        ]);
    });

    it('allows collection owner to remove bookmark items', function () {
        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.removeBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Bookmark removed.');
    });

    it('prevents other users from removing bookmark items', function () {
        $this->actingAs($this->otherUser)
            ->post(route('workflows.bookmarks.removeBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertForbidden();
    });

    it('allows admin users to remove bookmark items from any collection', function () {
        $this->actingAs($this->admin)
            ->post(route('workflows.bookmarks.removeBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Bookmark removed.');
    });

    it('requires authentication to remove bookmark items', function () {
        $this->post(route('workflows.bookmarks.removeBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertRedirect(); // Should redirect to login
    });

    it('validates required fields when removing bookmark items', function () {
        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.removeBookmarkItem', $this->bookmarkCollection), [
                // Missing required fields
            ])
            ->assertSessionHasErrors(['modelType', 'hash']);
    });

    it('handles removing non-existent bookmark gracefully', function () {
        // Create a different proposal that's not bookmarked
        $unbookmarkedProposal = Proposal::factory()->create();

        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.removeBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $unbookmarkedProposal->id,
            ])
            ->assertRedirect()
            ->assertSessionHasErrors('message');
    });
});

describe('BookmarkCollection Policy Integration', function () {
    it('correctly uses addItems policy method', function () {
        $gate = app('Illuminate\Contracts\Auth\Access\Gate');

        // Test owner authorization
        auth()->login($this->owner);
        expect($gate->allows('addItems', $this->bookmarkCollection))->toBeTrue();

        // Test other user authorization
        auth()->login($this->otherUser);
        expect($gate->allows('addItems', $this->bookmarkCollection))->toBeFalse();

        // Test admin authorization
        auth()->login($this->admin);
        expect($gate->allows('addItems', $this->bookmarkCollection))->toBeTrue();
    });

    it('correctly uses removeItems policy method', function () {
        $gate = app('Illuminate\Contracts\Auth\Access\Gate');

        // Test owner authorization
        auth()->login($this->owner);
        expect($gate->allows('removeItems', $this->bookmarkCollection))->toBeTrue();

        // Test other user authorization
        auth()->login($this->otherUser);
        expect($gate->allows('removeItems', $this->bookmarkCollection))->toBeFalse();

        // Test admin authorization
        auth()->login($this->admin);
        expect($gate->allows('removeItems', $this->bookmarkCollection))->toBeTrue();
    });
});

describe('BookmarkCollection Authorization Edge Cases', function () {
    it('handles deleted bookmark collection gracefully', function () {
        $this->bookmarkCollection->delete();

        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertNotFound();
    });

    it('handles soft-deleted user trying to access collection', function () {
        $this->owner->delete(); // Soft delete the owner

        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertForbidden();
    });

    it('prevents adding duplicate bookmark items', function () {
        // Add the item first
        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        // Try to add the same item again (should use updateOrCreate, so it should still succeed)
        $this->actingAs($this->owner)
            ->post(route('workflows.bookmarks.addBookmarkItem', $this->bookmarkCollection), [
                'modelType' => 'proposals',
                'hash' => $this->proposal->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        // Verify only one bookmark item exists
        expect(\App\Models\BookmarkItem::where('bookmark_collection_id', $this->bookmarkCollection->id)
            ->where('model_id', $this->proposal->id)
            ->count())->toBe(1);
    });
});
