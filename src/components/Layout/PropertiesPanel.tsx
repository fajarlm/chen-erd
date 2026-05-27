import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { type Node } from 'reactflow';

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
  const [cardinality, setCardinality] = useState('');

  useEffect(() => {
    if (node) {
      setLabel(node.data?.label || '');
      setCardinality(node.data?.cardinality || '');
    }
  }, [node]);

  const handleUpdate = () => {
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
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
        <h3 className="font-semibold text-zinc-800">Properties</h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-zinc-100 text-zinc-500 rounded-full transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Type
          </label>
          <div className="px-3 py-2 bg-zinc-100/80 rounded-lg text-sm capitalize font-medium text-zinc-700 border border-zinc-200/50">
            {node.type}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {node.type === 'relationship' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Cardinality
            </label>
            <select
              value={cardinality}
              onChange={(e) => setCardinality(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all shadow-sm"
            >
              <option value="1">1</option>
              <option value="N">N</option>
              <option value="M">M</option>
            </select>
          </div>
        )}

        <div className="pt-4 mt-auto">
          <button
            onClick={handleUpdate}
            className="w-full bg-zinc-800 text-white py-2.5 rounded-xl font-medium hover:bg-zinc-900 active:scale-[0.98] transition-all shadow-md shadow-zinc-900/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;