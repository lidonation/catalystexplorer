import { CatalystConnectionParamsEnum, CatalystConnectionsEnum } from '@/enums/catalyst-connections-enums';
import axios from 'axios';
import { useState } from 'react';
import CatalystConnectionsGraph, { Node } from './CatalystConnectionsGraph';
import ConnectionData = App.DataTransferObjects.ConnectionData;

interface GraphProps {
    graphData: ConnectionData;
}

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

const Graph: React.FC<GraphProps> = ({ graphData }) => {
    const [selectedProfileIds] = useState<Set<string>>(new Set());
    const [selectedGroupIds] = useState<Set<string>>(new Set());
    const [selectedCommunityIds] = useState<Set<string>>(new Set());
    const [currentData, setCurrentData] = useState<ConnectionData>(graphData);

    const routeName = graphData.rootNodeType == CatalystConnectionsEnum.GROUP 
        ? 'api.groups.connections' 
        : graphData.rootNodeType == CatalystConnectionsEnum.COMMUNITY
            ? 'api.communities.connections'
            : 'api.ideascaleProfiles.connections';

    const handleNodeClick = async (node: Node) => {
        const id = node.id;
        let targetSet: Set<string>;

        switch (node.type) {
            case CatalystConnectionsEnum.GROUP:
                targetSet = selectedGroupIds;
                break;
            case CatalystConnectionsEnum.COMMUNITY:
                targetSet = selectedCommunityIds;
                break;
            default:
                targetSet = selectedProfileIds;
        }

        if (targetSet.has(id) || id === currentData.rootNodeId) {
            return; // Exit early if the ID is already selected
        }

        try {
            targetSet.add(id);

            const response = await axios.get<ConnectionData>(
                route(routeName, { hash: graphData.rootNodeHash }),
                {
                    params: {
                        [CatalystConnectionParamsEnum.IDEASCALEPROFILE]: Array.from(selectedProfileIds),
                        [CatalystConnectionParamsEnum.GROUP]: Array.from(selectedGroupIds),
                        [CatalystConnectionParamsEnum.COMMUNITY]: Array.from(selectedCommunityIds),
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
        <div className="bg-background w-full">
            <CatalystConnectionsGraph
                data={currentData}
                nodeSize={NODE_SIZES}
                forces={FORCE_CONFIG}
                colors={COLORS}
                onNodeClick={handleNodeClick}
            />
        </div>
    );
};

export default Graph;
