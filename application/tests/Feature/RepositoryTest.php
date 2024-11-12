<?php

declare(strict_types=1);

use App\Models\Proposal;
use App\Models\User;
use App\Repositories\Repository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Initialize repository with the User model
    $this->repository = new Repository(new User());
});

it('returns all records with all method', function () {
    User::factory()->count(3)->create();
    $records = $this->repository->all();

    expect($records)->toBeInstanceOf(Collection::class)
        ->and($records)->toHaveCount(3);
});

it('returns correct record count with count method', function () {
    User::factory()->count(5)->create();
    $count = $this->repository->count();

    expect($count)->toBeInt()->toEqual(5);
});

it('retrieves by id  with find method', function () {
    $user = User::factory()->create([
        'name' => 'Sample User',
    ]);

    $foundById = $this->repository->find($user->id);
    expect($foundById)->toBeInstanceOf(User::class)
        ->and($foundById->id)->toEqual($user->id);
});

it('retrieves by id or slug with find method', function () {

    $this->repository = new Repository(new Proposal());

    $proposal = Proposal::factory(state: [
        'title' => json_encode(['en' => 'Nice proposal']),
        'slug' => 'nice-proposal'
    ])->create();

    $foundById = $this->repository->find($proposal->id);
    expect($foundById)->toBeInstanceOf(Proposal::class)
        ->and($foundById->id)->toEqual($proposal->id);

    $foundBySlug = $this->repository->find('nice-proposal');
    expect($foundBySlug)->toBeInstanceOf(Proposal::class)
        ->and($foundBySlug->slug)->toEqual('nice-proposal');
});

it('creates a new record with create method', function () {
    $data = ['name' => 'New User', 'email' => 'newuser@example.com', 'password' => bcrypt('password')];
    $user = $this->repository->create($data);

    expect($user)->toBeInstanceOf(User::class)
        ->and($user->name)->toEqual('New User');
});

it('updates existing record with update method', function () {
    $user = User::factory()->create(['name' => 'Old Name']);
    $updated = $this->repository->update(['name' => 'Updated Name'], $user->id);

    expect($updated)->toBeTrue()
        ->and($user->refresh()->name)->toEqual('Updated Name');
});

it('deletes a record by id with delete method', function () {
    $user = User::factory()->create();
    $deleted = $this->repository->delete($user->id);

    expect($deleted)->toEqual(1)
        ->and(User::find($user->id))->toBeNull();
});

it('applies limit to query with limit method', function () {
    User::factory()->count(10)->create();
    $records = $this->repository->limit(5)->all();

    expect($records)->toHaveCount(5);
});

it('returns paginated result with paginate method', function () {
    User::factory()->count(15)->create();
    $paginator = $this->repository->paginate(5);

    expect($paginator)->toBeInstanceOf(LengthAwarePaginator::class)
        ->and($paginator->perPage())->toEqual(5);
});
