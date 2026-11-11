import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { type Node } from 'reactflow';
import { useAppTheme } from '../../context/ThemeContext';

interface PropertiesPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (node: Node) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  node,
  onClose,
  onUpdate,
}) => {
  const [label, setLabel] = useState('');
  const [cardinality, setCardinality] = useState('1');
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  useEffect(() => {
    if (node) {
      setLabel(node.data?.label || '');
      setCardinality(node.data?.cardinality || '1');
    }
  }, [node]);

  const handleUpdate = () => {
    if (!node) return;
    onUpdate({
      ...node,
      data: {
        ...node.data,
        label,
        cardinality,
      },
    });
  };

  if (!node) return null;

  return (
    <div className={`p-4 h-full flex flex-col ${isNeo ? 'bg-white' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between pb-3 mb-4 border-b ${isNeo ? 'border-black' : 'border-zinc-100'}`}>
        <h3 className={`text-xs uppercase tracking-wider ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-900'}`}>
          Properties
        </h3>
        <button
          onClick={onClose}
          className={`p-1 transition-all ${isNeo ? 'border border-black bg-white hover:bg-[#FF90E8] shadow-[1px_1px_0px_#000]' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-lg'}`}
          aria-label="Close panel"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* Symbol Type */}
        <div>
          <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${isNeo ? 'text-black' : 'text-zinc-400'}`}>
            Chen Symbol
          </label>
          <div
            className={`
              px-3 py-1.5 text-xs capitalize font-bold
              ${
                isNeo
                  ? 'border-2 border-black bg-[#A6FAFF] text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-zinc-100/90 rounded-xl text-zinc-800'
              }
            `}
          >
            {node.type === 'entity' && 'Entity (Rectangle)'}
            {node.type === 'attribute' && 'Attribute (Oval)'}
            {node.type === 'relationship' && 'Relationship (Diamond)'}
          </div>
        </div>

        {/* Name / Label */}
        <div>
          <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${isNeo ? 'text-black' : 'text-zinc-400'}`}>
            Label Name
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={`
              w-full px-3 py-2 text-xs outline-none transition-all
              ${
                isNeo
                  ? 'border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_#000] focus:bg-[#FFE600]/20'
                  : 'bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-800'
              }
            `}
          />
        </div>

        {/* Cardinality (for relationship) */}
        {node.type === 'relationship' && (
          <div>
            <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${isNeo ? 'text-black' : 'text-zinc-400'}`}>
              Cardinality
            </label>
            <select
              value={cardinality}
              onChange={(e) => setCardinality(e.target.value)}
              className={`
                w-full px-3 py-2 text-xs bg-white outline-none
                ${
                  isNeo
                    ? 'border-2 border-black font-bold text-black shadow-[2px_2px_0px_#000]'
                    : 'border border-zinc-200 rounded-xl text-zinc-900 focus:border-zinc-800'
                }
              `}
            >
              <option value="1">1 (One)</option>
              <option value="N">N (Many)</option>
              <option value="M">M (Many)</option>
            </select>
          </div>
        )}

        <div className="pt-4 mt-auto">
          <button
            onClick={handleUpdate}
            className={`
              w-full py-2.5 text-xs transition-all
              ${
                isNeo
                  ? 'border-2 border-black bg-[#FFE600] font-black text-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                  : 'bg-zinc-900 hover:bg-black text-white font-semibold rounded-xl shadow-xs active:scale-95'
              }
            `}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
