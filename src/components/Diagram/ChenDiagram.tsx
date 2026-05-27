import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
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
  onUpdate?: (diagram: ChenDiagramType) => void;
}

const ChenDiagram: React.FC<ChenDiagramProps> = ({ diagram, onUpdate }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { applyAutoLayout } = useAutoLayout();

  // Convert Chen diagram to React Flow nodes and edges
  useMemo(() => {
    if (!diagram) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Create entity nodes
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

      // Create attribute nodes for each entity
      entity.attributes.forEach((attr, index) => {
        const attrId = `${entity.id}-attr-${index}`;
        newNodes.push({
          id: attrId,
          type: 'attribute',
          position: {
            x: entity.position.x - 150,
            y: entity.position.y + index * 80,
          },
          data: {
            label: attr.name,
            isPrimaryKey: attr.isPrimaryKey,
            isMultivalued: attr.isMultivalued,
            isDerived: attr.isDerived,
          },
          parentNode: entity.id,
        });

        // Edge from entity to attribute
        newEdges.push({
          id: `edge-${entity.id}-${attrId}`,
          source: entity.id,
          target: attrId,
          type: 'custom',
          data: {
            isPrimaryKey: attr.isPrimaryKey,
          },
          style: {
            stroke: attr.isPrimaryKey ? '#2563eb' : '#10b981',
            strokeWidth: attr.isPrimaryKey ? 2 : 1,
          },
        });
      });
    });

    // Create relationship nodes
    diagram.relationships.forEach((rel, index) => {
      newNodes.push({
        id: rel.id,
        type: 'relationship',
        position: rel.position || { x: 300, y: 300 + index * 100 },
        data: {
          label: rel.name,
          cardinalities: rel.cardinalities,
          isIdentifying: rel.isIdentifying,
          attributes: rel.attributes,
        },
      });

      // Create edges between entities and relationship
      rel.entities.forEach((entityId, entityIndex) => {
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
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      });

      // Add relationship attributes if any
      if (rel.attributes) {
        rel.attributes.forEach((attr, attrIndex) => {
          const attrId = `${rel.id}-attr-${attrIndex}`;
          newNodes.push({
            id: attrId,
            type: 'attribute',
            position: {
              x: rel.position.x + 150,
              y: rel.position.y + attrIndex * 80,
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
              strokeWidth: 1,
              strokeDasharray: '5,5',
            },
          });
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [diagram]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'entity':
                return '#3b82f6';
              case 'attribute':
                return '#10b981';
              case 'relationship':
                return '#8b5cf6';
              default:
                return '#gray';
            }
          }}
        />
        <Panel position="top-right">
          <button
            onClick={applyAutoLayout}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Auto Layout
          </button>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
};

export default ChenDiagram;