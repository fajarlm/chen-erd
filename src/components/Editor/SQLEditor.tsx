import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { FiCode } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

interface SQLEditorProps {
  onExecute: (sql: string) => void;
  isLoading?: boolean;
}

const TEMPLATES = [
  {
    name: 'E-Commerce',
    sql: `-- E-Commerce Schema
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
);`,
  },
  {
    name: 'Blog & Posts',
    sql: `-- Blog Schema
CREATE TABLE authors (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  bio TEXT
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  title VARCHAR(200),
  content TEXT,
  author_id INT REFERENCES authors(id)
);

CREATE TABLE comments (
  id INT PRIMARY KEY,
  post_id INT REFERENCES posts(id),
  author_name VARCHAR(100),
  comment_text TEXT
);`,
  },
  {
    name: 'University',
    sql: `-- University Schema
CREATE TABLE departments (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE instructors (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  department_id INT REFERENCES departments(id)
);

CREATE TABLE courses (
  id INT PRIMARY KEY,
  title VARCHAR(100),
  credits INT,
  instructor_id INT REFERENCES instructors(id)
);

CREATE TABLE students (
  id INT PRIMARY KEY,
  full_name VARCHAR(100),
  major VARCHAR(50)
);

CREATE TABLE enrollments (
  student_id INT REFERENCES students(id),
  course_id INT REFERENCES courses(id),
  grade VARCHAR(5),
  PRIMARY KEY (student_id, course_id)
);`,
  },
];

const SQLEditor: React.FC<SQLEditorProps> = ({ onExecute, isLoading }) => {
  const [code, setCode] = useState<string>(TEMPLATES[0].sql);

  const handleExecute = () => {
    onExecute(code);
  };

  const loadTemplate = (templateSql: string) => {
    setCode(templateSql);
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col h-full bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-col gap-2 p-3.5 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FiCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-zinc-900 tracking-tight">SQL Schema Editor</h3>
              <p className="text-[10px] text-zinc-500">Paste or write DDL statements</p>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-black text-white px-3.5 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 text-xs font-semibold shadow-xs"
          >
            <HiSparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isLoading ? 'Generating...' : 'Generate ERD'}</span>
          </button>
        </div>

        {/* Template pills */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Samples:</span>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              onClick={() => loadTemplate(tmpl.sql)}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-zinc-200/70 text-zinc-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-2xs"
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-[340px]">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
          }}
        />
      </div>
    </motion.div>
  );
};

export default SQLEditor;
