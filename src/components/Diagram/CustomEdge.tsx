import { BaseEdge, EdgeLabelRenderer, getStraightPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import { useAppTheme } from '../../context/ThemeContext';

interface CustomEdgeProps extends EdgeProps {
  data?: {
    cardinality?: string;
    isPrimaryKey?: boolean;
    isTotalParticipation?: boolean;
  };
}

const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
}: CustomEdgeProps) => {
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  // Authentic Chen ERD uses pure straight lines, NOT curvy bezier wires!
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const edgeStyle = {
    ...style,
    stroke: isNeo ? '#000000' : (style.stroke || '#475569'),
    strokeWidth: isNeo ? 2.5 : (style.strokeWidth || 1.8),
  };

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} />

      {/* Cardinality Badge (Chen notation: 1, N, M) */}
      {data?.cardinality && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="nodrag nopan flex items-center justify-center z-10"
          >
            <div
              className={`
                min-w-[22px] px-2 py-0.5 text-center text-xs select-none
                ${
                  isNeo
                    ? 'bg-white border-2 border-black text-black font-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white/95 border border-zinc-300 text-zinc-800 font-bold rounded-md shadow-xs'
                }
              `}
            >
              {data.cardinality}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
