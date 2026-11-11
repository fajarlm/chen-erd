import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from 'reactflow';
import type {
  Node,
  Edge,
  Connection,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import EntityNode from './EntityNode';
import AttributeNode from './AttributeNode';
import RelationshipNode from './RelationshipNode';
import CustomEdge from './CustomEdge';
import type { ChenDiagram as ChenDiagramType } from '../../types';
import { useAutoLayout } from '../../hooks/useAutoLayout';

const nodeTypes: NodeTypes = {
  entity: EntityNode,
  attribute: AttributeNode,
  relationship: RelationshipNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

interface ChenDiagramProps {
  diagram: ChenDiagramType | null;
  onNodeSelect?: (node: Node | null) => void;
  onUpdate?: (diagram: ChenDiagramType) => void;
  showGrid?: boolean;
  showMinimap?: boolean;
}

const ChenDiagram: React.FC<ChenDiagramProps> = ({ 
  diagram, 
  onNodeSelect,
  showGrid = true,
  showMinimap = true,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { applyAutoLayout } = useAutoLayout();
  const { fitView } = useReactFlow();

  // Convert Chen diagram to React Flow nodes and edges
  useEffect(() => {
    if (!diagram || (diagram.entities.length === 0 && diagram.relationships.length === 0)) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // 1. Create entity nodes and their attribute nodes
    diagram.entities.forEach(entity => {
      newNodes.push({
        id: entity.id,
        type: 'entity',
        position: entity.position || { x: 0, y: 0 },
        data: {
          label: entity.name,
          attributes: entity.attributes,
          isWeakEntity: entity.isWeakEntity,
        },
      });

      // Position attributes around entity in an elliptical halo
      const totalAttrs = entity.attributes.length;
      const rx = Math.max(160, totalAttrs * 22);
      const ry = Math.max(120, totalAttrs * 16);

      entity.attributes.forEach((attr, index) => {
        const attrId = `${entity.id}-attr-${index}`;
        const angle = (2 * Math.PI * index) / totalAttrs - Math.PI / 2;
        const attrX = Math.round(entity.position.x + 85 + rx * Math.cos(angle) - 50);
        const attrY = Math.round(entity.position.y + 35 + ry * Math.sin(angle) - 20);

        newNodes.push({
          id: attrId,
          type: 'attribute',
          position: { x: attrX, y: attrY },
          data: {
            label: attr.name,
            isPrimaryKey: attr.isPrimaryKey,
            isMultivalued: attr.isMultivalued,
            isDerived: attr.isDerived,
          },
        });

        // Line from entity to attribute
        newEdges.push({
          id: `edge-${entity.id}-${attrId}`,
          source: entity.id,
          target: attrId,
          type: 'custom',
          data: {
            isPrimaryKey: attr.isPrimaryKey,
          },
          style: {
            stroke: attr.isPrimaryKey ? '#10b981' : '#94a3b8',
            strokeWidth: attr.isPrimaryKey ? 1.8 : 1.2,
          },
        });
      });
    });

    // 2. Create relationship nodes
    diagram.relationships.forEach((rel) => {
      newNodes.push({
        id: rel.id,
        type: 'relationship',
        position: rel.position || { x: 300, y: 300 },
        data: {
          label: rel.name,
          cardinalities: rel.cardinalities,
          isIdentifying: rel.isIdentifying,
          attributes: rel.attributes,
        },
      });

      // Create edges between relationship and entities
      rel.entities.forEach((entityId) => {
        const cardinality = rel.cardinalities[entityId] || '1';
        const edgeId = `edge-${rel.id}-${entityId}`;
        
        newEdges.push({
          id: edgeId,
          source: rel.id,
          target: entityId,
          type: 'custom',
          data: {
            cardinality: cardinality,
          },
          style: {
            stroke: '#8b5cf6',
            strokeWidth: 2,
          },
        });
      });

      // Relationship attributes (if any)
      if (rel.attributes) {
        rel.attributes.forEach((attr, attrIndex) => {
          const attrId = `${rel.id}-attr-${attrIndex}`;
          newNodes.push({
            id: attrId,
            type: 'attribute',
            position: {
              x: rel.position.x + 130,
              y: rel.position.y + attrIndex * 50,
            },
            data: {
              label: attr.name,
              isPrimaryKey: attr.isPrimaryKey,
            },
          });

          newEdges.push({
            id: `edge-${rel.id}-${attrId}`,
            source: rel.id,
            target: attrId,
            type: 'custom',
            style: {
              stroke: '#a855f7',
              strokeWidth: 1.5,
              strokeDasharray: '4,4',
            },
          });
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);

    // Initial tidy layout & fit view
    setTimeout(() => {
      applyAutoLayout();
      fitView({ duration: 500, padding: 0.2 });
    }, 50);
  }, [diagram, setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full overflow-hidden flex flex-1 relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeSelect?.(node)}
        onPaneClick={() => onNodeSelect?.(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="w-full h-full bg-[#f8fafc]"
        minZoom={0.1}
        maxZoom={3}
      >
        {showGrid && (
          <Background
            gap={24}
            size={1.2}
            color="#cbd5e1"
            variant={BackgroundVariant.Dots}
          />
        )}
        <Controls 
          showInteractive={false} 
          position="bottom-left"
          className="!mb-6 !ml-6 !border !border-zinc-200/80 !rounded-xl !overflow-hidden !shadow-md"
        />
        {showMinimap && (
          <MiniMap
            position="bottom-right"
            nodeColor={(node) => {
              switch (node.type) {
                case 'entity':
                  return '#2563eb';
                case 'attribute':
                  return '#10b981';
                case 'relationship':
                  return '#7c3aed';
                default:
                  return '#94a3b8';
              }
            }}
            maskColor="rgba(241, 245, 249, 0.75)"
            className="!mb-6 !mr-6 !rounded-2xl !overflow-hidden !border !border-zinc-200/80 !shadow-lg bg-white"
          />
        )}
      </ReactFlow>
    </motion.div>
  );
};

export default ChenDiagram;
