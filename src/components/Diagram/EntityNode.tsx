import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface EntityNodeProps {
  data: {
    label: string;
    attributes?: Array<{
      name: string;
      isPrimaryKey: boolean;
    }>;
    isWeakEntity?: boolean;
  };
}

const EntityNode = memo(({ data }: EntityNodeProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 ${
      data.isWeakEntity ? 'border-dashed border-blue-400' : 'border-blue-600'
    } p-4 min-w-[200px]`}>
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      
      <div className="font-bold text-lg text-blue-900 mb-2 text-center">
        {data.label}
      </div>
      
      {data.attributes && (
        <div className="border-t border-gray-200 pt-2">
          {data.attributes.map((attr, index) => (
            <div
              key={index}
              className={`text-sm px-2 py-1 ${
                attr.isPrimaryKey ? 'underline font-semibold' : ''
              }`}
            >
              {attr.name}
            </div>
          ))}
        </div>
      )}
      
      {data.isWeakEntity && (
        <div className="mt-2 text-xs text-blue-400 text-center">
          Weak Entity
        </div>
      )}
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
export default EntityNode;