import { CatalystConnectionsEnum } from '@/enums/catalyst-connections-enums';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import CatalystConnectionsGraph, { Node } from './CatalystConnectionsGraph';
import Paragraph from './atoms/Paragraph';
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
    const { t } = useLaravelReactI18n();
    const [selectedProfileIds] = useState<Set<string>>(new Set());
    const [selectedGroupIds] = useState<Set<string>>(new Set());
    const [selectedCommunityIds] = useState<Set<string>>(new Set());
    const [currentData, setCurrentData] = useState<ConnectionData>(graphData);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
    const [loadingNodeName, setLoadingNodeName] = useState<string>('');
    const [showNoConnectionsMessage, setShowNoConnectionsMessage] =
        useState<boolean>(false);
    const [noConnectionsNodeName, setNoConnectionsNodeName] =
        useState<string>('');

    const routeName =
        graphData.rootNodeType == CatalystConnectionsEnum.GROUP
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

        if (targetSet.has(id) || id === currentData.rootNodeId || isLoading) {
            return;
        }

        try {
            setIsLoading(true);
            setLoadingNodeId(id);
            setLoadingNodeName(node.name || t('graph.unknownNode'));
            setShowNoConnectionsMessage(false);
            targetSet.add(id);

            const nodeIdentifier = node.id;
            if (!nodeIdentifier) {
                throw new Error('Node has no hash or id');
            }

            const incrementalResponse = await axios
                .get<ConnectionData>(
                    route(
                        routeName.replace(
                            '.connections',
                            '.incremental-connections',
                        ),
                        { hash: nodeIdentifier },
                    ),
                    {
                        params: {
                            hash: nodeIdentifier,
                            depth: 1,
                            exclude_existing: Array.from(
                                new Set([
                                    ...currentData.nodes.map((n) => n.id),
                                    ...Array.from(selectedProfileIds),
                                    ...Array.from(selectedGroupIds),
                                    ...Array.from(selectedCommunityIds),
                                ]),
                            ),
                        },
                    },
                )
                .catch((axiosError) => {
                    console.error('Axios request failed:', axiosError);
                    throw axiosError;
                });

            if (
                !incrementalResponse.data ||
                !Array.isArray(incrementalResponse.data.nodes) ||
                !Array.isArray(incrementalResponse.data.links)
            ) {
                return;
            }

            const newNodes = incrementalResponse.data.nodes.filter(
                (newNode) =>
                    !currentData.nodes.some(
                        (existingNode) => existingNode.id === newNode.id,
                    ),
            );

            const newLinks = incrementalResponse.data.links.filter(
                (newLink) =>
                    !currentData.links.some(
                        (existingLink) =>
                            existingLink.source === newLink.source &&
                            existingLink.target === newLink.target,
                    ),
            );

            if (newNodes.length === 0 && newLinks.length === 0) {
                setNoConnectionsNodeName(node.name || t('graph.unknownNode'));
                setShowNoConnectionsMessage(true);
                setTimeout(() => {
                    setShowNoConnectionsMessage(false);
                }, 3000);
                return;
            }

            const mergedData: ConnectionData = {
                ...currentData,
                nodes: [...currentData.nodes, ...newNodes],
                links: [...currentData.links, ...newLinks],
            };

            setCurrentData(mergedData);
        } catch (error: any) {
            targetSet.delete(id);

            if (error.response) {
                /*  console.error('Axios error response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                }); */
            } else if (error.request) {
                console.error('Axios error request:', error.request);
            } else {
                // console.error('Axios error:', error.message);
            }
        } finally {
            setIsLoading(false);
            setLoadingNodeId(null);
            setLoadingNodeName('');
        }
    };

    return (
        <div className="bg-background relative h-full w-full">
            {isLoading && (
                <div className="bg-background absolute top-4 right-4 z-10 rounded-lg bg-white/90 px-3 py-2 shadow-md">
                    <div className="flex items-center space-x-2">
                        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                        <Paragraph className="text-content text-sm">
                            {t('graph.loadingConnections', {
                                nodeName: loadingNodeName,
                            })}
                        </Paragraph>
                    </div>
                </div>
            )}
            {showNoConnectionsMessage && (
                <div className="bg-warning/20 border-warning absolute top-4 right-4 z-10 rounded-lg border px-3 py-2 shadow-md">
                    <div className="flex items-center space-x-2">
                        <svg
                            className="text-warning/[0.5] h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <Paragraph className="text-warning text-sm">
                            {t('graph.noAdditionalConnections', {
                                nodeName: noConnectionsNodeName,
                            })}
                        </Paragraph>
                    </div>
                </div>
            )}
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
