import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlowProvider, useReactFlow, type Node } from 'reactflow';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import PropertiesPanel from './components/Layout/PropertiesPanel';
import Toolbar from './components/UI/Toolbar';
import ExportMenu from './components/UI/ExportMenu';
import { useDiagramState } from './hooks/useDiagramState';

function ChenERDAppInner() {
  const {
    diagram,
    isLoading,
    error,
    generateFromSQL,
    generateFromTables,
    updateDiagram,
    clearDiagram,
  } = useDiagramState();

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'sql' | 'form' | 'entities'>('sql');
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

  const diagramRef = useRef<HTMLDivElement>(null);
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 250 });
    setTimeout(() => setZoomLevel(getZoom()), 260);
  }, [zoomIn, getZoom]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 250 });
    setTimeout(() => setZoomLevel(getZoom()), 260);
  }, [zoomOut, getZoom]);

  const handleFitView = useCallback(() => {
    fitView({ duration: 400, padding: 0.2 });
    setTimeout(() => setZoomLevel(getZoom()), 410);
  }, [fitView, getZoom]);

  const handleToggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      clearDiagram();
      setSelectedNode(null);
    }
  }, [clearDiagram]);

  const handleAddEntity = useCallback(() => {
    // Switch to visual builder tab so the user can easily define a new entity
    setSidebarTab('form');
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(true);
    }
  }, []);

  const handleUpdateNode = useCallback((updatedNode: Node) => {
    if (!diagram) return;

    const newLabel = updatedNode.data?.label;
    const newCardinality = updatedNode.data?.cardinality;

    if (updatedNode.type === 'entity') {
      const updatedEntities = diagram.entities.map(e => 
        e.id === updatedNode.id ? { ...e, name: newLabel || e.name } : e
      );
      updateDiagram({ ...diagram, entities: updatedEntities });
    } else if (updatedNode.type === 'relationship') {
      const updatedRelationships = diagram.relationships.map(r => {
        if (r.id === updatedNode.id) {
          const cardinalities = { ...r.cardinalities };
          if (newCardinality && r.entities.length > 0) {
            // Update cardinality for connected entity
            const targetEntityId = r.entities[r.entities.length - 1];
            cardinalities[targetEntityId] = newCardinality;
          }
          return {
            ...r,
            name: newLabel || r.name,
            cardinalities,
          };
        }
        return r;
      });
      updateDiagram({ ...diagram, relationships: updatedRelationships });
    } else if (updatedNode.type === 'attribute') {
      const updatedEntities = diagram.entities.map(e => ({
        ...e,
        attributes: e.attributes.map(attr => {
          // If attribute ID matches
          if (updatedNode.id.includes(e.id)) {
            return { ...attr, name: newLabel || attr.name };
          }
          return attr;
        }),
      }));
      updateDiagram({ ...diagram, entities: updatedEntities });
    }

    setSelectedNode(updatedNode);
  }, [diagram, updateDiagram]);

  const activeError = !dismissedError && error;

  return (
    <div className="h-screen flex bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: isMobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -420 : 0), opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed lg:relative w-[85vw] max-w-[400px] lg:w-96 border-r border-zinc-200/80 bg-white/95 lg:bg-white/90 backdrop-blur-xl flex flex-col shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 h-full ${
          isMobileMenuOpen ? 'left-0' : '-left-full lg:left-0'
        }`}
      >
        <Sidebar
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          onSQLExecute={(sql) => {
            setDismissedError(false);
            generateFromSQL(sql);
            if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
          }}
          onFormSubmit={(tables) => {
            setDismissedError(false);
            generateFromTables(tables);
            if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
          }}
          isLoading={isLoading}
          diagram={diagram}
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden w-full h-full">
        {/* Header */}
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white/80 backdrop-blur-lg border-b border-zinc-200/80 px-4 md:px-6 py-3 z-20 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 tracking-tight">
                  Chen ERD Generator
                </h1>
              </div>
              <p className="text-xs text-zinc-500 font-medium hidden sm:block mt-0.5">
                Generate Peter Chen Entity-Relationship Diagrams from SQL & Visual Forms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {activeError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border border-rose-200/60 shadow-xs"
              >
                <span className="font-bold text-rose-500">✕</span>
                <span className="font-medium truncate max-w-[160px] md:max-w-[300px]">{activeError}</span>
                <button
                  onClick={() => setDismissedError(true)}
                  className="ml-1 text-rose-400 hover:text-rose-700 font-bold transition-colors"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </motion.div>
            )}

            {/* Export Menu */}
            <ExportMenu
              diagramRef={diagramRef}
              diagramData={diagram}
            />
          </div>
        </motion.header>

        {/* Toolbar */}
        <Toolbar
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onToggleGrid={handleToggleGrid}
          onClearCanvas={handleClearCanvas}
          onAddEntity={handleAddEntity}
          showGrid={showGrid}
          zoom={zoomLevel}
        />

        {/* Diagram Canvas */}
        <div ref={diagramRef} className="flex-1 bg-[#FAFAFA] relative overflow-hidden flex flex-col">
          <MainContent
            diagram={diagram}
            isLoading={isLoading}
            onNodeSelect={setSelectedNode}
            onDiagramUpdate={updateDiagram}
            showGrid={showGrid}
          />
        </div>
      </div>

      {/* Right Properties Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 lg:relative w-80 max-w-[85vw] border-l border-zinc-200/80 bg-white/95 lg:bg-white/90 backdrop-blur-xl shadow-[-4px_0_24px_rgba(0,0,0,0.06)] z-30 h-full"
          >
            <PropertiesPanel
              key={selectedNode.id}
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdate={handleUpdateNode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <ChenERDAppInner />
    </ReactFlowProvider>
  );
}

export default App;
