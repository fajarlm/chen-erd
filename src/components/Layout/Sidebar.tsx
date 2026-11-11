import React, { useState, useCallback, useMemo } from 'react';
import SQLEditor from '../Editor/SQLEditor';
import FormBuilder from '../Editor/FormBuilder';
import FileUpload from '../Editor/FileUpload';
import type { ParsedTable, ChenDiagram } from '../../types';
import { FiCode, FiEdit3, FiDatabase, FiUploadCloud } from 'react-icons/fi';
import { useAppTheme } from '../../context/ThemeContext';

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
  isNeo: boolean;
  onClick: () => void;
}> = React.memo(({ label, icon: Icon, isActive, isNeo, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 py-2 px-2.5 text-xs transition-all duration-150 flex items-center justify-center gap-1.5
      ${
        isNeo
          ? isActive
            ? 'bg-[#FFE600] text-black border-2 border-black font-black shadow-[2px_2px_0px_#000]'
            : 'text-black border-2 border-transparent hover:border-black hover:bg-white font-bold'
          : isActive
          ? 'bg-white text-zinc-900 font-semibold shadow-xs ring-1 ring-zinc-200/60 rounded-xl'
          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 rounded-xl font-medium'
      }
    `}
    aria-label={`Switch to ${label} tab`}
    role="tab"
    aria-selected={isActive}
  >
    <Icon className={`w-3.5 h-3.5 ${isActive ? (isNeo ? 'text-black' : 'text-indigo-600') : 'text-zinc-400'}`} />
    <span>{label}</span>
  </button>
));

TabButton.displayName = 'TabButton';

const EntityItem: React.FC<{ entity: ChenDiagram['entities'][0]; isNeo: boolean }> = React.memo(({ entity, isNeo }) => (
  <div
    className={`
      p-3 transition-all cursor-default
      ${
        isNeo
          ? 'border-2 border-black bg-white shadow-[2px_2px_0px_#000]'
          : 'border border-zinc-200/70 rounded-xl bg-white hover:border-zinc-300 shadow-2xs'
      }
    `}
  >
    <div className="flex items-center justify-between">
      <div className={`text-xs flex items-center gap-2 ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-900'}`}>
        <div className={`w-2 h-2 ${isNeo ? 'bg-black' : 'bg-blue-600 rounded-full'}`} aria-hidden="true" />
        <span className="uppercase">{entity.name}</span>
      </div>
      {entity.isWeakEntity && (
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 ${isNeo ? 'border border-black bg-[#FFE600] text-black' : 'text-blue-600 bg-blue-50 rounded'}`}>
          Weak
        </span>
      )}
    </div>
    <div className="text-[11px] text-zinc-500 mt-1.5 font-medium flex gap-3">
      <span>{entity.attributes.length} attributes</span>
    </div>
  </div>
));

EntityItem.displayName = 'EntityItem';

const RelationshipItem: React.FC<{ relationship: ChenDiagram['relationships'][0]; isNeo: boolean }> = React.memo(({ relationship, isNeo }) => (
  <div
    className={`
      p-3 transition-all cursor-default
      ${
        isNeo
          ? 'border-2 border-black bg-white shadow-[2px_2px_0px_#000]'
          : 'border border-zinc-200/70 rounded-xl bg-white hover:border-zinc-300 shadow-2xs'
      }
    `}
  >
    <div className="flex items-center justify-between">
      <div className={`text-xs flex items-center gap-2 ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-900'}`}>
        <div className={`w-2 h-2 rotate-45 ${isNeo ? 'bg-black' : 'bg-purple-600'}`} aria-hidden="true" />
        <span className="uppercase">{relationship.name}</span>
      </div>
      {relationship.isIdentifying && (
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 ${isNeo ? 'border border-black bg-[#A6FAFF] text-black' : 'text-purple-600 bg-purple-50 rounded'}`}>
          Identifying
        </span>
      )}
    </div>
    <div className="text-[11px] text-zinc-500 mt-1.5 font-medium">
      {relationship.entities.length} connected entities
    </div>
  </div>
));

RelationshipItem.displayName = 'RelationshipItem';

const EmptyWorkspace: React.FC<{ isNeo: boolean }> = ({ isNeo }) => (
  <div
    className={`
      text-center flex flex-col items-center justify-center py-12 px-4
      ${
        isNeo
          ? 'bg-white border-2 border-black border-dashed shadow-[2px_2px_0px_#000]'
          : 'bg-zinc-50/60 border border-zinc-200/60 rounded-2xl border-dashed'
      }
    `}
  >
    <div className={`w-10 h-10 flex items-center justify-center mb-2.5 ${isNeo ? 'border-2 border-black bg-[#FFE600]' : 'rounded-full bg-zinc-100'}`}>
      <span className="text-zinc-600 font-black text-base" aria-hidden="true">+</span>
    </div>
    <p className={`text-xs ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-800'}`}>No Elements Yet</p>
    <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">
      Execute SQL or use the builder to see generated entities and relations.
    </p>
  </div>
);

const EntitiesTab: React.FC<{ diagram: ChenDiagram | null }> = ({ diagram }) => {
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  const totalItems = useMemo(() => {
    if (!diagram) return 0;
    return diagram.entities.length + diagram.relationships.length;
  }, [diagram]);

  if (!diagram || totalItems === 0) {
    return <EmptyWorkspace isNeo={isNeo} />;
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-xs uppercase tracking-wider ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-800'}`}>
          Schema Elements
        </h3>
        <span 
          className={`text-[10px] font-bold px-2 py-0.5 ${isNeo ? 'border border-black bg-[#FFE600] text-black shadow-[1px_1px_0px_#000]' : 'bg-zinc-100 text-zinc-600 rounded-full'}`}
          aria-label={`${totalItems} total items`}
        >
          {totalItems} total
        </span>
      </div>
      
      <div className="space-y-2.5" role="list" aria-label="Entities and relationships">
        {diagram.entities.map((entity) => (
          <EntityItem key={entity.id} entity={entity} isNeo={isNeo} />
        ))}
        
        {diagram.relationships.map((relationship) => (
          <RelationshipItem key={relationship.id} relationship={relationship} isNeo={isNeo} />
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
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  return (
    <div className="space-y-4">
      <div className="h-[460px]">
        <SQLEditor onExecute={onSQLExecute} isLoading={isLoading} />
      </div>

      <div className={`p-3 transition-all ${isNeo ? 'bg-white border-2 border-black shadow-[2px_2px_0px_#000]' : 'border border-zinc-200/70 rounded-2xl bg-zinc-50/50'}`}>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className={`w-full flex items-center justify-between text-xs transition-colors ${isNeo ? 'font-black text-black' : 'font-semibold text-zinc-700 hover:text-zinc-950'}`}
        >
          <span className="flex items-center gap-1.5">
            <FiUploadCloud className={`w-4 h-4 ${isNeo ? 'text-black' : 'text-indigo-500'}`} />
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
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

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
      <div className={`px-4 pt-3.5 pb-2.5 border-b ${isNeo ? 'border-black bg-white' : 'border-zinc-100 bg-white/50'}`}>
        <div 
          className={`flex p-1 ${isNeo ? 'bg-[#f4f4f5] border-2 border-black' : 'bg-zinc-100/90 rounded-2xl'}`}
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
              isNeo={isNeo}
              onClick={() => onTabChange(id)}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
