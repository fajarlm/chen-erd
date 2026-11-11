import { memo } from 'react';
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
    <div className="relative select-none">
      <Handle type="target" position={Position.Top} id="top-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Top} id="top-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Left} id="left-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Left} id="left-source" className="opacity-0 w-2 h-2" />
      <Handle type="target" position={Position.Right} id="right-target" className="opacity-0 w-2 h-2" />
      <Handle type="source" position={Position.Right} id="right-source" className="opacity-0 w-2 h-2" />

      <div
        className={`
          min-w-[100px] min-h-[44px] px-4 py-2 flex items-center justify-center
          rounded-full text-center text-xs shadow-sm bg-white transition-shadow hover:shadow-md
          ${data.isPrimaryKey 
            ? 'border-2 border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold' 
            : 'border-2 border-zinc-400 text-zinc-800 font-medium'}
          ${data.isMultivalued ? 'border-4 border-double border-zinc-700' : ''}
          ${data.isDerived ? 'border-dashed border-zinc-500' : ''}
        `}
      >
        <span className={data.isPrimaryKey ? 'underline underline-offset-4 decoration-2 decoration-emerald-600' : ''}>
          {data.label}
        </span>
      </div>
    </div>
  );
});

AttributeNode.displayName = 'AttributeNode';
export default AttributeNode;
