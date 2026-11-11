import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useAppTheme } from '../../context/ThemeContext';

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

/**
 * Authentic Peter Chen Relationship Symbol:
 * - Normal Relationship: Diamond (Rhombus)
 * - Identifying Relationship: Double Diamond (diamond inside diamond)
 */
const RelationshipNode = memo(({ data }: RelationshipNodeProps) => {
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  // SVG Diamond dimensions
  const width = 120;
  const height = 74;

  const outerPoints = `${width / 2},4 ${width - 4},${height / 2} ${width / 2},${height - 4} 4,${height / 2}`;
  const innerPoints = `${width / 2},10 ${width - 12},${height / 2} ${width / 2},${height - 10} 12,${height / 2}`;

  const strokeColor = isNeo ? '#000000' : '#7c3aed';
  const fillColor = isNeo ? '#A6FAFF' : '#ffffff';
  const strokeWidth = isNeo ? 2.5 : 2;

  return (
    <div className="group relative select-none flex items-center justify-center">
      {/* 4 Handles at the diamond vertices */}
      <Handle type="target" position={Position.Top} id="top-target" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-black opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* SVG Diamond */}
      <svg
        width={width}
        height={height}
        className={isNeo ? 'drop-shadow-[3px_3px_0px_#000]' : 'drop-shadow-xs'}
      >
        {/* Outer Polygon */}
        <polygon
          points={outerPoints}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* If Identifying: Authentic Double Diamond Inner Polygon */}
        {data.isIdentifying && (
          <polygon
            points={innerPoints}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Centered Verb Label */}
      <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none text-center">
        <span
          className={`
            text-[11px] leading-tight px-2 max-w-[84px] break-words uppercase
            ${isNeo ? 'text-black font-black' : 'text-purple-950 font-bold'}
          `}
        >
          {data.label}
        </span>
      </div>
    </div>
  );
});

RelationshipNode.displayName = 'RelationshipNode';
export default RelationshipNode;
