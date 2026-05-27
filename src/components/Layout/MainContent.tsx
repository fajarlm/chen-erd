import React from 'react';
import ChenDiagram from '../Diagram/ChenDiagram';
import type { ChenDiagram as ChenDiagramType } from '../../types/index';

interface MainContentProps {
  diagram: ChenDiagramType | null;
  isLoading: boolean;
  onNodeSelect: (node: any) => void;
  onDiagramUpdate: (diagram: ChenDiagramType) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  diagram,
  isLoading,
  onNodeSelect,
  onDiagramUpdate,
}) => {
  return (
    <div className="flex-1 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">Generating ERD...</p>
          </div>
        </div>
      )}
      
      {diagram ? (
        <ChenDiagram
          diagram={diagram}
          onUpdate={onDiagramUpdate}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <svg
              className="mx-auto h-24 w-24 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No Diagram Yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Enter SQL code in the editor, use the form builder, or upload a .sql file
              to generate your Chen ERD diagram.
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Get Started
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;