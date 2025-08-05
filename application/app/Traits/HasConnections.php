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
use Illuminate\Support\Facades\Cache;

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

        $isInitialLoad = ! $request || (
            empty($request->query(CatalystConnectionParams::IDEASCALEPROFILE()->value, [])) &&
            empty($request->query(CatalystConnectionParams::GROUP()->value, [])) &&
            empty($request->query(CatalystConnectionParams::COMMUNITY()->value, [])) &&
            ! $request->has(CatalystConnectionParams::EXCLUDE_EXISTING()->value) &&
            ! $request->has(CatalystConnectionParams::DEPTH()->value)
        );

        if ($isInitialLoad) {
            return $this->getInitialConnectionsData($id, $rootNode);
        }

        return $this->getExpandedConnectionsData($request);
    }

    private function getInitialConnectionsData($id, $rootNode): array
    {
        $cacheKey = "connections:initial:{$rootNode->hash}:".get_class($rootNode);

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($id, $rootNode) {
            $startTime = microtime(true);

            $nodes = collect();
            $links = collect();

            $rootConnections = $this->with(['connected_groups', 'connected_users', 'connected_communities'])
                ->where('id', $this->id)
                ->get();

            $allConnections = $this->fetchConnectionsRecursively($rootConnections, 1, 2);

            foreach ($allConnections as $entity) {
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

            $uniqueNodes = $nodes->unique(fn ($node): string => (string) $node['id'])->values()->all();
            $uniqueLinks = $links->unique(fn ($link): string => $link['source'].'-'.$link['target'])->values()->all();

            $executionTime = round((microtime(true) - $startTime) * 1000, 2);

            return [
                'nodes' => $uniqueNodes,
                'links' => $uniqueLinks,
                'rootNodeId' => $id,
                'rootNodeHash' => $rootNode->hash,
                'rootNodeType' => get_class($rootNode),
            ];
        });
    }

    private function getExpandedConnectionsData(Request $request): array
    {
        $profileIds = (array) $request->query(CatalystConnectionParams::IDEASCALEPROFILE()->value, []);
        $groupIds = (array) $request->query(CatalystConnectionParams::GROUP()->value, []);
        $communityIds = (array) $request->query(CatalystConnectionParams::COMMUNITY()->value, []);

        $nodes = collect();
        $links = collect();

        $nodes->push($this->formatNodeOrLink($this));

        $this->load(['connected_groups', 'connected_users', 'connected_communities']);

        $rootConnections = [
            'connected_groups' => $this->connected_groups,
            'connected_users' => $this->connected_users,
            'connected_communities' => $this->connected_communities,
        ];

        foreach ($rootConnections as $relationItems) {
            foreach ($relationItems as $item) {
                $nodes->push($this->formatNodeOrLink($item));
                $links->push($this->formatNodeOrLink($item, $this));
            }
        }

        $additionalEntities = collect();
        if (! empty($groupIds)) {
            $additionalEntities = $additionalEntities->merge(
                Group::with(['connected_groups', 'connected_users', 'connected_communities'])
                    ->whereIn('id', $groupIds)
                    ->get()
            );
        }
        if (! empty($profileIds)) {
            $additionalEntities = $additionalEntities->merge(
                IdeascaleProfile::with(['connected_groups', 'connected_users', 'connected_communities'])
                    ->whereIn('id', $profileIds)
                    ->get()
            );
        }
        if (! empty($communityIds)) {
            $additionalEntities = $additionalEntities->merge(
                Community::with(['connected_groups', 'connected_users', 'connected_communities'])
                    ->whereIn('id', $communityIds)
                    ->get()
            );
        }

        foreach ($additionalEntities as $entity) {
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

        return [
            'nodes' => $nodes->unique(fn ($node): string => (string) $node['id'])->values()->all(),
            'links' => $links->unique(fn ($link): string => $link['source'].'-'.$link['target'])->values()->all(),
            'rootNodeId' => $this->id,
            'rootNodeHash' => $this->hash,
            'rootNodeType' => get_class($this),
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

    private function fetchConnectionsRecursively($entities, int $depth, int $maxDepth = 2, &$visited = []): \Illuminate\Support\Collection
    {
        if ($depth > $maxDepth) {
            return collect();
        }

        $startTime = microtime(true);
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

        $groupIds = array_unique(array_diff($groupIds, $visited));
        $profileIds = array_unique(array_diff($profileIds, $visited));
        $communityIds = array_unique(array_diff($communityIds, $visited));

        $fetchPromises = [];
        if (! empty($groupIds)) {
            $groups = $this->fetchEntitiesOptimized(Group::class, $groupIds);
            $connections = $connections->merge($groups);
        }
        if (! empty($profileIds)) {
            $profiles = $this->fetchEntitiesOptimized(IdeascaleProfile::class, $profileIds);
            $connections = $connections->merge($profiles);
        }
        if (! empty($communityIds)) {
            $communities = $this->fetchEntitiesOptimized(Community::class, $communityIds);
            $connections = $connections->merge($communities);
        }

        $executionTime = round((microtime(true) - $startTime) * 1000, 2);

        if ($depth === 1) {
            return $connections;
        }

        return collect();
    }

    private function fetchEntitiesOptimized(string $model, array $ids)
    {
        if (empty($ids)) {
            return collect();
        }

        $ids = array_unique($ids);
        $modelName = class_basename($model);
        $sortedIds = $ids;
        sort($sortedIds);
        $cacheKey = "connections:entities:{$modelName}:".hash('sha256', implode(',', $sortedIds));

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($model, $ids) {
            $startTime = microtime(true);

            $chunkSize = 100;
            $results = collect();

            if (count($ids) > $chunkSize) {
                $chunks = array_chunk($ids, $chunkSize);
                foreach ($chunks as $chunk) {
                    $chunkResults = $model::with(['connected_groups', 'connected_users', 'connected_communities'])
                        ->whereIn('id', $chunk)
                        ->get();
                    $results = $results->merge($chunkResults);
                }
            } else {
                $results = $model::with(['connected_groups', 'connected_users', 'connected_communities'])
                    ->whereIn('id', $ids)
                    ->get();
            }

            $executionTime = round((microtime(true) - $startTime) * 1000, 2);

            return $results;
        });
    }

    public function getIncrementalConnectionsData(?Request $request = null): array
    {

        $depth = $request ? (int) $request->query('depth', 1) : 1;
        $excludeExisting = $request ? (array) $request->query('exclude_existing', []) : [];

        $nodes = collect();
        $links = collect();

        try {
            $this->load(['connected_groups', 'connected_users', 'connected_communities']);

            $connections = [
                'connected_groups' => $this->connected_groups,
                'connected_users' => $this->connected_users,
                'connected_communities' => $this->connected_communities,
            ];

            foreach ($connections as $relationItems) {
                foreach ($relationItems as $item) {
                    if (in_array($item->id, $excludeExisting)) {
                        continue;
                    }

                    $nodes->push($this->formatNodeOrLink($item));
                    $links->push($this->formatNodeOrLink($item, $this));
                }
            }

        } catch (\Exception $e) {
            return [
                'nodes' => [],
                'links' => [],
                'rootNodeId' => $this->id,
                'rootNodeHash' => $this->hash,
                'rootNodeType' => get_class($this),
                'error' => 'Failed to load connections',
            ];
        }

        return [
            'nodes' => $nodes->unique(fn ($node): string => (string) $node['id'])->values()->all(),
            'links' => $links->unique(fn ($link): string => $link['source'].'-'.$link['target'])->values()->all(),
            'rootNodeId' => $this->id,
            'rootNodeHash' => $this->hash,
            'rootNodeType' => get_class($this),
        ];
    }

    public function clearConnectionsCache(): void
    {
        $cacheKey = "connections:initial:{$this->hash}:".get_class($this);
        Cache::forget($cacheKey);
    }

    private function formatNodeOrLink($entity, $source = null): array
    {
        if (is_null($source)) {
            return [
                'id' => $entity->id,
                'type' => get_class($entity),
                'name' => $entity->name,
                'photo' => $entity->hero_img_url,
                'hash' => $entity->hash,
            ];
        }

        return [
            'source' => $source->id,
            'target' => $entity->id,
        ];
    }
}
