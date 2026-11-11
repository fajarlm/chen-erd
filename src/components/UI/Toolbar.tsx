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
  return (
    <motion.aside
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
      aria-label="Canvas controls"
    >
      <nav 
        aria-label="Canvas tool navigation"
        className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl text-zinc-700"
      >
        {/* Auto Layout Button */}
        {onAutoLayout && (
          <>
            <button
              onClick={onAutoLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-xs"
              title="Organize diagram automatically"
            >
              <HiSparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Auto Layout</span>
            </button>
            <div className="h-5 w-px bg-zinc-200/80 mx-0.5" />
          </>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center bg-zinc-100/80 rounded-xl px-1">
          <button
            onClick={onZoomOut}
            className="p-1.5 hover:bg-white hover:text-zinc-900 rounded-lg text-zinc-600 transition-all active:scale-90"
            title="Zoom Out (Ctrl -)"
            aria-label="Zoom Out"
          >
            <FiZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={onFitView}
            className="px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:text-zinc-950 transition-colors tabular-nums min-w-[46px] text-center"
            title="Reset to 100% / Fit View"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={onZoomIn}
            className="p-1.5 hover:bg-white hover:text-zinc-900 rounded-lg text-zinc-600 transition-all active:scale-90"
            title="Zoom In (Ctrl +)"
            aria-label="Zoom In"
          >
            <FiZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onFitView}
          className="p-2 hover:bg-zinc-100 hover:text-zinc-900 text-zinc-600 rounded-xl transition-all active:scale-90"
          title="Fit view to all nodes (Ctrl F)"
          aria-label="Fit View"
        >
          <FiMaximize className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-zinc-200/80 mx-0.5" />

        {/* Grid Toggle */}
        <button
          onClick={onToggleGrid}
          className={`p-2 rounded-xl transition-all active:scale-90 ${
            showGrid
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'hover:bg-zinc-100 text-zinc-600'
          }`}
          title={showGrid ? 'Hide Background Grid' : 'Show Background Grid'}
          aria-label="Toggle Grid"
        >
          <FiGrid className="w-4 h-4" />
        </button>

        {/* Minimap Toggle */}
        {onToggleMinimap && (
          <button
            onClick={onToggleMinimap}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              showMinimap
                ? 'bg-zinc-100 text-zinc-900'
                : 'hover:bg-zinc-100 text-zinc-400'
            }`}
            title={showMinimap ? 'Hide MiniMap' : 'Show MiniMap'}
            aria-label="Toggle MiniMap"
          >
            <FiMap className="w-4 h-4" />
          </button>
        )}

        <div className="h-5 w-px bg-zinc-200/80 mx-0.5" />

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="p-2 hover:bg-rose-50 hover:text-rose-600 text-zinc-400 rounded-xl transition-all active:scale-90"
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
