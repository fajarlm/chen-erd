import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ParsedTable, TableColumn } from '../../types';

interface FormBuilderProps {
  onSubmit: (tables: ParsedTable[]) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onSubmit }) => {
  const [tables, setTables] = useState<ParsedTable[]>([]);
  const [currentTable, setCurrentTable] = useState<string>('');
  const [currentColumn, setCurrentColumn] = useState<TableColumn>({
    name: '',
    type: 'VARCHAR(255)',
    isPrimaryKey: false,
    isForeignKey: false,
  });

  const addTable = () => {
    if (!currentTable.trim()) return;
    
    // Avoid duplicate table names
    if (tables.some(t => t.name.toLowerCase() === currentTable.trim().toLowerCase())) {
      alert('An entity with this name already exists.');
      return;
    }

    setTables([...tables, {
      name: currentTable.trim(),
      columns: [],
      isJunctionTable: false,
    }]);
    setCurrentTable('');
  };

  const removeTable = (tableIndex: number) => {
    setTables(tables.filter((_, idx) => idx !== tableIndex));
  };

  const addColumn = (tableName: string) => {
    if (!currentColumn.name.trim()) return;

    setTables(tables.map(table => {
      if (table.name === tableName) {
        return {
          ...table,
          columns: [...table.columns, { ...currentColumn, name: currentColumn.name.trim() }],
        };
      }
      return table;
    }));

    setCurrentColumn({
      name: '',
      type: 'VARCHAR(255)',
      isPrimaryKey: false,
      isForeignKey: false,
    });
  };

  const generateERD = () => {
    if (tables.length === 0) {
      alert('Please add at least one entity before generating the diagram.');
      return;
    }
    onSubmit(tables);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-6"
    >
      <div className="border-b border-zinc-100 pb-3">
        <h3 className="font-semibold text-zinc-800">Visual Builder</h3>
        <p className="text-xs text-zinc-500 mt-1">Create entities and attributes manually without writing SQL.</p>
      </div>

      {/* Add Table */}
      <div className="space-y-2 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">New Entity</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentTable}
            onChange={(e) => setCurrentTable(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTable(); }}
            className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all bg-white"
            placeholder="Entity name (e.g. Users, Orders)"
          />
          <button
            onClick={addTable}
            className="bg-zinc-800 text-white w-20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-900 transition-colors shadow-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Existing Tables */}
      <div className="space-y-4">
        {tables.map((table, tableIndex) => (
          <div key={tableIndex} className="border border-zinc-200/80 rounded-xl p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-zinc-800 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                {table.name}
              </h4>
              <button
                onClick={() => removeTable(tableIndex)}
                className="text-zinc-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                title="Delete entity"
                aria-label={`Delete entity ${table.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            {/* Columns */}
            {table.columns.length > 0 && (
              <div className="space-y-2 mb-4">
                {table.columns.map((col, colIndex) => (
                  <div key={colIndex} className="flex items-center justify-between text-sm bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 group">
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-zinc-700">{col.name}</span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-200/50 px-1.5 py-0.5 rounded uppercase">{col.type.split('(')[0]}</span>
                      {col.isPrimaryKey && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">PK</span>}
                      {col.isForeignKey && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">FK</span>}
                    </span>
                    <button
                      onClick={() => {
                        setTables(tables.map(t => {
                          if (t.name === table.name) {
                            return {
                              ...t,
                              columns: t.columns.filter((_, i) => i !== colIndex),
                            };
                          }
                          return t;
                        }));
                      }}
                      className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove attribute"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Column Form */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={currentColumn.name}
                  onChange={(e) => setCurrentColumn({ ...currentColumn, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') addColumn(table.name); }}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all bg-white"
                  placeholder="Attribute name"
                />
                <select
                  value={currentColumn.type}
                  onChange={(e) => setCurrentColumn({ ...currentColumn, type: e.target.value })}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all"
                >
                  <option>VARCHAR(255)</option>
                  <option>INT</option>
                  <option>TEXT</option>
                  <option>BOOLEAN</option>
                  <option>DATE</option>
                  <option>TIMESTAMP</option>
                  <option>FLOAT</option>
                  <option>DECIMAL</option>
                </select>
              </div>
              <div className="flex gap-4 px-1">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentColumn.isPrimaryKey}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, isPrimaryKey: e.target.checked })}
                    className="rounded border-zinc-300 text-zinc-800 focus:ring-zinc-800"
                  />
                  Primary Key
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentColumn.isForeignKey}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, isForeignKey: e.target.checked })}
                    className="rounded border-zinc-300 text-zinc-800 focus:ring-zinc-800"
                  />
                  Foreign Key
                </label>
              </div>
              {currentColumn.isForeignKey && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">References</label>
                  <select
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all"
                    onChange={(e) => {
                      const [refTable, refColumn] = e.target.value.split('.');
                      setCurrentColumn({
                        ...currentColumn,
                        references: { table: refTable, column: refColumn }
                      });
                    }}
                  >
                    <option value="">Select reference</option>
                    {tables.map(t => 
                      t.columns.map(c => 
                        <option key={`${t.name}.${c.name}`} value={`${t.name}.${c.name}`}>
                          {t.name}.{c.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}
              <button
                onClick={() => addColumn(table.name)}
                className="w-full bg-zinc-100 text-zinc-700 font-medium py-2 rounded-lg text-sm hover:bg-zinc-200 transition-colors"
              >
                + Add Attribute
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length > 0 && (
        <button
          onClick={generateERD}
          className="w-full bg-zinc-800 text-white py-3 rounded-xl font-medium hover:bg-zinc-900 active:scale-[0.98] transition-all shadow-md shadow-zinc-900/20 sticky bottom-4"
        >
          Generate Chen ERD ({tables.length} {tables.length === 1 ? 'Entity' : 'Entities'})
        </button>
      )}
    </motion.div>
  );
};

export default FormBuilder;
