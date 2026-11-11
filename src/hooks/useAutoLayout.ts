import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import dagre from 'dagre';

export const useAutoLayout = () => {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow();

  const applyAutoLayout = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    if (nodes.length === 0) return;

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ 
      rankdir: 'TB', 
      nodesep: 90, 
      ranksep: 130,
      marginx: 50,
      marginy: 50
    });

    nodes.forEach((node) => {
      let width = 160;
      let height = 60;
      if (node.type === 'attribute') {
        width = 110;
        height = 50;
      } else if (node.type === 'relationship') {
        width = 110;
        height = 110;
      }
      g.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
      const pos = g.node(node.id);
      const halfWidth = node.type === 'relationship' ? 55 : (node.type === 'attribute' ? 55 : 80);
      const halfHeight = node.type === 'relationship' ? 55 : (node.type === 'attribute' ? 25 : 30);
      
      return {
        ...node,
        position: {
          x: pos.x - halfWidth,
          y: pos.y - halfHeight,
        },
      };
    });

    setNodes(layoutedNodes);
    setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 50);
  }, [getNodes, getEdges, setNodes, fitView]);

  return { applyAutoLayout };
};
