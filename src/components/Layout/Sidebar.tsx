import React, { useState, useCallback, useMemo } from 'react';
import SQLEditor from '../Editor/SQLEditor';
import FormBuilder from '../Editor/FormBuilder';
import FileUpload from '../Editor/FileUpload';
import type { ParsedTable, ChenDiagram } from '../../types';
import { FiCode, FiEdit3, FiDatabase, FiUploadCloud } from 'react-icons/fi';

type SidebarTab = 'sql' | 'form' | 'entities';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onSQLExecute: (sql: string) => void;
  onFormSubmit: (tables: ParsedTable[]) => void;
  isLoading: boolean;
  diagram: ChenDiagram | null;
}

const TABS: Array<{ id: SidebarTab; label: string; icon: React.ElementType }> = [
  { id: 'sql', label: 'SQL', icon: FiCode },
  { id: 'form', label: 'Builder', icon: FiEdit3 },
  { id: 'entities', label: 'Overview', icon: FiDatabase },
];

const TabButton: React.FC<{
  id: SidebarTab;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = React.memo(({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 py-2 px-2.5 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5
      ${isActive
        ? 'bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200/60'
        : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
      }
    `}
    aria-label={`Switch to ${label} tab`}
    role="tab"
    aria-selected={isActive}
  >
    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-zinc-400'}`} />
    <span>{label}</span>
  </button>
));

TabButton.displayName = 'TabButton';

const EntityItem: React.FC<{ entity: ChenDiagram['entities'][0] }> = React.memo(({ entity }) => (
  <div className="group border border-zinc-200/70 rounded-xl p-3.5 bg-white hover:border-blue-200 hover:shadow-xs transition-all cursor-default">
    <div className="flex items-center justify-between">
      <div className="font-semibold text-xs text-zinc-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
        <span className="capitalize">{entity.name}</span>
      </div>
      {entity.isWeakEntity && (
        <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">
          Weak
        </span>
      )}
    </div>
    <div className="text-[11px] text-zinc-400 mt-2 font-medium flex gap-3">
      <span>{entity.attributes.length} attributes</span>
    </div>
  </div>
));

EntityItem.displayName = 'EntityItem';

const RelationshipItem: React.FC<{ relationship: ChenDiagram['relationships'][0] }> = React.memo(({ relationship }) => (
  <div className="group border border-zinc-200/70 rounded-xl p-3.5 bg-white hover:border-purple-200 hover:shadow-xs transition-all cursor-default">
    <div className="flex items-center justify-between">
      <div className="font-semibold text-xs text-zinc-800 flex items-center gap-2">
        <div className="w-2 h-2 rotate-45 bg-purple-500" aria-hidden="true" />
        <span className="uppercase">{relationship.name}</span>
      </div>
      {relationship.isIdentifying && (
        <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">
          ID
        </span>
      )}
    </div>
    <div className="text-[11px] text-zinc-400 mt-2 font-medium">
      {relationship.entities.length} connected entities
    </div>
  </div>
));

RelationshipItem.displayName = 'RelationshipItem';

const EmptyWorkspace: React.FC = () => (
  <div className="text-center flex flex-col items-center justify-center py-12 px-4 bg-zinc-50/60 border border-zinc-200/60 rounded-2xl border-dashed">
    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-2.5">
      <span className="text-zinc-400 text-base" aria-hidden="true">+</span>
    </div>
    <p className="font-semibold text-xs text-zinc-800">No Elements Yet</p>
    <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
      Execute SQL or use the builder to see generated entities and relations.
    </p>
  </div>
);

const EntitiesTab: React.FC<{ diagram: ChenDiagram | null }> = ({ diagram }) => {
  const totalItems = useMemo(() => {
    if (!diagram) return 0;
    return diagram.entities.length + diagram.relationships.length;
  }, [diagram]);

  if (!diagram || totalItems === 0) {
    return <EmptyWorkspace />;
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs text-zinc-800 uppercase tracking-wider">Schema Elements</h3>
        <span 
          className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full"
          aria-label={`${totalItems} total items`}
        >
          {totalItems} total
        </span>
      </div>
      
      <div className="space-y-2.5" role="list" aria-label="Entities and relationships">
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

const SQLTab: React.FC<{
  onSQLExecute: (sql: string) => void;
  onFileLoad: (content: string) => void;
  isLoading: boolean;
}> = React.memo(({ onSQLExecute, onFileLoad, isLoading }) => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-4">
      <div className="h-[460px]">
        <SQLEditor onExecute={onSQLExecute} isLoading={isLoading} />
      </div>

      <div className="border border-zinc-200/70 rounded-2xl p-3 bg-zinc-50/50">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="w-full flex items-center justify-between text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <FiUploadCloud className="w-4 h-4 text-indigo-500" />
            <span>Upload .sql file</span>
          </span>
          <span className="text-[10px] text-zinc-400">{showUpload ? 'Hide' : 'Show'}</span>
        </button>

        {showUpload && (
          <div className="pt-2">
            <FileUpload onFileLoad={onFileLoad} />
          </div>
        )}
      </div>
    </div>
  );
});

SQLTab.displayName = 'SQLTab';

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
      {/* Tab Segmented Control */}
      <div className="px-5 pt-4 pb-2 border-b border-zinc-100">
        <div 
          className="flex bg-zinc-100/90 p-1 rounded-2xl"
          role="tablist"
          aria-label="Sidebar navigation"
        >
          {TABS.map(({ id, label, icon }) => (
            <TabButton
              key={id}
              id={id}
              label={label}
              icon={icon}
              isActive={activeTab === id}
              onClick={() => onTabChange(id)}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
