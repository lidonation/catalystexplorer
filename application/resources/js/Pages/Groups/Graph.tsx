import { CatalystConnectionsEnum } from '@/enums/catalyst-connections-enums';
import { PageProps } from '@/types';
import axios from 'axios';
import { useState } from 'react';
import GraphComponent, { Node } from './Partials/CatalystConnectionsGraph';
import ConnectionData = App.DataTransferObjects.ConnectionData;

interface GraphProps
    extends PageProps<{
        graphData: ConnectionData;
        rootGroupId: string;
        rootGroupHash: string;
        rootProfileId?: string;
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

const Graph: React.FC<GraphProps> = ({
    graphData,
    rootGroupId,
    rootGroupHash,
    rootProfileId,
}) => {
    const [selectedProfileIds] = useState<Set<string>>(new Set());
    const [selectedGroupIds] = useState<Set<string>>(new Set());
    const [currentData, setCurrentData] = useState<ConnectionData>(graphData);

    const handleNodeClick = async (node: Node) => {
        try {
            const id = node.id;
            const targetSet =
                node.type === CatalystConnectionsEnum.GROUP
                    ? selectedGroupIds
                    : selectedProfileIds;

            if (targetSet.has(id)) {
                targetSet.delete(id);
            } else {
                targetSet.add(id);
            }

            const response = await axios.get<ConnectionData>(
                route('api.connections', { hash: rootGroupHash }),
                {
                    params: {
                        profileIds: Array.from(selectedProfileIds),
                        groupIds: Array.from(selectedGroupIds),
                    },
                },
            );

            console.log('node clicked');

            setCurrentData(response.data);
        } catch (error) {
            console.error('Failed to update node:', error);
        }
    };

    return (
        <div className="bg-background max-w-lg">
            <GraphComponent
                data={currentData}
                nodeSize={NODE_SIZES}
                forces={FORCE_CONFIG}
                colors={COLORS}
                onNodeClick={handleNodeClick}
                rootGroupId={rootGroupId}
            />
        </div>
    );
};

export default Graph;
