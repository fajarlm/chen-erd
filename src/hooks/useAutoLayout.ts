import { useCallback } from 'react';
import { useReactFlow, type Node, type Edge } from 'reactflow';
import dagre from 'dagre';

export const useAutoLayout = () => {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow();

  const applyAutoLayout = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    if (nodes.length === 0) return;

    // Separate entity, relationship, and attribute nodes
    const entityNodes = nodes.filter(n => n.type === 'entity');
    const relationshipNodes = nodes.filter(n => n.type === 'relationship');
    const attributeNodes = nodes.filter(n => n.type === 'attribute');

    // 1. Layout the Backbone: Entities & Relationships
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'TB',
      nodesep: 220,
      ranksep: 240,
      marginx: 80,
      marginy: 80,
    });

    entityNodes.forEach((node) => {
      g.setNode(node.id, { width: 180, height: 80 });
    });

    relationshipNodes.forEach((node) => {
      g.setNode(node.id, { width: 140, height: 140 });
    });

    // Only add edges between relationships and entities into dagre
    edges.forEach((edge) => {
      const isRelToEntity = 
        (relationshipNodes.some(r => r.id === edge.source) && entityNodes.some(e => e.id === edge.target)) ||
        (entityNodes.some(e => e.id === edge.source) && relationshipNodes.some(r => r.id === edge.target));

      if (isRelToEntity) {
        g.setEdge(edge.source, edge.target);
      }
    });

    dagre.layout(g);

    // Map new positions for entities and relationships
    const updatedEntityMap = new Map<string, { x: number; y: number }>();
    const updatedRelationshipMap = new Map<string, { x: number; y: number }>();

    entityNodes.forEach((node) => {
      const pos = g.node(node.id);
      if (pos) {
        updatedEntityMap.set(node.id, {
          x: Math.round(pos.x - 90),
          y: Math.round(pos.y - 40),
        });
      }
    });

    relationshipNodes.forEach((node) => {
      const pos = g.node(node.id);
      if (pos) {
        updatedRelationshipMap.set(node.id, {
          x: Math.round(pos.x - 45),
          y: Math.round(pos.y - 45),
        });
      }
    });

    // 2. Position Attributes around their respective Entity or Relationship
    // Find attribute-to-parent mappings via edges
    const parentToAttrs = new Map<string, Node[]>();
    attributeNodes.forEach((attrNode) => {
      // Find edge connecting this attribute to an entity or relationship
      const connectingEdge = edges.find(
        (e) => e.target === attrNode.id || e.source === attrNode.id
      );

      if (connectingEdge) {
        const parentId = connectingEdge.target === attrNode.id ? connectingEdge.source : connectingEdge.target;
        const current = parentToAttrs.get(parentId) || [];
        current.push(attrNode);
        parentToAttrs.set(parentId, current);
      }
    });

    const updatedAttrMap = new Map<string, { x: number; y: number }>();

    // Position entity attributes radially around entity
    parentToAttrs.forEach((attrs, parentId) => {
      const parentPos = updatedEntityMap.get(parentId) || updatedRelationshipMap.get(parentId);
      if (!parentPos) return;

      const total = attrs.length;
      // Elliptical radius: wider horizontally because attributes are capsules
      const rx = Math.max(160, total * 24);
      const ry = Math.max(120, total * 18);

      attrs.forEach((attr, idx) => {
        // Distribute angles starting from top-left, going around
        const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
        const attrX = Math.round(parentPos.x + 85 + rx * Math.cos(angle) - 50);
        const attrY = Math.round(parentPos.y + 35 + ry * Math.sin(angle) - 20);

        updatedAttrMap.set(attr.id, { x: attrX, y: attrY });
      });
    });

    // 3. Assemble all updated nodes
    const layoutedNodes: Node[] = nodes.map((node) => {
      if (node.type === 'entity') {
        const pos = updatedEntityMap.get(node.id);
        return pos ? { ...node, position: pos } : node;
      }
      if (node.type === 'relationship') {
        const pos = updatedRelationshipMap.get(node.id);
        return pos ? { ...node, position: pos } : node;
      }
      if (node.type === 'attribute') {
        const pos = updatedAttrMap.get(node.id);
        return pos ? { ...node, position: pos } : node;
      }
      return node;
    });

    setNodes(layoutedNodes);
    setTimeout(() => fitView({ duration: 500, padding: 0.2 }), 60);
  }, [getNodes, getEdges, setNodes, fitView]);

  return { applyAutoLayout };
};
