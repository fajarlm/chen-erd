import React from 'react';
import ChenDiagram from '../Diagram/ChenDiagram';
import type { ChenDiagram as ChenDiagramType } from '../../types/index';
import type { Node } from 'reactflow';

interface MainContentProps {
  diagram: ChenDiagramType | null;
  isLoading: boolean;
  onNodeSelect: (node: Node | null) => void;
  onDiagramUpdate: (diagram: ChenDiagramType) => void;
  showGrid?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  diagram,
  isLoading,
  onNodeSelect,
  onDiagramUpdate,
  showGrid = true,
}) => {
  return (
    <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
          <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl border border-zinc-100">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-3 text-sm font-semibold text-zinc-700">Generating Chen ERD...</p>
            <p className="text-xs text-zinc-400 mt-0.5">Converting entities, attributes & relationships</p>
          </div>
        </div>
      )}

      {diagram && (diagram.entities.length > 0 || diagram.relationships.length > 0) ? (
        <div className="w-full h-full flex flex-1">
          <ChenDiagram
            diagram={diagram}
            onNodeSelect={onNodeSelect}
            onUpdate={onDiagramUpdate}
            showGrid={showGrid}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full p-6">
          <div className="text-center max-w-md bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-zinc-200/70 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/50 shadow-inner">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-800">
              No Diagram Generated Yet
            </h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Generate a Chen ERD by running a SQL script in the editor, building entities via the Visual Builder, or uploading a <code className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded text-xs">.sql</code> file.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Entity: Rectangle
              <span className="mx-1">•</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Attribute: Oval
              <span className="mx-1">•</span>
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Relationship: Diamond
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
