import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export type Node = {
    id: string;
    type: 'group' | 'profile';
    name: string;
    photo?: string;
    val?: number;
    x?: number;
    y?: number;
};

export type Link = {
    source: string | Node;
    target: string | Node;
};

export type GraphData = {
    nodes: Node[];
    links: Link[];
};

interface GraphComponentProps {
    data: GraphData;
    rootGroupId: string;
    rootProfileId: string;
    nodeSize?: {
        group?: number;
        profile?: { min: number; max: number };
    };
    forces?: {
        linkDistance?: number;
        chargeStrength?: number;
    };
    colors?: {
        node?: string;
        groupNodeBorder?: string;
        link?: string;
        linkHover?: string;
    };
    onNodeHover?: (node: Node | null) => void;
    onNodeClick?: (node: Node) => void;
}

const CatalystConnectionsGraph = ({
    data,
    rootGroupId,
    rootProfileId,
    nodeSize = { group: 50, profile: { min: 5, max: 20 } },
    forces = { linkDistance: 50, chargeStrength: -300 },
    colors = {
        node: '--cx-primary',
        groupNodeBorder: '--success-gradient-color-2',
        link: '--cx-primary',
        linkHover: '--cx-accent',
    },
    onNodeHover,
    onNodeClick,
}: GraphComponentProps) => {
    const fgRef = useRef<any>(null);
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const nodeSizes = useRef<Map<string, number>>(new Map());
    const [focusedNodeId, setFocusedNodeId] = useState(null);

    const loadImages = useCallback(() => {
        const cache = new Map<string, HTMLImageElement>();
        imageCache.current = cache;

        data.nodes.forEach((node) => {
            if (node.photo && !cache.has(node.photo)) {
                const img = new Image();
                img.src = node.photo;
                img.onload = () => cache.set(node.photo!, img);
            }
        });
    }, [data]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    const config = useMemo(
        () => ({
            nodeSize: {
                group: nodeSize?.group ?? 15,
                profile: {
                    min: nodeSize?.profile?.min ?? 5,
                    max: nodeSize?.profile?.max ?? 10,
                },
            },
            forces: {
                linkDistance: forces?.linkDistance ?? 25,
                chargeStrength: forces?.chargeStrength ?? -300,
            },
            colors: {
                node: colors?.node ?? '--cx-primary',
                groupNode: colors?.groupNodeBorder ?? '--success-gradient-color-2',
                link: colors?.link ?? '--cx-primary',
                linkHover: colors?.linkHover ?? '--cx-accent',
            },
        }),
        [nodeSize, forces, colors],
    );

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('link')?.distance(forces.linkDistance);
            fgRef.current
                .d3Force('charge')
                ?.distanceMax(200)
                .strength(forces.chargeStrength);
        }
    }, [forces.linkDistance, forces.chargeStrength]);

    const getColor = useCallback((color: string) => {
        return color.startsWith('--')
            ? getComputedStyle(document.documentElement)
                  .getPropertyValue(color)
                  .trim()
            : color;
    }, []);

    useEffect(() => {
        if (focusedNodeId && fgRef.current && data) {
            const timer = setTimeout(() => {
                const node = data.nodes.find((n) => n.id === focusedNodeId);
                if (node) {
                    const nodePosition = { x: node.x || 0, y: node.y || 0 };
                    fgRef.current.zoom(4, 1000);
                    fgRef.current.centerAt(nodePosition.x, nodePosition.y, 1000);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [data, focusedNodeId]);

    const handleNodeClick = useCallback((node: any) => {
        setFocusedNodeId(node.id);
    }, []);

    const nodeCanvasObject = useCallback(
        (node: any, ctx: CanvasRenderingContext2D) => {
            let radius;
            if (node.type === 'group') {
                radius = config.nodeSize.group;
            } else {
                if (!nodeSizes.current.has(node.id)) {
                    const size =
                        config.nodeSize.profile.min +
                        (config.nodeSize.profile.max -
                            config.nodeSize.profile.min) *
                            Math.random();
                    nodeSizes.current.set(node.id, size);
                }
                radius = nodeSizes.current.get(node.id)!;
            }

            const img = imageCache.current.get(node.photo!);
            if (img) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(
                    img,
                    node.x! - radius,
                    node.y! - radius,
                    radius * 2,
                    radius * 2,
                );
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
                ctx.fillStyle = getColor(config.colors.node);
                ctx.fill();
            }

            if (node.type === 'group') {
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
                ctx.lineWidth = 1;
                ctx.strokeStyle = getColor(config.colors.groupNode);
                ctx.stroke();
            }
        },
        [config, getColor],
    );

    const linkCanvasObject = useCallback(
        (link: any, ctx: CanvasRenderingContext2D) => {
            const sourceNode =
                typeof link.source === 'object'
                    ? link.source
                    : data.nodes.find((n) => n.id === link.source);
            const targetNode =
                typeof link.target === 'object'
                    ? link.target
                    : data.nodes.find((n) => n.id === link.target);

            if (!sourceNode || !targetNode) return;

            const isHovered =
                hoveredNodeId !== null &&
                (sourceNode.id === hoveredNodeId ||
                    targetNode.id === hoveredNodeId);
            const isNodeFocused = [sourceNode.id, targetNode.id].includes(focusedNodeId);

            ctx.strokeStyle = isHovered || isNodeFocused
                ? getColor(config.colors.linkHover)
                : getColor(config.colors.link);

            const lineWidth =
                sourceNode.type === 'group'
                    ? sourceNode.id === rootGroupId
                        ? 1
                        : 0.3
                    : 0.3;

            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(sourceNode.x!, sourceNode.y!);
            ctx.lineTo(targetNode.x!, targetNode.y!);
            ctx.stroke();
        },
        [config.colors, getColor, hoveredNodeId, rootGroupId],
    );

    return (
        <div className="bg-background h-screen w-full">
            <ForceGraph2D
            ref={fgRef}
            graphData={data}
            nodeLabel="name"
            nodeRelSize={4}
            onBackgroundClick={
              ()=>{
                fgRef.current.zoomToFit(400, 0)
                setFocusedNodeId(null)
              }
               
            }
            onNodeClick={(node) => {
                fgRef.current.zoomToFit(400, 0);
                
                if (focusedNodeId !== node.id) {
                    onNodeClick?.(node);
                    handleNodeClick(node);
                } 
            }}
            onNodeHover={(node) => {
                setHoveredNodeId(node?.id || null);
                onNodeHover?.(node || null);
            }}
            nodeCanvasObject={nodeCanvasObject}
            linkCanvasObject={linkCanvasObject}
            />
        </div>
    );
};

export default CatalystConnectionsGraph;
