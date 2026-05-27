import React, { useCallback, useMemo } from 'react';
import SQLEditor from '../Editor/SQLEditor';
import FormBuilder from '../Editor/FormBuilder';
import FileUpload from '../Editor/FileUpload';
import type { ParsedTable, ChenDiagram } from '../../types';

type SidebarTab = 'sql' | 'form' | 'entities';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onSQLExecute: (sql: string) => void;
  onFormSubmit: (tables: ParsedTable[]) => void;
  isLoading: boolean;
  diagram: ChenDiagram | null;
}

// Tab configuration for better maintainability
const TABS: Array<{ id: SidebarTab; label: string }> = [
  { id: 'sql', label: 'SQL' },
  { id: 'form', label: 'Builder' },
  { id: 'entities', label: 'Entities' },
];

// Separate component for tab button to reduce re-renders
const TabButton: React.FC<{
  id: SidebarTab;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = React.memo(({ id, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
      ${isActive
        ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50'
        : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
      }
    `}
    aria-label={`Switch to ${label} tab`}
    role="tab"
    aria-selected={isActive}
  >
    {label}
  </button>
));

TabButton.displayName = 'TabButton';

// Entity list item component
const EntityItem: React.FC<{ entity: ChenDiagram['entities'][0] }> = React.memo(({ entity }) => (
  <div className="group border border-zinc-200/60 rounded-xl p-4 bg-white hover:border-indigo-200 hover:shadow-sm transition-all cursor-default">
    <div className="flex items-center justify-between">
      <div className="font-semibold text-zinc-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
        {entity.name}
      </div>
    </div>
    <div className="text-sm text-zinc-500 mt-2 font-medium flex gap-3">
      <span>{entity.attributes.length} attributes</span>
      {entity.isWeakEntity && (
        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-xs">
          Weak
        </span>
      )}
    </div>
  </div>
));

EntityItem.displayName = 'EntityItem';

// Relationship list item component
const RelationshipItem: React.FC<{ relationship: ChenDiagram['relationships'][0] }> = React.memo(({ relationship }) => (
  <div className="group border border-zinc-200/60 rounded-xl p-4 bg-white hover:border-purple-200 hover:shadow-sm transition-all cursor-default">
    <div className="flex items-center justify-between">
      <div className="font-semibold text-zinc-800 flex items-center gap-2">
        <div className="w-2 h-2 rotate-45 bg-purple-500" aria-hidden="true" />
        {relationship.name}
      </div>
    </div>
    <div className="text-sm text-zinc-500 mt-2 font-medium">
      {relationship.entities.length} connections
    </div>
  </div>
));

RelationshipItem.displayName = 'RelationshipItem';

// Empty state component
const EmptyWorkspace: React.FC = () => (
  <div className="text-center flex flex-col items-center justify-center py-16 px-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl border-dashed">
    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
      <span className="text-zinc-400 text-xl" aria-hidden="true">+</span>
    </div>
    <p className="font-medium text-zinc-800">Empty Workspace</p>
    <p className="text-sm text-zinc-500 mt-1 max-w-[200px]">
      Generate a diagram using SQL or the builder to see entities here
    </p>
  </div>
);

// Entities tab content component
const EntitiesTab: React.FC<{ diagram: ChenDiagram | null }> = ({ diagram }) => {
  const totalItems = useMemo(() => {
    if (!diagram) return 0;
    return diagram.entities.length + diagram.relationships.length;
  }, [diagram]);

  if (!diagram) {
    return <EmptyWorkspace />;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-800">Workspace Data</h3>
        <span 
          className="text-xs font-medium bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full"
          aria-label={`${totalItems} total items`}
        >
          {totalItems} items
        </span>
      </div>
      
      <div className="space-y-3" role="list" aria-label="Entities and relationships">
        {diagram.entities.map((entity) => (
          <EntityItem key={entity.id} entity={entity} />
        ))}
        
        {diagram.relationships.map((relationship) => (
          <RelationshipItem key={relationship.id} relationship={relationship} />
        ))}
      </div>
    </div>
  );
};

// SQL tab content component
const SQLTab: React.FC<{
  onSQLExecute: (sql: string) => void;
  onFileLoad: (content: string) => void;
  isLoading: boolean;
}> = React.memo(({ onSQLExecute, onFileLoad, isLoading }) => (
  <div className="space-y-6">
    <SQLEditor onExecute={onSQLExecute} isLoading={isLoading} />
    <FileUpload onFileLoad={onFileLoad} />
  </div>
));

SQLTab.displayName = 'SQLTab';

// Main Sidebar component
const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onSQLExecute,
  onFormSubmit,
  isLoading,
  diagram,
}) => {
  const handleFileLoad = useCallback((content: string) => {
    onSQLExecute(content);
  }, [onSQLExecute]);

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'sql':
        return (
          <SQLTab
            onSQLExecute={onSQLExecute}
            onFileLoad={handleFileLoad}
            isLoading={isLoading}
          />
        );
      case 'form':
        return <FormBuilder onSubmit={onFormSubmit} />;
      case 'entities':
        return <EntitiesTab diagram={diagram} />;
      default:
        return null;
    }
  }, [activeTab, onSQLExecute, handleFileLoad, isLoading, onFormSubmit, diagram]);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="px-6 pt-6 pb-2">
        <div 
          className="flex bg-zinc-100/80 p-1 rounded-xl"
          role="tablist"
          aria-label="Sidebar navigation"
        >
          {TABS.map(({ id, label }) => (
            <TabButton
              key={id}
              id={id}
              label={label}
              isActive={activeTab === id}
              onClick={() => onTabChange(id)}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

export default React.memo(Sidebar);