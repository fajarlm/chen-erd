import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlowProvider, useReactFlow, type Node } from 'reactflow';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import PropertiesPanel from './components/Layout/PropertiesPanel';
import Toolbar from './components/UI/Toolbar';
import ExportMenu from './components/UI/ExportMenu';
import { useDiagramState } from './hooks/useDiagramState';
import { useAutoLayout } from './hooks/useAutoLayout';
import { FiLayers, FiMenu, FiX } from 'react-icons/fi';

const SAMPLE_SQL = `-- E-Commerce Sample Schema
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE categories (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  title VARCHAR(150),
  price DECIMAL,
  category_id INT REFERENCES categories(id)
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_amount DECIMAL,
  order_date DATE
);

CREATE TABLE order_items (
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  unit_price DECIMAL,
  PRIMARY KEY (order_id, product_id)
);`;

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
  const [showMinimap, setShowMinimap] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

  const diagramRef = useRef<HTMLDivElement>(null);
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const { applyAutoLayout } = useAutoLayout();

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

  const handleToggleMinimap = useCallback(() => {
    setShowMinimap(prev => !prev);
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      clearDiagram();
      setSelectedNode(null);
    }
  }, [clearDiagram]);

  const handleLoadSample = useCallback(() => {
    setDismissedError(false);
    generateFromSQL(SAMPLE_SQL);
  }, [generateFromSQL]);

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
  const hasDiagram = diagram && (diagram.entities.length > 0 || diagram.relationships.length > 0);

  return (
    <div className="h-screen flex flex-col bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-13 bg-white/80 backdrop-blur-md border-b border-zinc-200/70 px-4 md:px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 -ml-1 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <FiLayers className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900 tracking-tight">Chen ERD</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                Studio
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {activeError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 text-rose-700 px-3 py-1 rounded-xl text-xs flex items-center gap-2 border border-rose-200/60 shadow-2xs"
            >
              <span className="font-bold text-rose-500">✕</span>
              <span className="font-medium truncate max-w-[180px] md:max-w-[320px]">{activeError}</span>
              <button
                onClick={() => setDismissedError(true)}
                className="ml-1 text-rose-400 hover:text-rose-700 font-bold"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </motion.div>
          )}

          {!hasDiagram && (
            <button
              onClick={handleLoadSample}
              className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-all active:scale-95"
            >
              Sample Data
            </button>
          )}

          <ExportMenu
            diagramRef={diagramRef}
            diagramData={diagram}
          />
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex relative overflow-hidden w-full h-[calc(100vh-52px)]">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: isMobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -420 : 0), opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`fixed lg:relative w-[85vw] max-w-[390px] lg:w-[390px] border-r border-zinc-200/70 bg-white/95 lg:bg-white/80 backdrop-blur-xl flex flex-col shadow-2xl lg:shadow-none z-40 h-[calc(100vh-52px)] ${
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

        {/* Canvas Workspace */}
        <div ref={diagramRef} className="flex-1 bg-[#f8fafc] relative overflow-hidden flex flex-col h-full">
          <MainContent
            diagram={diagram}
            isLoading={isLoading}
            onNodeSelect={setSelectedNode}
            onDiagramUpdate={updateDiagram}
            onLoadSample={handleLoadSample}
            showGrid={showGrid}
            showMinimap={showMinimap}
          />

          {/* Floating Toolbar Dock at bottom center */}
          {hasDiagram && (
            <Toolbar
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitView={handleFitView}
              onToggleGrid={handleToggleGrid}
              onClearCanvas={handleClearCanvas}
              onAutoLayout={applyAutoLayout}
              onToggleMinimap={handleToggleMinimap}
              showGrid={showGrid}
              showMinimap={showMinimap}
              zoom={zoomLevel}
            />
          )}
        </div>

        {/* Right Properties Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed right-0 top-13 lg:relative lg:top-0 w-80 max-w-[85vw] border-l border-zinc-200/70 bg-white/95 lg:bg-white/90 backdrop-blur-xl shadow-2xl lg:shadow-none z-30 h-[calc(100vh-52px)]"
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
