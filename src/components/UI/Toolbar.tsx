import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiZoomIn,
    FiZoomOut,
    FiMaximize,
    FiGrid,
    FiTrash2,
    FiCopy,
    FiRotateCw,
    FiPlus,
    FiMinus,
    FiSettings,
} from 'react-icons/fi';

interface ToolbarProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFitView: () => void;
    onToggleGrid: () => void;
    onClearCanvas: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onAddEntity?: () => void;
    showGrid: boolean;
    zoom: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onZoomIn,
    onZoomOut,
    onFitView,
    onToggleGrid,
    onClearCanvas,
    onUndo,
    onRedo,
    onAddEntity,
    showGrid,
    zoom,
}) => {
    const [showTooltips, setShowTooltips] = useState(true);

    const tools = [
        {
            icon: FiPlus,
            label: 'Add Entity',
            action: onAddEntity,
            shortcut: 'Ctrl+A',
            color: 'text-green-600 hover:bg-green-50',
        },
        {
            icon: FiZoomIn,
            label: 'Zoom In',
            action: onZoomIn,
            shortcut: 'Ctrl++',
            color: 'text-blue-600 hover:bg-blue-50',
        },
        {
            icon: FiZoomOut,
            label: 'Zoom Out',
            action: onZoomOut,
            shortcut: 'Ctrl+-',
            color: 'text-blue-600 hover:bg-blue-50',
        },
        {
            icon: FiMaximize,
            label: 'Fit View',
            action: onFitView,
            shortcut: 'Ctrl+F',
            color: 'text-gray-600 hover:bg-gray-50',
        },
        {
            icon: FiGrid,
            label: 'Toggle Grid',
            action: onToggleGrid,
            shortcut: 'Ctrl+G',
            color: showGrid ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-600 hover:bg-gray-50',
        },
        {
            icon: FiRotateCw,
            label: 'Undo',
            action: onUndo,
            shortcut: 'Ctrl+Z',
            color: 'text-gray-600 hover:bg-gray-50',
        },
        {
            icon: FiCopy,
            label: 'Redo',
            action: onRedo,
            shortcut: 'Ctrl+Y',
            color: 'text-gray-600 hover:bg-gray-50',
        },
        {
            icon: FiTrash2,
            label: 'Clear Canvas',
            action: onClearCanvas,
            shortcut: 'Del',
            color: 'text-red-600 hover:bg-red-50',
        },
    ];

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border-b shadow-sm"
        >
            <div className="px-4 py-2">
                <div className="flex items-center justify-between">
                    {/* Left tools */}
                    <div className="flex items-center space-x-1">
                        {tools.map((tool, index) => (
                            <div key={index} className="relative group">
                                <button
                                    onClick={tool.action}
                                    disabled={!tool.action}
                                    className={`p-2 rounded-lg transition-colors duration-200 ${tool.color
                                        } ${!tool.action ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={tool.label}
                                >
                                    <tool.icon className="w-5 h-5" />
                                </button>

                                {/* Tooltip */}
                                {showTooltips && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {tool.label}
                                        {tool.shortcut && (
                                            <span className="ml-1 text-gray-400">({tool.shortcut})</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Center info */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FiSettings className="w-4 h-4" />
                            <span>Zoom: {Math.round(zoom * 100)}%</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300" />
                        <div className="text-sm text-gray-600">
                            {showGrid ? 'Grid: On' : 'Grid: Off'}
                        </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowTooltips(!showTooltips)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${showTooltips
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {showTooltips ? 'Hide Tips' : 'Show Tips'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-4 py-1.5 bg-gray-50 border-t">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>💡 Tip: Drag nodes to rearrange</span>
                    <span>•</span>
                    <span>🖱 Scroll to zoom</span>
                    <span>•</span>
                    <span>🔄 Right-click for context menu</span>
                    <span>•</span>
                    <span>⌨ Ctrl+C/V to copy/paste</span>
                </div>
            </div>
        </motion.div>
    );
};

export default Toolbar;