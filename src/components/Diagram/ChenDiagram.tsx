import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
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
}

const ChenDiagram: React.FC<ChenDiagramProps> = ({ 
  diagram, 
  onNodeSelect,
  showGrid = true 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { applyAutoLayout } = useAutoLayout();

  // Convert Chen diagram to React Flow nodes and edges
  useEffect(() => {
    if (!diagram) {
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

      // Position attributes around entity in an offset circle/star
      const totalAttrs = entity.attributes.length;
      const radius = Math.max(140, totalAttrs * 20);

      entity.attributes.forEach((attr, index) => {
        const attrId = `${entity.id}-attr-${index}`;
        // Spread angles evenly (avoiding strictly 0 or PI which align with relationships)
        const angle = (2 * Math.PI * index) / totalAttrs - Math.PI / 2;
        const attrX = Math.round(entity.position.x + radius * Math.cos(angle));
        const attrY = Math.round(entity.position.y + radius * Math.sin(angle));

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

        // Undirected simple line from entity to attribute in Chen ERD
        newEdges.push({
          id: `edge-${entity.id}-${attrId}`,
          source: entity.id,
          target: attrId,
          type: 'custom',
          data: {
            isPrimaryKey: attr.isPrimaryKey,
          },
          style: {
            stroke: attr.isPrimaryKey ? '#059669' : '#71717a',
            strokeWidth: attr.isPrimaryKey ? 2 : 1.5,
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
            stroke: '#7c3aed',
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
              y: rel.position.y + attrIndex * 60,
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
              stroke: '#7c3aed',
              strokeWidth: 1.5,
              strokeDasharray: '4,4',
            },
          });
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [diagram, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full overflow-hidden flex flex-1"
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
        className="w-full h-full bg-[#fafafa]"
        minZoom={0.1}
        maxZoom={3}
      >
        {showGrid && <Background gap={20} size={1.5} color="#e4e4e7" />}
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'entity':
                return '#2563eb';
              case 'attribute':
                return '#10b981';
              case 'relationship':
                return '#7c3aed';
              default:
                return '#a1a1aa';
            }
          }}
          maskColor="rgba(240, 242, 245, 0.7)"
          className="bg-white border border-zinc-200"
        />
        <Panel position="top-right">
          <button
            onClick={applyAutoLayout}
            className="bg-zinc-900/90 hover:bg-zinc-900 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 backdrop-blur-md active:scale-95"
          >
            <span>✨</span>
            <span>Auto Layout</span>
          </button>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
};

export default ChenDiagram;
