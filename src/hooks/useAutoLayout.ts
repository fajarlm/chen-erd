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

    // 1. Layout the Backbone: Entities & Relationships with generous spacing
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'TB',
      nodesep: 260,
      ranksep: 280,
      marginx: 100,
      marginy: 100,
    });

    entityNodes.forEach((node) => {
      g.setNode(node.id, { width: 170, height: 70 });
    });

    relationshipNodes.forEach((node) => {
      g.setNode(node.id, { width: 140, height: 90 });
    });

    // Edges between relationships and entities
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
          x: Math.round(pos.x - 85),
          y: Math.round(pos.y - 35),
        });
      }
    });

    relationshipNodes.forEach((node) => {
      const pos = g.node(node.id);
      if (pos) {
        updatedRelationshipMap.set(node.id, {
          x: Math.round(pos.x - 60),
          y: Math.round(pos.y - 37),
        });
      }
    });

    // 2. Position Attributes away from connecting relationships so lines NEVER cross!
    // Map each parent to its attributes
    const parentToAttrs = new Map<string, Node[]>();
    attributeNodes.forEach((attrNode) => {
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

    parentToAttrs.forEach((attrs, parentId) => {
      const isEntity = updatedEntityMap.has(parentId);
      const parentPos = updatedEntityMap.get(parentId) || updatedRelationshipMap.get(parentId);
      if (!parentPos) return;

      const total = attrs.length;

      if (isEntity) {
        // Find positions of relationships connected to this entity
        const connectedRelPositions: { x: number; y: number }[] = [];
        edges.forEach((edge) => {
          if (edge.source === parentId && updatedRelationshipMap.has(edge.target)) {
            connectedRelPositions.push(updatedRelationshipMap.get(edge.target)!);
          } else if (edge.target === parentId && updatedRelationshipMap.has(edge.source)) {
            connectedRelPositions.push(updatedRelationshipMap.get(edge.source)!);
          }
        });

        // Determine which side has relationships
        // If relationships are predominantly ABOVE (y < parentPos.y), fan attributes to BOTTOM/SIDES
        const hasRelAbove = connectedRelPositions.some(p => p.y < parentPos.y);
        const hasRelBelow = connectedRelPositions.some(p => p.y > parentPos.y);

        let startAngle: number;
        let endAngle: number;

        if (hasRelAbove && !hasRelBelow) {
          // Fan downwards: from Math.PI * 0.1 to Math.PI * 0.9 (bottom arc)
          startAngle = Math.PI * 0.15;
          endAngle = Math.PI * 0.85;
        } else if (hasRelBelow && !hasRelAbove) {
          // Fan upwards: from -Math.PI * 0.85 to -Math.PI * 0.15 (top arc)
          startAngle = -Math.PI * 0.85;
          endAngle = -Math.PI * 0.15;
        } else {
          // Fan evenly around but avoid the exact top corridor
          startAngle = Math.PI * 0.2;
          endAngle = Math.PI * 1.8;
        }

        const rx = Math.max(150, total * 25);
        const ry = Math.max(110, total * 18);

        attrs.forEach((attr, idx) => {
          let angle: number;
          if (total === 1) {
            angle = (startAngle + endAngle) / 2;
          } else {
            angle = startAngle + ((endAngle - startAngle) * idx) / (total - 1);
          }

          const attrX = Math.round(parentPos.x + 85 + rx * Math.cos(angle) - 52);
          const attrY = Math.round(parentPos.y + 35 + ry * Math.sin(angle) - 23);

          updatedAttrMap.set(attr.id, { x: attrX, y: attrY });
        });
      } else {
        // It's a Relationship node with associative attributes (e.g., quantity, unit_price)
        // Position them vertically or horizontally offset from the diamond, away from entities
        const rx = 140;
        const ry = 80;

        attrs.forEach((attr, idx) => {
          // Offset to top or sides
          const angle = -Math.PI / 2 + (idx % 2 === 0 ? -0.5 : 0.5) * (Math.floor(idx / 2) + 1);
          const attrX = Math.round(parentPos.x + 60 + rx * Math.cos(angle) - 52);
          const attrY = Math.round(parentPos.y + 37 + ry * Math.sin(angle) - 23);

          updatedAttrMap.set(attr.id, { x: attrX, y: attrY });
        });
      }
    });

    // 3. Assemble all nodes with updated coordinates
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
