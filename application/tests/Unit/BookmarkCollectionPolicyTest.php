<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Enums\RoleEnum;
use App\Models\BookmarkCollection;
use App\Models\User;
use App\Policies\BookmarkCollectionPolicy;
use Illuminate\Auth\Access\Response;
use Mockery;
use Tests\TestCase;

class BookmarkCollectionPolicyTest extends TestCase
{
    protected BookmarkCollectionPolicy $policy;
    protected $owner;
    protected $otherUser;
    protected $admin;
    protected $bookmarkCollection;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->policy = new BookmarkCollectionPolicy();
        
        // Create mock users
        $this->owner = Mockery::mock(User::class);
        $this->owner->shouldReceive('getAttribute')->with('id')->andReturn('owner-uuid');
        $this->owner->shouldReceive('hasRole')->with(RoleEnum::admin()->value)->andReturn(false);
        $this->owner->shouldReceive('hasAnyRole')->with([RoleEnum::admin()->value, RoleEnum::super_admin()->value])->andReturn(false);
        $this->owner->shouldReceive('hasAnyPermission')->andReturn(false);
        $this->owner->shouldReceive('trashed')->andReturn(false);
        
        $this->otherUser = Mockery::mock(User::class);
        $this->otherUser->shouldReceive('getAttribute')->with('id')->andReturn('other-uuid');
        $this->otherUser->shouldReceive('hasRole')->with(RoleEnum::admin()->value)->andReturn(false);
        $this->otherUser->shouldReceive('hasAnyRole')->with([RoleEnum::admin()->value, RoleEnum::super_admin()->value])->andReturn(false);
        $this->otherUser->shouldReceive('hasAnyPermission')->andReturn(false);
        $this->otherUser->shouldReceive('trashed')->andReturn(false);
        
        $this->admin = Mockery::mock(User::class);
        $this->admin->shouldReceive('getAttribute')->with('id')->andReturn('admin-uuid');
        $this->admin->shouldReceive('hasRole')->with(RoleEnum::admin()->value)->andReturn(true);
        $this->admin->shouldReceive('hasAnyRole')->with([RoleEnum::admin()->value, RoleEnum::super_admin()->value])->andReturn(true);
        $this->admin->shouldReceive('hasAnyPermission')->andReturn(false);
        $this->admin->shouldReceive('trashed')->andReturn(false);
        
        // Create mock bookmark collection
        $this->bookmarkCollection = Mockery::mock(BookmarkCollection::class);
        $this->bookmarkCollection->shouldReceive('getAttribute')->with('user_id')->andReturn('owner-uuid');
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function owner_can_add_items_to_their_collection()
    {
        $result = $this->policy->addItems($this->owner, $this->bookmarkCollection);
        
        $this->assertTrue($result);
    }

    /** @test */
    public function other_users_cannot_add_items_to_collections_they_dont_own()
    {
        $result = $this->policy->addItems($this->otherUser, $this->bookmarkCollection);
        
        $this->assertFalse($result);
    }

    /** @test */
    public function admin_can_add_items_to_any_collection()
    {
        $result = $this->policy->addItems($this->admin, $this->bookmarkCollection);
        
        $this->assertTrue($result);
    }

    /** @test */
    public function owner_can_remove_items_from_their_collection()
    {
        $result = $this->policy->removeItems($this->owner, $this->bookmarkCollection);
        
        $this->assertTrue($result);
    }

    /** @test */
    public function other_users_cannot_remove_items_from_collections_they_dont_own()
    {
        $result = $this->policy->removeItems($this->otherUser, $this->bookmarkCollection);
        
        $this->assertFalse($result);
    }

    /** @test */
    public function admin_can_remove_items_from_any_collection()
    {
        $result = $this->policy->removeItems($this->admin, $this->bookmarkCollection);
        
        $this->assertTrue($result);
    }

    /** @test */
    public function unauthenticated_user_cannot_add_items()
    {
        // Since the policy expects a User object, let's test with a mock user that has no permissions
        $unauthenticatedUser = Mockery::mock(User::class);
        $unauthenticatedUser->shouldReceive('getAttribute')->with('id')->andReturn('unauth-uuid');
        $unauthenticatedUser->shouldReceive('hasAnyRole')->with([RoleEnum::admin()->value, RoleEnum::super_admin()->value])->andReturn(false);
        $unauthenticatedUser->shouldReceive('hasAnyPermission')->andReturn(false);
        $unauthenticatedUser->shouldReceive('trashed')->andReturn(false);
        
        $result = $this->policy->addItems($unauthenticatedUser, $this->bookmarkCollection);
        
        $this->assertFalse($result);
    }

    /** @test */
    public function unauthenticated_user_cannot_remove_items()
    {
        // Since the policy expects a User object, let's test with a mock user that has no permissions
        $unauthenticatedUser = Mockery::mock(User::class);
        $unauthenticatedUser->shouldReceive('getAttribute')->with('id')->andReturn('unauth-uuid');
        $unauthenticatedUser->shouldReceive('hasAnyRole')->with([RoleEnum::admin()->value, RoleEnum::super_admin()->value])->andReturn(false);
        $unauthenticatedUser->shouldReceive('hasAnyPermission')->andReturn(false);
        $unauthenticatedUser->shouldReceive('trashed')->andReturn(false);
        
        $result = $this->policy->removeItems($unauthenticatedUser, $this->bookmarkCollection);
        
        $this->assertFalse($result);
    }

    /** @test */
    public function soft_deleted_user_can_still_add_items_to_owned_collection()
    {
        // Create a mock for a soft-deleted user (current policy allows this)
        $deletedUser = Mockery::mock(User::class);
        $deletedUser->shouldReceive('getAttribute')->with('id')->andReturn('owner-uuid');
        $deletedUser->shouldReceive('hasRole')->with(RoleEnum::admin()->value)->andReturn(false);
        $deletedUser->shouldReceive('hasAnyRole')->with([RoleEnum::admin()->value, RoleEnum::super_admin()->value])->andReturn(false);
        $deletedUser->shouldReceive('hasAnyPermission')->andReturn(false);
        $deletedUser->shouldReceive('trashed')->andReturn(true); // This user is soft-deleted
        
        $result = $this->policy->addItems($deletedUser, $this->bookmarkCollection);
        
        // Current policy allows soft-deleted users to manage their own collections
        $this->assertTrue($result);
    }

    /** @test */
    public function soft_deleted_user_can_still_remove_items_from_owned_collection()
    {
        // Create a mock for a soft-deleted user (current policy allows this)
        $deletedUser = Mockery::mock(User::class);
        $deletedUser->shouldReceive('getAttribute')->with('id')->andReturn('owner-uuid');
        $deletedUser->shouldReceive('hasRole')->with(RoleEnum::admin()->value)->andReturn(false);
        $deletedUser->shouldReceive('hasAnyRole')->with([RoleEnum::admin()->value, RoleEnum::super_admin()->value])->andReturn(false);
        $deletedUser->shouldReceive('hasAnyPermission')->andReturn(false);
        $deletedUser->shouldReceive('trashed')->andReturn(true); // This user is soft-deleted
        
        $result = $this->policy->removeItems($deletedUser, $this->bookmarkCollection);
        
        // Current policy allows soft-deleted users to manage their own collections
        $this->assertTrue($result);
    }
}