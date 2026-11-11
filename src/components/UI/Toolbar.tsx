import React from 'react';
import { motion } from 'framer-motion';
import {
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiGrid,
  FiTrash2,
  FiMap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useAppTheme } from '../../context/ThemeContext';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleGrid: () => void;
  onClearCanvas: () => void;
  onAutoLayout?: () => void;
  onToggleMinimap?: () => void;
  showGrid: boolean;
  showMinimap?: boolean;
  zoom: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleGrid,
  onClearCanvas,
  onAutoLayout,
  onToggleMinimap,
  showGrid,
  showMinimap = true,
  zoom,
}) => {
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  return (
    <motion.aside
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
      aria-label="Canvas controls"
    >
      <nav 
        aria-label="Canvas tool navigation"
        className={`
          flex items-center gap-1.5 p-1.5 transition-all
          ${
            isNeo
              ? 'bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none'
              : 'bg-white/95 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl'
          }
        `}
      >
        {/* Auto Layout Button */}
        {onAutoLayout && (
          <>
            <button
              onClick={onAutoLayout}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all
                ${
                  isNeo
                    ? 'bg-[#FFE600] text-black font-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                    : 'bg-indigo-50/90 hover:bg-indigo-100/80 text-indigo-700 font-semibold rounded-xl border border-indigo-200/50 shadow-2xs active:scale-95'
                }
              `}
              title="Organize diagram automatically"
            >
              <HiSparkles className={`w-3.5 h-3.5 ${isNeo ? 'text-black' : 'text-indigo-600'}`} />
              <span>Auto Layout</span>
            </button>
            <div className={`h-5 w-px mx-0.5 ${isNeo ? 'bg-black' : 'bg-zinc-200'}`} />
          </>
        )}

        {/* Zoom Controls */}
        <div className={`flex items-center px-1 ${isNeo ? 'bg-[#f4f4f5] border border-black' : 'bg-zinc-100/90 rounded-xl'}`}>
          <button
            onClick={onZoomOut}
            className={`p-1.5 transition-all ${isNeo ? 'hover:bg-white text-black font-bold' : 'hover:bg-white hover:text-zinc-900 rounded-lg text-zinc-600 active:scale-90'}`}
            title="Zoom Out (Ctrl -)"
            aria-label="Zoom Out"
          >
            <FiZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={onFitView}
            className={`px-2 py-1 text-[11px] tabular-nums min-w-[46px] text-center ${isNeo ? 'font-black text-black' : 'font-semibold text-zinc-700 hover:text-zinc-950'}`}
            title="Reset to 100% / Fit View"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={onZoomIn}
            className={`p-1.5 transition-all ${isNeo ? 'hover:bg-white text-black font-bold' : 'hover:bg-white hover:text-zinc-900 rounded-lg text-zinc-600 active:scale-90'}`}
            title="Zoom In (Ctrl +)"
            aria-label="Zoom In"
          >
            <FiZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onFitView}
          className={`
            p-2 transition-all
            ${
              isNeo
                ? 'border-2 border-black text-black bg-white shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                : 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 rounded-xl active:scale-90'
            }
          `}
          title="Fit view to all nodes (Ctrl F)"
          aria-label="Fit View"
        >
          <FiMaximize className="w-4 h-4" />
        </button>

        <div className={`h-5 w-px mx-0.5 ${isNeo ? 'bg-black' : 'bg-zinc-200'}`} />

        {/* Grid Toggle */}
        <button
          onClick={onToggleGrid}
          className={`
            p-2 transition-all
            ${
              isNeo
                ? showGrid
                  ? 'bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                : showGrid
                ? 'bg-zinc-900 text-white rounded-xl shadow-xs'
                : 'hover:bg-zinc-100 text-zinc-600 rounded-xl active:scale-90'
            }
          `}
          title={showGrid ? 'Hide Background Grid' : 'Show Background Grid'}
          aria-label="Toggle Grid"
        >
          <FiGrid className="w-4 h-4" />
        </button>

        {/* Minimap Toggle */}
        {onToggleMinimap && (
          <button
            onClick={onToggleMinimap}
            className={`
              p-2 transition-all
              ${
                isNeo
                  ? showMinimap
                    ? 'bg-[#A6FAFF] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                  : showMinimap
                  ? 'bg-zinc-100 text-zinc-900 rounded-xl'
                  : 'hover:bg-zinc-100 text-zinc-400 rounded-xl active:scale-90'
              }
            `}
            title={showMinimap ? 'Hide MiniMap' : 'Show MiniMap'}
            aria-label="Toggle MiniMap"
          >
            <FiMap className="w-4 h-4" />
          </button>
        )}

        <div className={`h-5 w-px mx-0.5 ${isNeo ? 'bg-black' : 'bg-zinc-200'}`} />

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className={`
            p-2 transition-all
            ${
              isNeo
                ? 'bg-[#FF90E8] border-2 border-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                : 'hover:bg-rose-50 hover:text-rose-600 text-zinc-400 rounded-xl active:scale-90'
            }
          `}
          title="Clear diagram"
          aria-label="Clear Canvas"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </nav>
    </motion.aside>
  );
};

export default React.memo(Toolbar);
