import React from 'react';
import ChenDiagram from '../Diagram/ChenDiagram';
import type { ChenDiagram as ChenDiagramType } from '../../types/index';
import type { Node } from 'reactflow';
import { FiDatabase } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useAppTheme } from '../../context/ThemeContext';

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
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  const hasContent = diagram && (diagram.entities.length > 0 || diagram.relationships.length > 0);

  return (
    <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-50 transition-all">
          <div className={`flex flex-col items-center p-6 ${isNeo ? 'border-2 border-black bg-[#FFE600] shadow-[4px_4px_0px_#000]' : 'bg-white/95 rounded-3xl shadow-2xl border border-zinc-100'}`}>
            <div className={`animate-spin rounded-full h-9 w-9 border-2 ${isNeo ? 'border-black border-t-transparent' : 'border-indigo-600 border-t-transparent'}`}></div>
            <p className={`mt-3 text-xs ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-800'}`}>Generating Chen ERD...</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Calculating entities, attributes & relations</p>
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
          <div
            className={`
              text-center max-w-sm p-8 transition-all
              ${
                isNeo
                  ? 'border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000]'
                  : 'bg-white/80 backdrop-blur-xl rounded-3xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
              }
            `}
          >
            <div
              className={`
                w-13 h-13 flex items-center justify-center mx-auto mb-4 transition-all
                ${
                  isNeo
                    ? 'border-2 border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_#000]'
                    : 'rounded-2xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-100/80 shadow-2xs'
                }
              `}
            >
              <FiDatabase className="w-6 h-6" />
            </div>

            <h3 className={`text-base tracking-tight ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-900'}`}>
              Peter Chen ERD Studio
            </h3>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              Generate an authentic 1976 Peter Chen Entity-Relationship Diagram from your SQL schema or visual builder.
            </p>

            {onLoadSample && (
              <div className="mt-5">
                <button
                  onClick={onLoadSample}
                  className={`
                    inline-flex items-center gap-1.5 px-4 py-2 text-xs transition-all
                    ${
                      isNeo
                        ? 'border-2 border-black bg-[#FFE600] text-black font-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                        : 'bg-zinc-900 hover:bg-black text-white font-semibold rounded-xl shadow-xs active:scale-95'
                    }
                  `}
                >
                  <HiSparkles className={`w-3.5 h-3.5 ${isNeo ? 'text-black' : 'text-indigo-400'}`} />
                  <span>Load Sample Schema</span>
                </button>
              </div>
            )}

            <div className={`mt-6 pt-5 border-t ${isNeo ? 'border-black' : 'border-zinc-100'} flex items-center justify-center gap-3 text-[11px] font-medium text-zinc-500`}>
              <span className="flex items-center gap-1"><span className={`w-2.5 h-2.5 ${isNeo ? 'border border-black bg-[#FFE600]' : 'rounded-xs bg-blue-600'}`}></span> Rectangle: Entity</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-full ${isNeo ? 'border border-black bg-white' : 'bg-emerald-600'}`}></span> Oval: Attribute</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rotate-45 ${isNeo ? 'border border-black bg-[#A6FAFF]' : 'bg-purple-600'}`}></span> Diamond: Rel</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
