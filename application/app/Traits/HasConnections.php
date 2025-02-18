<?php

declare(strict_types=1);

namespace App\Traits;

use App\Enums\CatalystConnectionParams;
use App\Models\Community;
use App\Models\Connection;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Http\Request;

trait HasConnections
{
    protected function connectedItems(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getConnectionsData()
        );
    }

    public function getConnectionsData(?Request $request = null): array
    {
        $id = $this->id;
        $rootNode = $this;
        if (! $rootNode) {
            return ['error' => 'Root node not found'];
        }

        $profileIds = $request ? (array) $request->query(CatalystConnectionParams::IDEASCALEPROFILE()->value, []) : [];
        $groupIds = $request ? (array) $request->query(CatalystConnectionParams::GROUP()->value, []) : [];
        $communityIds = $request ? (array) $request->query(CatalystConnectionParams::COMMUNITY()->value, []) : [];

        $nodes = collect();
        $links = collect();

        $rootConnections = $this->with(['connected_groups', 'connected_users', 'connected_communities'])
            ->where('id', $this->id)
            ->get();

        $allConnections = $this->fetchConnectionsRecursively($rootConnections, 6);

        $groups = ! empty($groupIds) ? $this->fetchEntities(Group::class, $groupIds) : collect();
        $profiles = ! empty($profileIds) ? $this->fetchEntities(IdeascaleProfile::class, $profileIds) : collect();
        $communities = ! empty($communityIds) ? $this->fetchEntities(Community::class, $communityIds) : collect();

        $entities = $allConnections->merge($groups)->merge($profiles)->merge($communities);

        foreach ($entities as $entity) {
            $nodes->push($this->formatNodeOrLink($entity));

            $connections = [
                'connected_groups' => $entity->connected_groups,
                'connected_users' => $entity->connected_users,
                'connected_communities' => $entity->connected_communities,
            ];

            foreach ($connections as $relationItems) {
                foreach ($relationItems as $item) {
                    $nodes->push($this->formatNodeOrLink($item));
                    $links->push($this->formatNodeOrLink($item, $entity));
                }
            }
        }

        if ($nodes->isEmpty() && $links->isEmpty()) {
            $nodes->push($this->formatNodeOrLink($this));
        }

        return [
            'nodes' => $nodes->unique(fn ($node): string => (string) $node['id'])->values()->all(),
            'links' => $links->unique(fn ($link): string => $link['source'].'-'.$link['target'])->values()->all(),
            'rootNodeId' => $id,
            'rootNodeHash' => $rootNode->hash,
            'rootNodeType' => get_class($rootNode),
        ];
    }

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

    public function connected_communities(): HasManyThrough
    {
        return $this->hasManyThrough(
            Community::class,
            Connection::class,
            'previous_model_id',
            'id',
            'id',
            'next_model_id'
        )->where([
            ['connections.next_model_type', Community::class],
            ['connections.previous_model_type', get_class($this)],
        ]);
    }

    private function fetchConnectionsRecursively($entities, int $depth, int $maxDepth = 6, &$visited = []): \Illuminate\Support\Collection
    {
        if ($depth > $maxDepth) {
            return collect();
        }

        $connections = collect();
        $groupIds = [];
        $profileIds = [];
        $communityIds = [];

        foreach ($entities as $entity) {

            if (in_array($entity->id, $visited)) {
                continue;
            }
            $visited[] = $entity->id;

            $groupIds = array_merge($groupIds, $entity->connected_groups->pluck('id')->all());
            $profileIds = array_merge($profileIds, $entity->connected_users->pluck('id')->all());
            $communityIds = array_merge($communityIds, $entity->connected_communities->pluck('id')->all());
        }

        $groups = ! empty($groupIds) ? $this->fetchEntities(Group::class, $groupIds) : collect();
        $profiles = ! empty($profileIds) ? $this->fetchEntities(IdeascaleProfile::class, $profileIds) : collect();
        $communities = ! empty($communityIds) ? $this->fetchEntities(Community::class, $communityIds) : collect();
        $connections = $connections->merge($groups)->merge($profiles)->merge($communities);

        return $connections->merge($this->fetchConnectionsRecursively($connections, $depth + 1, $maxDepth, $visited));
    }

    private function fetchEntities(string $model, array $ids)
    {
        return $model::with(['connected_groups', 'connected_users', 'connected_communities'])
            ->whereIn('id', array_unique($ids))
            ->get();
    }

    private function formatNodeOrLink($entity, $source = null): array
    {
        $type = get_class($entity);
        if (is_null($source)) {
            return [
                'id' => $entity->id,
                'type' => $type,
                'name' => $entity->name,
                'photo' => $entity->profile_photo_url,
                'hash' => $entity->hash,
            ];
        }

        return [
            'source' => $source->id,
            'target' => $entity->id,
        ];
    }
}
