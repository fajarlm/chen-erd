import { memo } from 'react';
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
    <div className="relative select-none flex items-center justify-center p-2">
      <Handle type="target" position={Position.Top} id="top-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Top} id="top-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Left} id="left-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Left} id="left-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Right} id="right-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Right} id="right-source" className="opacity-0 w-2 h-2" />

      {/* Diamond Shape */}
      <div
        className={`
          w-24 h-24 flex items-center justify-center
          rotate-45 bg-white shadow-md transition-shadow hover:shadow-lg
          ${data.isIdentifying 
            ? 'border-4 border-double border-purple-600 bg-purple-50/20' 
            : 'border-2 border-purple-600'}
        `}
      >
        <div className="-rotate-45 text-center px-1 flex flex-col items-center justify-center">
          <span className="font-semibold text-xs text-purple-950 leading-tight line-clamp-2 max-w-[65px] break-words">
            {data.label}
          </span>
          {data.isIdentifying && (
            <span className="text-[9px] text-purple-600 font-medium mt-0.5">ID</span>
          )}
        </div>
      </div>
    </div>
  );
});

RelationshipNode.displayName = 'RelationshipNode';
export default RelationshipNode;
