import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDownload,
  FiImage,
  FiFile,
  FiFileText,
  FiCode,
  FiX,
  FiCheck,
  FiCopy,
} from 'react-icons/fi';
import { ExportService } from '../../services/exportService';
import type { ChenDiagram } from '../../types';

interface ExportMenuProps {
  diagramRef: React.RefObject<HTMLDivElement>;
  diagramData: ChenDiagram | null;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ diagramRef, diagramData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'json') => {
    if (!diagramRef.current && format !== 'json') return;
    
    setExporting(format);
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      switch (format) {
        case 'png':
          await ExportService.exportAsPNG(
            diagramRef.current!,
            `chen-erd-${timestamp}.png`
          );
          break;
        case 'svg':
          await ExportService.exportAsSVG(
            diagramRef.current!,
            `chen-erd-${timestamp}.svg`
          );
          break;
        case 'pdf':
          await ExportService.exportAsPDF(
            diagramRef.current!,
            `chen-erd-${timestamp}.pdf`
          );
          break;
        case 'json':
          ExportService.exportAsJSON(
            diagramData,
            `chen-schema-${timestamp}.json`
          );
          break;
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      format: 'png' as const,
      icon: FiImage,
      label: 'Export as PNG',
      description: 'High-quality raster image',
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
    },
    {
      format: 'svg' as const,
      icon: FiFile,
      label: 'Export as SVG',
      description: 'Scalable vector graphic',
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50',
    },
    {
      format: 'pdf' as const,
      icon: FiFileText,
      label: 'Export as PDF',
      description: 'Portable document format',
      color: 'text-red-600',
      bgColor: 'hover:bg-red-50',
    },
    {
      format: 'json' as const,
      icon: FiCode,
      label: 'Export as JSON',
      description: 'Schema definition file',
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50',
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-xl
          transition-all duration-200 font-semibold text-xs
          ${isOpen
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'bg-white text-zinc-700 border border-zinc-200/80 hover:bg-zinc-50 shadow-2xs'
          }
        `}
      >
        <FiDownload className="w-3.5 h-3.5" />
        <span>Export</span>
      </button>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-14 right-0 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-zinc-900/20 flex items-center space-x-2.5 z-[60] min-w-max border border-zinc-800"
          >
            <div className="bg-green-500/20 text-green-400 p-1 rounded-full">
              <FiCheck className="w-3 h-3" />
            </div>
            <span className="text-sm font-medium">Exported successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-14 right-0 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-zinc-200/50 border border-zinc-200/70 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-semibold text-zinc-800">Export Diagram</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-zinc-200/50 rounded-full text-zinc-500 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Export Options */}
            <div className="p-2">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={exporting !== null}
                  className={`
                    w-full flex items-center p-3 rounded-xl transition-all duration-200 mb-1 border border-transparent
                    ${exporting === option.format ? 'opacity-50 grayscale' : 'hover:border-zinc-200 hover:shadow-sm hover:bg-white active:scale-[0.98]'}
                  `}
                >
                  <div className={`p-2.5 rounded-xl ${option.color.replace('text-', 'bg-').replace('-600', '-50')} text-${option.color.split('-')[1]}-600 mr-3.5 ring-1 ring-inset ring-${option.color.split('-')[1]}-500/10`}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-zinc-800 text-sm">
                      {option.label}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-medium mt-0.5">
                      {option.description}
                    </div>
                  </div>

                  {exporting === option.format && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-200 border-t-zinc-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Copy to Clipboard */}
            <div className="p-2 border-t border-zinc-100 bg-zinc-50/50">
              <button
                onClick={() => {
                  const jsonString = JSON.stringify(diagramData, null, 2);
                  navigator.clipboard.writeText(jsonString);
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 2000);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 p-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200/60 rounded-xl transition-all duration-200 shadow-sm"
              >
                <FiCopy className="w-3.5 h-3.5" />
                <span>Copy JSON to Clipboard</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;