import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useAppTheme } from '../../context/ThemeContext';

interface AttributeNodeProps {
  data: {
    label: string;
    isPrimaryKey?: boolean;
    isMultivalued?: boolean;
    isDerived?: boolean;
  };
}

/**
 * Authentic Peter Chen Attribute Symbol:
 * - Normal Attribute: Oval / Ellipse
 * - Key Attribute (PK): Text inside oval is UNDERLINED
 * - Multivalued Attribute: Double Oval (oval inside oval)
 * - Derived Attribute: Dashed Oval
 */
const AttributeNode = memo(({ data }: AttributeNodeProps) => {
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  return (
    <div className="group relative select-none">
      {/* 4 Handles for straight-line connections */}
      <Handle type="target" position={Position.Top} id="top-target" className="!w-1.5 !h-1.5 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-1.5 !h-1.5 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-1.5 !h-1.5 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-1.5 !h-1.5 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-1.5 !h-1.5 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-1.5 !h-1.5 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-1.5 !h-1.5 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-1.5 !h-1.5 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Outer Ellipse */}
      <div
        className={`
          min-w-[104px] min-h-[46px] px-4 py-2 flex items-center justify-center text-center
          rounded-[50%] transition-all duration-150
          ${
            isNeo
              ? `border-[2.5px] border-black bg-white shadow-[3px_3px_0px_0px_#000] text-black ${
                  data.isDerived ? '!border-dashed' : ''
                }`
              : `border-2 border-zinc-700 bg-white shadow-xs text-zinc-900 ${
                  data.isDerived ? '!border-dashed' : ''
                }`
          }
        `}
      >
        {/* If Multivalued: Double Oval Inner Ellipse */}
        {data.isMultivalued ? (
          <div
            className={`
              w-full h-full px-2 py-1 rounded-[50%] flex items-center justify-center
              ${isNeo ? 'border-2 border-black' : 'border border-zinc-700'}
            `}
          >
            <span
              className={`text-xs ${
                data.isPrimaryKey
                  ? 'underline underline-offset-4 decoration-2 font-bold'
                  : 'font-medium'
              }`}
            >
              {data.label}
            </span>
          </div>
        ) : (
          <span
            className={`text-xs ${
              data.isPrimaryKey
                ? 'underline underline-offset-4 decoration-2 font-bold'
                : 'font-medium'
            }`}
          >
            {data.label}
          </span>
        )}
      </div>
    </div>
  );
});

AttributeNode.displayName = 'AttributeNode';
export default AttributeNode;
