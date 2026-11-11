import { memo } from 'react';
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
    <div
      className={`relative bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg ${
        data.isWeakEntity
          ? 'border-4 border-double border-blue-600'
          : 'border-2 border-blue-600'
      } px-6 py-4 min-w-[160px] text-center select-none`}
    >
      {/* 4-directional handles for flexible connection */}
      <Handle type="target" position={Position.Top} id="top-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Top} id="top-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Left} id="left-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Left} id="left-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Right} id="right-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Right} id="right-source" className="opacity-0 w-2 h-2" />

      <div className="font-bold text-base text-zinc-900 tracking-tight">
        {data.label}
      </div>

      {data.isWeakEntity && (
        <span className="inline-block mt-1 text-[10px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
          Weak Entity
        </span>
      )}
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
export default EntityNode;
