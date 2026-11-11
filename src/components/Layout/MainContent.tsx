import React from 'react';
import ChenDiagram from '../Diagram/ChenDiagram';
import type { ChenDiagram as ChenDiagramType } from '../../types/index';
import type { Node } from 'reactflow';
import { FiDatabase } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

interface MainContentProps {
  diagram: ChenDiagramType | null;
  isLoading: boolean;
  onNodeSelect: (node: Node | null) => void;
  onDiagramUpdate: (diagram: ChenDiagramType) => void;
  onLoadSample?: () => void;
  showGrid?: boolean;
  showMinimap?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  diagram,
  isLoading,
  onNodeSelect,
  onDiagramUpdate,
  onLoadSample,
  showGrid = true,
  showMinimap = true,
}) => {
  const hasContent = diagram && (diagram.entities.length > 0 || diagram.relationships.length > 0);

  return (
    <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
          <div className="flex flex-col items-center bg-white/95 p-6 rounded-3xl shadow-2xl border border-zinc-100">
            <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-3 text-xs font-bold text-zinc-800">Generating Chen ERD...</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Calculating entities, attributes & relations</p>
          </div>
        </div>
      )}

      {hasContent ? (
        <div className="w-full h-full flex flex-1">
          <ChenDiagram
            diagram={diagram}
            onNodeSelect={onNodeSelect}
            onUpdate={onDiagramUpdate}
            showGrid={showGrid}
            showMinimap={showMinimap}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full p-6">
          <div className="text-center max-w-sm bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/80 shadow-xs">
              <FiDatabase className="w-6 h-6 text-indigo-600" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 tracking-tight">
              Ready to Design Your ERD
            </h3>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              Generate an interactive Peter Chen diagram from your SQL code or build entities manually with the form builder.
            </p>

            {onLoadSample && (
              <div className="mt-5">
                <button
                  onClick={onLoadSample}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <HiSparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Load Sample Schema</span>
                </button>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-center gap-3 text-[11px] font-medium text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-blue-500"></span> Entity</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Attribute</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rotate-45 bg-purple-500"></span> Relationship</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
