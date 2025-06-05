<?php

declare(strict_types=1);

use App\Enums\BookmarkVisibility;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use function Pest\Laravel\{actingAs, delete, get, post, withSession};

uses(RefreshDatabase::class);

it('shows all bookmarks for the authenticated user', function () {
    // Create admin role
    Role::create([
        'name' => RoleEnum::admin()->value,
        'guard_name' => 'web',
    ]);

    /** @var User $user */
    $user = User::factory()->create()->first();
    $user->assignRole(RoleEnum::admin()->value);

    // Only create simple collections and a lightweight bookmark item per collection
    BookmarkCollection::factory()
        ->count(3)
        ->create(['user_id' => $user->id])
        ->each(function ($collection) use ($user) {
            // Create a related Proposal
            $proposal = Proposal::factory()->create();

            BookmarkItem::factory()->create([
            'bookmark_collection_id' => $collection->id,
                'user_id' => $user->id,
                'model_type' => Proposal::class,
                'model_id' => $proposal->id,
            ]);
        });

    actingAs($user);

    $response = get(route('my.bookmarks.index'));

    $response->assertOk()
        ->assertSee('collections'); 
});

it('restricts viewing bookmarks to authenticated users only', function () {
    $response = get(route('my.bookmarks.index'));

    $response->assertRedirect(); // Optional: check for specific login route
    // $response->assertRedirect(route('login')); // Uncomment if your app redirects to login
});

//it('allows the user to view their own collection', function () {
//    Role::create(['name' => RoleEnum::admin()->value, 'guard_name' => 'web']);
//    $user = User::factory()->create();
//    $user->assignRole(RoleEnum::admin()->value);
//    $collection = BookmarkCollection::factory()->create(['user_id' => $user->id]);
//
//    actingAs($user);
//
//    $response = get(route('my.bookmarks.collections.view', $collection->id));
//
//    $response->assertOk()
//        ->assertSee($collection->title);
//});

//it('prevents deletion of another user\'s bookmark collection', function () {
//    $user = User::factory()->create();
//    $otherUser = User::factory()->create();
//    $collection = BookmarkCollection::factory()->create(['user_id' => $otherUser->id]);
//    $bookmark = BookmarkItem::factory()->create([
//        'bookmark_collection_id' => $collection->id,
//        'user_id' => $otherUser->id,
//    ]);
//
//    actingAs($user)->withoutMiddleware();
//    withSession(['_token' => 'lido']);
//
//    $response = delete(route('my.bookmarks.collections.destroy'), [
//        'bookmark_collection_id' => $collection->id,
//        'bookmark_ids' => [$bookmark->id],
//        '_token' => 'lido'
//    ]);
//
//    $response->assertForbidden();
//});

//it('deletes a user\'s collection and bookmarks', function () {
//    Role::create(['name' => RoleEnum::admin()->value, 'guard_name' => 'web']);
//    Permission::create(['name' => PermissionEnum::delete_bookmark_collections()->value, 'guard_name' => 'web']);
//
//    $user = User::factory()->create();
//    $user->assignRole(RoleEnum::admin()->value);
//    $user->givePermissionTo(PermissionEnum::delete_bookmark_collections()->value);
//
//    $collection = BookmarkCollection::factory()->create(['user_id' => $user->id]);
//    $bookmarks = BookmarkItem::factory()->count(3)->create([
//        'bookmark_collection_id' => $collection->id,
//        'user_id' => $user->id,
//    ]);
//
//    actingAs($user)
//        ->withoutMiddleware();
//
//    $response = delete(route('my.bookmarks.collections.destroy'), [
//        'bookmark_collection_id' => $collection->id,
//        'bookmark_ids' => $bookmarks->pluck('id')->toArray(),
//    ]);
//
//    $response->assertOk();
//
//    $this->assertSoftDeleted('bookmark_collections', ['id' => $collection->id]);
//    foreach ($bookmarks as $bookmark) {
//        $this->assertSoftDeleted('bookmark_items', ['id' => $bookmark->id]);
//    }
//});

//it('prevents creating a bookmark item in a non-existent collection', function () {
//    Role::create(['name' => RoleEnum::admin()->value, 'guard_name' => 'web']);
//    Permission::create(['name' => PermissionEnum::create_bookmark_items()->value, 'guard_name' => 'web']);
//
//    $user = User::factory()->create();
//    $user->assignRole(RoleEnum::admin()->value);
//    $user->givePermissionTo(PermissionEnum::create_bookmark_items()->value);
//
//    actingAs($user)
//        ->withoutMiddleware();
//
//    $response = post(route('my.bookmarks.create-item'), [
//        'model_type' => 'products',
//        'model_id' => 9999,
//        'collection' => [
//            'title' => 'My Collection',
//        ],
//    ]);
//
//    $response->assertUnprocessable()
//        ->assertJsonValidationErrors(['model_type']);
//});

//it('ensures a bookmark belongs to the authenticated user', function () {
//    $user = User::factory()->create();
//    $otherUser = User::factory()->create();
//    $bookmark = BookmarkItem::factory()->create(['user_id' => $otherUser->id]);
//
//    actingAs($user);
//
//    $response = get(route('my.bookmarks.show', $bookmark->id));
//
//    $response->assertNotFound();
//});

//it('prevents deletion when bookmark ids do not match collection', function () {
//    Role::create(['name' => RoleEnum::admin()->value, 'guard_name' => 'web']);
//    Permission::create(['name' => PermissionEnum::delete_bookmark_collections()->value, 'guard_name' => 'web']);
//
//    $user = User::factory()->create();
//    $user->assignRole(RoleEnum::admin()->value);
//    $user->givePermissionTo(PermissionEnum::delete_bookmark_collections()->value);
//
//    $collection = BookmarkCollection::factory()->create(['user_id' => $user->id]);
//    $otherCollection = BookmarkCollection::factory()->create(['user_id' => $user->id]);
//
//    // Create bookmark in other collection
//    $bookmark = BookmarkItem::factory()->create([
//        'bookmark_collection_id' => $otherCollection->id,
//        'user_id' => $user->id,
//    ]);
//
//    actingAs($user)
//        ->withoutMiddleware();
//
//    $response = delete(route('my.bookmarks.collections.destroy'), [
//        'bookmark_collection_id' => $collection->id,  // Different collection
//        'bookmark_ids' => [$bookmark->id],
//    ]);
//
//    $response->assertUnprocessable()
//        ->assertJsonPath('errors.0', 'Invalid bookmark selection');
//});
