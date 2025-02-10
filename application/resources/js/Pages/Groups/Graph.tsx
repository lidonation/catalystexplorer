import { useState, useRef, useEffect } from 'react';
import ForceGraph, { NodeObject } from 'react-force-graph-2d';

interface CustomNode extends NodeObject {
  id: string;
  type: 'group' | 'profile';
  name: string;
  photo?: string;
  val?: number;
}


interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: CustomNode[];
  links: Link[];
}

interface GraphProps {
  graphData: GraphData;
}

const Graph = ({ graphData }: GraphProps) => {
  const fgRef = useRef<any>();
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<CustomNode | null>(null);

  useEffect(() => {
    const cache = new Map<string, HTMLImageElement>();
    imageCache.current = cache;

    graphData.nodes.forEach((node) => {
      if (node.photo && !cache.has(node.photo)) {
        const img = new Image();
        img.src = node.photo;
        img.onload = () => {
          cache.set(node.photo!, img);
          fgRef.current?.refresh();
        };
      }
    });
  }, [graphData]);

  const groupNodeVal = 27;
  const minProfileNodeVal = 5;
  const maxProfileNodeVal = 20;

  const getRandomSize = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const updatedGraphData = {
    ...graphData,
    nodes: graphData.nodes.map((node) => ({
      ...node,
      val: node.type === 'group' ? groupNodeVal : getRandomSize(minProfileNodeVal, maxProfileNodeVal),
    })),
  };

  useEffect(() => {
    fgRef.current.d3Force('link').distance(50);
  }, []);

  return (
    <div className="h-screen w-full bg-gray-100">
      <ForceGraph
        ref={fgRef}
        graphData={updatedGraphData}
        nodeLabel="name"
        nodeRelSize={4}
        onNodeHover={(node) => {
          setHoveredNode(node as CustomNode);
        }}
        linkWidth={(link) => {
          return link.source === hoveredNode || link.target === hoveredNode ? 2 : 1;
        }}
        linkColor={(link) => {
          return link.source === hoveredNode || link.target === hoveredNode
            ? 'var(--cx-primary)' // Tailwind CSS variable
            : 'var(--cx-secondary)'; // Tailwind CSS variable
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const customNode = node as CustomNode;
          const radius = Math.cbrt(customNode.val || 1) * 4;
          const img = imageCache.current.get(customNode.photo!);

          if (img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(customNode.x!, customNode.y!, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(
              img,
              customNode.x! - radius,
              customNode.y! - radius,
              radius * 2,
              radius * 2
            );
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(customNode.x!, customNode.y!, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.fill();
          }

          if (customNode.type === 'group') {
            ctx.beginPath();
            ctx.arc(customNode.x!, customNode.y!, radius, 0, 2 * Math.PI);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'green';
            ctx.stroke();
          }
        }}
      />
    </div>
  );
};

export default Graph;
