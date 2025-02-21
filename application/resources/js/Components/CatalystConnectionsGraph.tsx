import { CatalystConnectionsEnum } from '@/enums/catalyst-connections-enums';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ConnectionData = App.DataTransferObjects.ConnectionData;

export type Node = {
    id: string;
    type: string;
    name: string;
    photo?: string;
    val?: number;
    x?: number;
    y?: number;
};

interface GraphComponentProps {
    data: ConnectionData;
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
    nodeSize = { group: 50, profile: { min: 5, max: 20 } },
    forces = { linkDistance: 100, chargeStrength: -500 },
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
    const containerRef = useRef<HTMLDivElement>(null);
    const nodeSizes = useRef<Map<string, number>>(new Map());
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(
        data.rootNodeId,
    );
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

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
                groupNode:
                    colors?.groupNodeBorder ?? '--success-gradient-color-2',
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
                ?.distanceMax(1000)
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
                    fgRef.current.zoom(1, 1000);
                    fgRef.current.centerAt(
                        nodePosition.x,
                        nodePosition.y,
                        1000,
                    );
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [data]);

    const handleNodeClick = useCallback((node: any) => {
        setFocusedNodeId(node.id);
    }, []);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        updateSize();

        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const nodeCanvasObject = useCallback(
        (node: any, ctx: CanvasRenderingContext2D) => {
            let radius;
            if (
                node.type === CatalystConnectionsEnum.GROUP ||
                node.type === CatalystConnectionsEnum.COMMUNITY
            ) {
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
            ctx.save();
    
            if (
                node.type === CatalystConnectionsEnum.GROUP ||
                node.type === CatalystConnectionsEnum.COMMUNITY
            ) {
                const size = radius;
                const angleStep = (Math.PI * 2) / 8;
    
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = angleStep * i;
                    const x = node.x! + size * Math.cos(angle);
                    const y = node.y! + size * Math.sin(angle);
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
    
                if (img) {
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
                    ctx.fillStyle = getColor(config.colors.node);
                    ctx.fill();
                }
    
                ctx.lineWidth = 1;
                ctx.strokeStyle = getColor(config.colors.groupNode);
                ctx.stroke();
            } else {
                if (img) {
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
            }
    
            if (node.id === focusedNodeId) {
                const label = node.name;
                const fontSize = 12;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
    
                const textWidth = ctx.measureText(label).width;
                const padding = 5;
                const boxWidth = textWidth + padding * 2;
                const boxHeight = fontSize + padding * 2;
                const margin = 5;

                // Try different positions in this order: bottom, top, right, left
                const positions = [
                    { x: node.x!, y: node.y! + radius + margin }, // bottom
                    { x: node.x!, y: node.y! - radius - boxHeight - margin }, // top
                    { x: node.x! + radius + margin + boxWidth/2, y: node.y! - boxHeight / 2 }, // right
                    { x: node.x! - radius - boxWidth/2 - margin/4, y: node.y! - boxHeight / 2 }, // left // left
                ];

                let bestPosition = positions[0];
                let minOverlap = Infinity;

                for (const pos of positions) {
                    const labelBox = {
                        x: pos.x - boxWidth / 2,
                        y: pos.y,
                        width: boxWidth,
                        height: boxHeight,
                    };

                    let totalOverlap = 0;
                    for (const otherNode of data.nodes) {
                        if (otherNode.id === node.id) continue;
                        const otherRadius = nodeSizes.current.get(otherNode.id) || config.nodeSize.profile.min;
                        const distance = Math.sqrt(
                            Math.pow(pos.x - otherNode.x!, 2) + 
                            Math.pow(pos.y - otherNode.y!, 2)
                        );
                        if (distance < otherRadius + boxHeight) {
                            totalOverlap += 1;
                        }
                    }

                    if (totalOverlap < minOverlap + boxHeight) {
                        minOverlap = totalOverlap;
                        bestPosition = pos;
                    }

                    if (totalOverlap === 0) break; // Found perfect position
                }

                const x = bestPosition.x - boxWidth / 2;
                const y = bestPosition.y;

                const borderRadius = 8;
                ctx.fillStyle = getColor('--cx-tooltip-background');
                ctx.beginPath();
                ctx.moveTo(x + borderRadius, y);
                ctx.lineTo(x + boxWidth - borderRadius, y);
                ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + borderRadius);
                ctx.lineTo(x + boxWidth, y + boxHeight - borderRadius);
                ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - borderRadius, y + boxHeight);
                ctx.lineTo(x + borderRadius, y + boxHeight);
                ctx.quadraticCurveTo(x, y + boxHeight, x, y + borderRadius);
                ctx.lineTo(x, y + borderRadius);
                ctx.quadraticCurveTo(x, y, x + borderRadius, y);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = 'white';
                ctx.fillText(label, bestPosition.x, y + padding);
            }
        },
        [config, getColor, focusedNodeId, data],
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
            const isNodeFocused = [sourceNode.id, targetNode.id].includes(
                focusedNodeId,
            );

            ctx.strokeStyle = getColor(config.colors.link);

            const lineWidth = isHovered || isNodeFocused ? 1.5 : 0.3;

            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(sourceNode.x!, sourceNode.y!);
            ctx.lineTo(targetNode.x!, targetNode.y!);
            ctx.stroke();
        },
        [
            config.colors,
            getColor,
            hoveredNodeId,
            focusedNodeId,
            data.rootNodeId,
        ],
    );

    return (
        <div className="bg-background w-full" ref={containerRef}>
            <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                ref={fgRef}
                graphData={data}
                nodeLabel="name"
                nodeRelSize={4}
                onBackgroundClick={() => {
                    /* fgRef.current.zoomToFit(100, 0); */
                    setFocusedNodeId(null);
                }}
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
