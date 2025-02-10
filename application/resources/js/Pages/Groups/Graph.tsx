import { PageProps } from '@/types';
import { useEffect, useRef } from 'react';
import ForceGraph from 'react-force-graph-2d';

type Node = {
  id: string;
  type: 'group' | 'profile';
  name: string;
  photo?: string;
  val?: number;
};

type Link = {
  source: string;
  target: string;
};

type GraphData = {
  nodes: Node[];
  links: Link[];
};

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
  graphData: GraphData;
}

const Graph = ({ graphData }: PageProps<IdeascaleProfilesPageProps>) => {
  const fgRef = useRef<any>();
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

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
        nodeCanvasObject={(node, ctx, globalScale) => {
          const radius = Math.cbrt(node.val || 1) * 4;
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
              radius * 2
            );
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.fill();
          }
          
          if (node.type === 'group') {
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
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
