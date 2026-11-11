import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FiLayers } from 'react-icons/fi';

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
  const attrCount = data.attributes?.length || 0;

  return (
    <div
      className={`group relative bg-white rounded-xl transition-all duration-200 select-none min-w-[170px] ${
        data.isWeakEntity
          ? 'border-4 border-double border-blue-600 shadow-md'
          : 'border-2 border-blue-600 shadow-sm hover:shadow-md hover:border-blue-700'
      }`}
    >
      {/* 4 Handles */}
      <Handle type="target" position={Position.Top} id="top-target" className="!w-2 !h-2 !bg-blue-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-2 !h-2 !bg-blue-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-2 !h-2 !bg-blue-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-2 !h-2 !bg-blue-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-blue-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-2 !h-2 !bg-blue-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-2 !bg-blue-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-blue-600 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="px-5 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1 text-blue-600">
          <FiLayers className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-500">
            {data.isWeakEntity ? 'Weak Entity' : 'Entity'}
          </span>
        </div>

        <div className="font-bold text-sm text-zinc-900 tracking-tight capitalize">
          {data.label}
        </div>

        {attrCount > 0 && (
          <div className="mt-1 text-[10px] font-medium text-zinc-400">
            {attrCount} {attrCount === 1 ? 'attribute' : 'attributes'}
          </div>
        )}
      </div>
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
export default EntityNode;
