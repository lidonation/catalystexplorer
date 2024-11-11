<?php

declare(strict_types=1);

namespace App\Contract;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface RepositoryInterface
{
    public function all(): array|Collection;

    public function find(int|string $id): Model;

    public function create(array $data): Model;

    public function update(array $data, $id): bool;

    public function delete(int|string $id): int;
}
