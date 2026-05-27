import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface RelationshipNodeProps {
  data: {
    label: string;
    cardinalities?: {
      [entityId: string]: string;
    };
    isIdentifying?: boolean;
    attributes?: Array<{
      name: string;
    }>;
  };
}

const RelationshipNode = memo(({ data }: RelationshipNodeProps) => {
  return (
    <div className="relative">
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      
      <div
        className={`
          w-28 h-28 flex items-center justify-center
          rotate-45 border-2 bg-white
          ${data.isIdentifying ? 'border-red-500 bg-red-50' : 'border-purple-600'}
        `}
      >
        <div className="-rotate-45 text-center">
          <div className="font-semibold text-sm text-purple-900">
            {data.label}
          </div>
          
          {data.attributes && data.attributes.length > 0 && (
            <div className="mt-2 border-t border-purple-200 pt-1">
              {data.attributes.map((attr, index) => (
                <div key={index} className="text-xs text-gray-600">
                  {attr.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

RelationshipNode.displayName = 'RelationshipNode';
export default RelationshipNode;