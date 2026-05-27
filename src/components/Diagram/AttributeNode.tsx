import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface AttributeNodeProps {
  data: {
    label: string;
    isPrimaryKey?: boolean;
    isMultivalued?: boolean;
    isDerived?: boolean;
  };
}

const AttributeNode = memo(({ data }: AttributeNodeProps) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} />
      
      <div
        className={`
          w-24 h-24 flex items-center justify-center
          border-2 rounded-full p-3 text-center text-sm
          ${data.isPrimaryKey ? 'border-blue-600 bg-blue-50 underline font-bold' : 'border-green-600'}
          ${data.isMultivalued ? 'border-double' : ''}
          ${data.isDerived ? 'border-dashed' : ''}
        `}
      >
        <span className="text-xs">{data.label}</span>
      </div>
    </div>
  );
});

AttributeNode.displayName = 'AttributeNode';
export default AttributeNode;