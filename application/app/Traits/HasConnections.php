<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\Connection;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Collection;

trait HasConnections
{
    public function connections(): MorphMany
    {
        return $this->morphMany(Connection::class, 'previous_model', 'previous_model_type', 'previous_model_id');
    }

    public function connected_users(): HasManyThrough
    {
        return $this->hasManyThrough(
            IdeascaleProfile::class,
            Connection::class,
            'previous_model_id',
            'id',
            'id',
            'next_model_id'
        )->where([
            ['connections.next_model_type', IdeascaleProfile::class],
            ['connections.previous_model_type', get_class($this)],
        ]);
    }

    public function connected_groups(): HasManyThrough
    {
        return $this->hasManyThrough(
            Group::class,
            Connection::class,
            'previous_model_id',
            'id',
            'id',
            'next_model_id'
        )->where([
            ['connections.next_model_type', Group::class],
            ['connections.previous_model_type', get_class($this)],
        ]);
    }

    public function connectedGroupsAndUsers(): Collection
    {
        $currentModelCollection = collect([$this]);

        $connectedUsers = $this->connected_users()->get();
        $connectedGroups = $this->connected_groups()->get();

        $connections = $connectedUsers->merge($connectedGroups);

        return $currentModelCollection->merge($connections);
    }
}
