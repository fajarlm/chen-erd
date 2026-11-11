import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useAppTheme } from '../../context/ThemeContext';

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

/**
 * Authentic Peter Chen Entity Symbol:
 * - Strong Entity: Single Rectangle
 * - Weak Entity: Double Rectangle (rectangle inside rectangle)
 */
const EntityNode = memo(({ data }: EntityNodeProps) => {
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  return (
    <div className="group relative select-none">
      {/* 4 Handles for straight-line connections */}
      <Handle type="target" position={Position.Top} id="top-target" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Outer Rectangle */}
      <div
        className={`
          min-w-[150px] min-h-[50px] px-6 py-3.5 flex items-center justify-center text-center
          transition-all duration-150
          ${
            isNeo
              ? 'border-[2.5px] border-black bg-[#FFE600] text-black font-black shadow-[4px_4px_0px_0px_#000]'
              : 'border-2 border-zinc-900 bg-white text-zinc-900 font-bold shadow-sm'
          }
        `}
      >
        {/* If Weak Entity: Authentic Double Rectangle Inner Border */}
        {data.isWeakEntity ? (
          <div
            className={`
              w-full h-full p-2 flex items-center justify-center
              ${isNeo ? 'border-2 border-black bg-white' : 'border border-zinc-900'}
            `}
          >
            <span className="text-xs tracking-wider uppercase font-black">{data.label}</span>
          </div>
        ) : (
          <span className="text-xs tracking-wider uppercase font-bold">{data.label}</span>
        )}
      </div>
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
export default EntityNode;
