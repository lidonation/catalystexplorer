<?php

declare(strict_types=1);

namespace App\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface RepositoryInterface
{
    public function all(): array|Collection;

    public function find(int|string $id): Model;

    public function create(array $data): Model;

    public function update(array $data, $id): bool;

    public function delete(int|string $id): int;
}
