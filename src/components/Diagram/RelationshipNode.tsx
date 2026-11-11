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
    <div className="group relative select-none flex items-center justify-center p-2">
      {/* 4 Handles at the diamond points */}
      <Handle type="target" position={Position.Top} id="top-target" className="!w-2 !h-2 !bg-purple-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-2 !h-2 !bg-purple-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-2 !h-2 !bg-purple-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-2 !h-2 !bg-purple-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-purple-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-2 !h-2 !bg-purple-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-2 !bg-purple-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-purple-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Modern Diamond Shape */}
      <div
        className={`
          w-22 h-22 flex items-center justify-center
          rotate-45 rounded-lg bg-gradient-to-br from-purple-50/60 to-white
          shadow-xs hover:shadow-md transition-all duration-200
          ${
            data.isIdentifying
              ? 'border-4 border-double border-purple-600'
              : 'border-2 border-purple-600 hover:border-purple-700'
          }
        `}
      >
        <div className="-rotate-45 text-center px-1.5 flex flex-col items-center justify-center">
          <span className="font-bold text-[11px] text-purple-950 uppercase tracking-wider leading-snug line-clamp-2 max-w-[62px] break-words">
            {data.label}
          </span>
          {data.isIdentifying && (
            <span className="text-[8px] font-bold text-purple-600 uppercase mt-0.5 tracking-tighter">
              Identifying
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

RelationshipNode.displayName = 'RelationshipNode';
export default RelationshipNode;
