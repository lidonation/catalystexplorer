<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\CatalystProfile;
use App\Models\Community;
use App\Models\Connection;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use Illuminate\Database\Eloquent\Casts\Attribute;
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

        return $this->getInitialConnectionsData($id, $rootNode);
    }

    private function getInitialConnectionsData($id, $rootNode): array
    {
        $cacheKey = "connections:initial:{$rootNode->hash}:".get_class($rootNode);

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($id, $rootNode) {
            $nodes = collect();
            $links = collect();
            $visited = [];

            // Add root node
            $nodes->push($this->formatNodeOrLink($this));
            $visited[] = $this->id;

            $rootConnections = $this->getAllConnectedEntitiesBatched();

            // Process root's connections
            foreach ($rootConnections as $connectionType => $entities) {
                foreach ($entities as $entity) {
                    if (in_array($entity->id, $visited)) {
                        continue;
                    }
                    $visited[] = $entity->id;

                    $nodes->push($this->formatNodeOrLink($entity));
                    $links->push($this->formatNodeOrLink($entity, $this));

                    // Get level 2 connections (depth = 2)
                    $level2Connections = $entity->getAllConnectedEntitiesBatched();

                    foreach ($level2Connections as $l2Type => $l2Entities) {
                        foreach ($l2Entities as $l2Entity) {
                            $nodes->push($this->formatNodeOrLink($l2Entity));
                            $links->push($this->formatNodeOrLink($l2Entity, $entity));
                        }
                    }
                }
            }

            if ($nodes->isEmpty()) {
                $nodes->push($this->formatNodeOrLink($this));
            }

            $uniqueNodes = $nodes->unique(fn ($node): string => (string) $node['id'])->values()->all();
            $uniqueLinks = $links->unique(fn ($link): string => $link['source'].'-'.$link['target'])->values()->all();

            return [
                'nodes' => $uniqueNodes,
                'links' => $uniqueLinks,
                'rootNodeId' => $id,
                'rootNodeHash' => $rootNode->hash,
                'rootNodeType' => get_class($rootNode),
            ];
        });
    }

    public function connections(): MorphMany
    {
        return $this->morphMany(Connection::class, 'previous_model', 'previous_model_type', 'previous_model_id');
    }

    protected function getBatchedConnections(): array
    {
        $entityId = (string) $this->id;
        $entityType = static::class;

        // Single query to get all connections
        $connections = Connection::where(function ($query) use ($entityId, $entityType) {
            $query->where('previous_model_type', $entityType)
                ->where('previous_model_id', $entityId);
        })->orWhere(function ($query) use ($entityId, $entityType) {
            $query->where('next_model_type', $entityType)
                ->where('next_model_id', $entityId);
        })->get();

        // Group by target entity type
        $grouped = [
            IdeascaleProfile::class => ['ids' => [], 'model_class' => IdeascaleProfile::class],
            Group::class => ['ids' => [], 'model_class' => Group::class],
            Community::class => ['ids' => [], 'model_class' => Community::class],
            CatalystProfile::class => ['ids' => [], 'model_class' => CatalystProfile::class],
        ];

        foreach ($connections as $connection) {
            // Determine which side of the connection is NOT this entity
            if (
                $connection->previous_model_type === $entityType &&
                $connection->previous_model_id === $entityId
            ) {
                $targetType = $connection->next_model_type;
                $targetId = $connection->next_model_id;
            } else {
                $targetType = $connection->previous_model_type;
                $targetId = $connection->previous_model_id;
            }

            if (isset($grouped[$targetType])) {
                $grouped[$targetType]['ids'][] = $targetId;
            }
        }

        // Remove duplicates
        foreach ($grouped as $type => $data) {
            $grouped[$type]['ids'] = array_unique($data['ids']);
        }

        return $grouped;
    }

    public function getAllConnectedEntitiesBatched(): array
    {
        $batched = $this->getBatchedConnections();

        $result = [
            'connected_users' => collect(),
            'connected_groups' => collect(),
            'connected_communities' => collect(),
            'connected_catalyst_profiles' => collect(),
        ];

        if (! empty($batched[IdeascaleProfile::class]['ids'])) {
            $result['connected_users'] = IdeascaleProfile::whereIn('id', $batched[IdeascaleProfile::class]['ids'])->get();
        }

        if (! empty($batched[Group::class]['ids'])) {
            $result['connected_groups'] = Group::whereIn('id', $batched[Group::class]['ids'])->get();
        }

        if (! empty($batched[Community::class]['ids'])) {
            $result['connected_communities'] = Community::whereIn('id', $batched[Community::class]['ids'])->get();
        }

        if (! empty($batched[CatalystProfile::class]['ids'])) {
            $result['connected_catalyst_profiles'] = CatalystProfile::whereIn('id', $batched[CatalystProfile::class]['ids'])->get();
        }

        return $result;
    }

    public function getIncrementalConnectionsData(?Request $request = null): array
    {
        $excludeExisting = $request ? (array) $request->query('exclude_existing', []) : [];

        $nodes = collect();
        $links = collect();

        try {

            $connections = $this->getAllConnectedEntitiesBatched();

            foreach ($connections as $connectionType => $entities) {
                foreach ($entities as $item) {
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
