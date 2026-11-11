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
} from 'react-icons/fi';
import { ExportService } from '../../services/exportService';
import type { ChenDiagram } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';

interface ExportMenuProps {
  diagramRef: React.RefObject<HTMLDivElement>;
  diagramData: ChenDiagram | null;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ diagramRef, diagramData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

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
      description: 'High-quality image',
    },
    {
      format: 'svg' as const,
      icon: FiFile,
      label: 'Export as SVG',
      description: 'Scalable vector graphic',
    },
    {
      format: 'pdf' as const,
      icon: FiFileText,
      label: 'Export as PDF',
      description: 'Document format',
    },
    {
      format: 'json' as const,
      icon: FiCode,
      label: 'Export as JSON',
      description: 'Schema definition',
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold transition-all cursor-pointer
          ${
            isNeo
              ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
              : isOpen
              ? 'bg-zinc-900 text-white rounded-xl shadow-xs'
              : 'bg-white text-zinc-700 border border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-950 rounded-xl shadow-2xs active:scale-95'
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
            className={`
              absolute top-12 right-0 px-3.5 py-2 flex items-center space-x-2 z-[60] min-w-max text-xs
              ${
                isNeo
                  ? 'bg-[#FFE600] text-black border-2 border-black font-black shadow-[3px_3px_0px_#000]'
                  : 'bg-zinc-900 text-white rounded-xl shadow-lg border border-zinc-800 font-medium'
              }
            `}
          >
            <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Exported successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`
              absolute top-full mt-2 right-0 w-64 z-50 overflow-hidden
              ${
                isNeo
                  ? 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]'
                  : 'bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200/70'
              }
            `}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-3 border-b ${isNeo ? 'border-black bg-[#A6FAFF]' : 'border-zinc-100 bg-zinc-50/60'}`}>
              <h3 className="font-bold text-xs text-zinc-900">Export Diagram</h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full text-zinc-500 hover:text-zinc-900 ${isNeo ? 'hover:bg-black/10' : 'hover:bg-zinc-200/50'}`}
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Options */}
            <div className="p-1.5 space-y-1">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={exporting !== null}
                  className={`
                    w-full flex items-center p-2.5 transition-all text-left
                    ${
                      isNeo
                        ? 'border border-transparent hover:border-black hover:bg-[#FFE600] font-bold text-black active:translate-x-[1px]'
                        : 'rounded-xl hover:bg-zinc-100/80 active:scale-[0.98]'
                    }
                    ${exporting === option.format ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`p-2 mr-3 ${isNeo ? 'border border-black bg-white shadow-[1px_1px_0px_#000]' : 'rounded-lg bg-zinc-100 text-zinc-700'}`}>
                    <option.icon className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-bold text-xs text-zinc-900">
                      {option.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium">
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;
