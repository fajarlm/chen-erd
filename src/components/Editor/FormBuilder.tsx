import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ParsedTable, TableColumn } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { FiTrash2, FiPlus } from 'react-icons/fi';

interface FormBuilderProps {
  onSubmit: (tables: ParsedTable[]) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onSubmit }) => {
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

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
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-5"
    >
      <div className={`pb-3 border-b ${isNeo ? 'border-black' : 'border-zinc-100'}`}>
        <h3 className={`text-xs uppercase tracking-wider ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-900'}`}>
          Visual ERD Builder
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">Define entities, attributes, and keys manually</p>
      </div>

      {/* Add Entity Box */}
      <div className={`p-3.5 transition-all ${isNeo ? 'border-2 border-black bg-white shadow-[2px_2px_0px_#000]' : 'border border-zinc-200/80 rounded-2xl bg-zinc-50/50 shadow-2xs'}`}>
        <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1.5 ${isNeo ? 'text-black' : 'text-zinc-500'}`}>
          New Entity
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentTable}
            onChange={(e) => setCurrentTable(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTable(); }}
            className={`
              flex-1 px-3 py-1.5 text-xs bg-white transition-all outline-none
              ${
                isNeo
                  ? 'border-2 border-black font-bold text-black focus:bg-[#FFE600]/20'
                  : 'border border-zinc-200 rounded-xl focus:border-zinc-800 text-zinc-800'
              }
            `}
            placeholder="Entity name (e.g. Employee)"
          />
          <button
            onClick={addTable}
            className={`
              px-3.5 py-1.5 text-xs flex items-center gap-1 transition-all
              ${
                isNeo
                  ? 'border-2 border-black bg-[#FFE600] text-black font-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                  : 'bg-zinc-900 hover:bg-black text-white font-semibold rounded-xl shadow-2xs active:scale-95'
              }
            `}
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Existing Entities */}
      <div className="space-y-3.5">
        {tables.map((table, tableIndex) => (
          <div
            key={tableIndex}
            className={`
              p-3.5 transition-all
              ${
                isNeo
                  ? 'border-2 border-black bg-white shadow-[3px_3px_0px_#000]'
                  : 'border border-zinc-200/80 rounded-2xl bg-white shadow-2xs'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2.5">
              <h4 className={`text-xs uppercase flex items-center gap-2 ${isNeo ? 'font-black text-black' : 'font-bold text-zinc-900'}`}>
                <div className={`w-2 h-2 ${isNeo ? 'bg-black' : 'bg-blue-600 rounded-full'}`} />
                <span>{table.name}</span>
              </h4>
              <button
                onClick={() => removeTable(tableIndex)}
                className={`p-1 transition-colors ${isNeo ? 'text-black hover:text-rose-600' : 'text-zinc-400 hover:text-rose-600'}`}
                title="Delete entity"
                aria-label={`Delete entity ${table.name}`}
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Columns List */}
            {table.columns.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {table.columns.map((col, colIndex) => (
                  <div
                    key={colIndex}
                    className={`
                      flex items-center justify-between text-xs p-2 transition-all group
                      ${
                        isNeo
                          ? 'border border-black bg-[#fafafa]'
                          : 'rounded-xl bg-zinc-50 border border-zinc-100'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`${col.isPrimaryKey ? 'underline underline-offset-2 font-bold' : 'font-medium'} ${isNeo ? 'text-black' : 'text-zinc-800'}`}>
                        {col.name}
                      </span>
                      {col.isPrimaryKey && (
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 ${isNeo ? 'border border-black bg-[#FFE600] text-black' : 'bg-emerald-50 text-emerald-700 rounded'}`}>
                          PK
                        </span>
                      )}
                      {col.isForeignKey && (
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 ${isNeo ? 'border border-black bg-[#A6FAFF] text-black' : 'bg-indigo-50 text-indigo-700 rounded'}`}>
                          FK
                        </span>
                      )}
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
                      className="text-zinc-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                      aria-label="Remove attribute"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Attribute Inputs */}
            <div className={`pt-2.5 space-y-2 border-t ${isNeo ? 'border-black' : 'border-zinc-100'}`}>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={currentColumn.name}
                  onChange={(e) => setCurrentColumn({ ...currentColumn, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') addColumn(table.name); }}
                  className={`
                    w-full px-2.5 py-1.5 text-xs bg-white outline-none
                    ${
                      isNeo
                        ? 'border border-black font-medium text-black focus:bg-[#FFE600]/20'
                        : 'border border-zinc-200 rounded-xl text-zinc-800 focus:border-zinc-800'
                    }
                  `}
                  placeholder="Attribute name"
                />
                <select
                  value={currentColumn.type}
                  onChange={(e) => setCurrentColumn({ ...currentColumn, type: e.target.value })}
                  className={`
                    w-full px-2 py-1.5 text-xs bg-white outline-none
                    ${
                      isNeo
                        ? 'border border-black font-medium text-black'
                        : 'border border-zinc-200 rounded-xl text-zinc-800'
                    }
                  `}
                >
                  <option>VARCHAR(255)</option>
                  <option>INT</option>
                  <option>TEXT</option>
                  <option>BOOLEAN</option>
                  <option>DATE</option>
                  <option>DECIMAL</option>
                </select>
              </div>

              <div className="flex gap-4 px-0.5 text-xs">
                <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentColumn.isPrimaryKey}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, isPrimaryKey: e.target.checked })}
                    className="accent-black cursor-pointer"
                  />
                  <span>Primary Key</span>
                </label>
                <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentColumn.isForeignKey}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, isForeignKey: e.target.checked })}
                    className="accent-black cursor-pointer"
                  />
                  <span>Foreign Key</span>
                </label>
              </div>

              {currentColumn.isForeignKey && (
                <div>
                  <select
                    className={`w-full px-2 py-1.5 text-xs bg-white ${isNeo ? 'border border-black font-medium text-black' : 'border border-zinc-200 rounded-xl'}`}
                    onChange={(e) => {
                      const [refTable, refColumn] = e.target.value.split('.');
                      setCurrentColumn({
                        ...currentColumn,
                        references: { table: refTable, column: refColumn }
                      });
                    }}
                  >
                    <option value="">Select referenced entity.attribute</option>
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
                className={`
                  w-full py-1.5 text-xs font-bold transition-all
                  ${
                    isNeo
                      ? 'border border-black bg-[#A6FAFF] text-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px]'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl'
                  }
                `}
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
          className={`
            w-full py-2.5 text-xs transition-all sticky bottom-4
            ${
              isNeo
                ? 'border-2 border-black bg-[#FFE600] text-black font-black shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs active:scale-[0.98]'
            }
          `}
        >
          Generate Chen ERD ({tables.length} {tables.length === 1 ? 'Entity' : 'Entities'})
        </button>
      )}
    </motion.div>
  );
};

export default FormBuilder;
