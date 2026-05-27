import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import dagre from 'dagre'; // You'll need to install this: npm install dagre @types/dagre

export const useAutoLayout = () => {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow();

  const applyAutoLayout = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 150 });

    // Add nodes to dagre graph
    nodes.forEach((node) => {
      g.setNode(node.id, { width: 200, height: 100 });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(g);

    // Apply new positions
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100, // Center the node
          y: nodeWithPosition.y - 50,
        },
      };
    });

    setNodes(layoutedNodes);
    setTimeout(() => fitView({ duration: 500 }), 0);
  }, [getNodes, getEdges, setNodes, fitView]);

  return { applyAutoLayout };
};