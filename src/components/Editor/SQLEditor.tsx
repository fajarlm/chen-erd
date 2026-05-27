import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';

interface SQLEditorProps {
  onExecute: (sql: string) => void;
  isLoading?: boolean;
}

const SQLEditor: React.FC<SQLEditorProps> = ({ onExecute, isLoading }) => {
  const [code, setCode] = useState<string>(`-- Enter your SQL here\n\nCREATE TABLE users (\n  id INT PRIMARY KEY,\n  username VARCHAR(50),\n  email VARCHAR(100)\n);\n\nCREATE TABLE posts (\n  id INT PRIMARY KEY,\n  title VARCHAR(200),\n  content TEXT,\n  user_id INT REFERENCES users(id)\n);`);

  const handleExecute = () => {
    onExecute(code);
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white/50 backdrop-blur-sm">
        <h3 className="font-semibold text-zinc-800">SQL Editor</h3>
        <button
          onClick={handleExecute}
          disabled={isLoading}
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-900 transition-all active:scale-95 disabled:opacity-50 text-sm font-medium shadow-md shadow-zinc-900/10"
        >
          {isLoading ? 'Parsing...' : 'Generate ERD'}
        </button>
      </div>
      
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </motion.div>
  );
};

export default SQLEditor;