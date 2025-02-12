import { PageProps } from '@/types';
import GraphComponent from './Partials/CatalystConnectionsGraph';
import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

export interface Node {
    id: string;
    type: 'group' | 'profile';
    name: string;
    photo?: string;
    val?: number;
    x?: number;
    y?: number;
}

export interface Link {
    source: string | Node;
    target: string | Node;
}

export interface GraphData {
    nodes: Node[];
    links: Link[];
}

interface GraphProps extends PageProps<{
    graphData: GraphData;
    rootGroupId: string;
    rootProfileId: string;
}> {}


const NODE_SIZES = {
    group: 15,
    profile: { min: 5, max: 10 },
} as const;

const FORCE_CONFIG = {
    linkDistance: 25,
    chargeStrength: -500,
} as const;

const COLORS = {
    node: '--cx-primary',
    groupNodeBorder: '--success-gradient-color-2',
    link: '--cx-primary',
} as const;

const Graph: React.FC<GraphProps> = ({ graphData, rootGroupId, rootProfileId }) => {
    const [selectedProfileIds] = useState<Set<string>>(new Set());
    const [selectedGroupIds] = useState<Set<string>>(new Set());

    const currentUrl = useMemo(() => window.location.href, []);

    const handleNodeClick = useCallback(async (node: Node) => {
        try {
            const id = node.id.replace(`${node.type}-`, '');
            const targetSet = node.type === 'group' ? selectedGroupIds : selectedProfileIds;

            if (targetSet.has(id)) {
                targetSet.delete(id);
            } else {
                targetSet.add(id);
            }

            await router.visit(currentUrl, {
                method: 'get',
                data: {
                    profileIds: Array.from(selectedProfileIds),
                    groupIds: Array.from(selectedGroupIds),
                },
                preserveState: true,
            });
        } catch (error) {
            console.error('Failed to update node:', error);
        }
    }, [currentUrl, selectedProfileIds, selectedGroupIds]);

    return (
        <div className="bg-background w-full">
            <GraphComponent
                data={graphData}
                nodeSize={NODE_SIZES}
                forces={FORCE_CONFIG}
                colors={COLORS}
                onNodeClick={handleNodeClick}
                rootGroupId={rootGroupId}
                rootProfileId={rootProfileId}
            />
        </div>
    );
};

export default Graph;
