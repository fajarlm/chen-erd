import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FiKey } from 'react-icons/fi';

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
    <div className="group relative select-none">
      {/* 4 Handles */}
      <Handle type="target" position={Position.Top} id="top-target" className="!w-1.5 !h-1.5 !bg-zinc-400 !border-white !border opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-1.5 !h-1.5 !bg-zinc-400 !border-white !border opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-1.5 !h-1.5 !bg-zinc-400 !border-white !border opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-1.5 !h-1.5 !bg-zinc-400 !border-white !border opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-1.5 !h-1.5 !bg-zinc-400 !border-white !border opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-1.5 !h-1.5 !bg-zinc-400 !border-white !border opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-1.5 !h-1.5 !bg-zinc-400 !border-white !border opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-1.5 !h-1.5 !bg-zinc-400 !border-white !border opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Modern Oval Pill */}
      <div
        className={`
          min-w-[96px] px-3.5 py-1.5 flex items-center justify-center gap-1.5
          rounded-full text-center text-xs shadow-xs transition-all duration-200
          ${
            data.isPrimaryKey
              ? 'border-2 border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold shadow-emerald-500/10'
              : 'border border-zinc-300 bg-white/95 text-zinc-700 font-medium hover:border-zinc-400'
          }
          ${data.isMultivalued ? '!border-4 !border-double !border-zinc-500' : ''}
          ${data.isDerived ? '!border-dashed !border-zinc-400 bg-zinc-50/50' : ''}
        `}
      >
        {data.isPrimaryKey && (
          <FiKey className="w-3 h-3 text-emerald-600 shrink-0" />
        )}
        <span
          className={
            data.isPrimaryKey
              ? 'underline underline-offset-4 decoration-emerald-600 decoration-1.5 font-bold tracking-tight'
              : 'tracking-tight'
          }
        >
          {data.label}
        </span>
      </div>
    </div>
  );
});

AttributeNode.displayName = 'AttributeNode';
export default AttributeNode;
