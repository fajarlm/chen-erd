import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlowProvider, type Node } from 'reactflow';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import PropertiesPanel from './components/Layout/PropertiesPanel';
import Toolbar from './components/UI/Toolbar';
import ExportMenu from './components/UI/ExportMenu';
import { useDiagramState } from './hooks/useDiagramState';

function App() {
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
  const [zoom, setZoom] = useState(1);
  
  const diagramRef = useRef<HTMLDivElement>(null);

  // Toolbar handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  }, []);

  const handleFitView = useCallback(() => {
    // Fit view logic
    setZoom(1);
  }, []);

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
    // Add entity logic
    console.log('Add entity clicked');
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex bg-zinc-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: isMobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -400 : 0), opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`absolute lg:relative w-[85vw] max-w-[380px] lg:w-96 border-r border-zinc-200/70 bg-white/95 lg:bg-white/80 backdrop-blur-xl flex flex-col shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 h-full ${isMobileMenuOpen ? 'left-0' : '-left-full lg:left-0'}`}
        >
          <div className="lg:hidden p-4 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="font-semibold text-zinc-800">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <Sidebar
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            onSQLExecute={generateFromSQL}
            onFormSubmit={generateFromTables}
            isLoading={isLoading}
            diagram={diagram}
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden w-full">
          {/* Header */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="bg-white/70 backdrop-blur-lg border-b border-zinc-200/70 px-4 md:px-8 py-3 md:py-4 z-10 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 tracking-tight">
                  Chen ERD Generator
                </h1>
                <p className="text-xs md:text-sm text-zinc-500 mt-0.5 font-medium hidden sm:block">
                  Design modern entity-relationship diagrams seamlessly
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 self-end md:self-auto">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-rose-50 text-rose-600 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 shadow-sm border border-rose-100"
                >
                  <span className="font-semibold">!</span>
                  <span className="font-medium truncate max-w-[150px] md:max-w-[300px]">{error}</span>
                  <button
                    onClick={() => {}}
                    className="ml-1 md:ml-2 text-rose-400 hover:text-rose-700 transition-colors"
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
            zoom={zoom}
          />

          {/* Canvas */}
          <div ref={diagramRef} className="flex-1 bg-[#FAFAFA] relative">
            <MainContent
              diagram={diagram}
              isLoading={isLoading}
              onNodeSelect={setSelectedNode}
              onDiagramUpdate={updateDiagram}
            />
          </div>
        </div>

        {/* Right Properties Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute right-0 lg:relative w-80 max-w-[85vw] border-l border-zinc-200/70 bg-white/95 lg:bg-white/90 backdrop-blur-xl shadow-[-4px_0_24px_rgba(0,0,0,0.1)] lg:shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-30 h-full"
            >
              <PropertiesPanel
                key={selectedNode.id} // Add key to force remount when selectedNode changes
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onUpdate={(updatedNode) => {
                  console.log('Node updated:', updatedNode);
                  // Implement node update logic
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ReactFlowProvider>
  );
}

export default App;