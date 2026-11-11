import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUploadCloud } from 'react-icons/fi';
import { useAppTheme } from '../../context/ThemeContext';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad }) => {
  const { theme } = useAppTheme();
  const isNeo = theme === 'neobrutalism';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        onFileLoad(content);
      };
      reader.readAsText(file);
    });
  }, [onFileLoad]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/sql': ['.sql'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
  });

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="mt-2"
    >
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-150
          ${
            isNeo
              ? isDragActive
                ? 'border-black bg-[#FFE600] shadow-[3px_3px_0px_#000]'
                : 'border-black bg-white hover:bg-[#FFE600]/10 shadow-[2px_2px_0px_#000]'
              : isDragActive 
              ? 'border-indigo-500 bg-indigo-50/50 rounded-2xl' 
              : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-100/50 rounded-2xl'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className={`w-10 h-10 flex items-center justify-center mx-auto mb-2.5 ${isNeo ? 'border-2 border-black bg-[#A6FAFF] shadow-[2px_2px_0px_#000]' : 'rounded-full bg-white shadow-2xs border border-zinc-100'}`}>
          <FiUploadCloud className={`text-lg ${isNeo ? 'text-black' : 'text-zinc-500'}`} />
        </div>
        <p className={`text-xs ${isNeo ? 'font-black text-black' : 'font-semibold text-zinc-700'}`}>
          {isDragActive ? 'Drop the .sql file here...' : 'Choose or drop a .sql file'}
        </p>
        <p className="text-[10px] text-zinc-400 mt-1">
          Supports PostgreSQL, MySQL & SQLite DDL
        </p>
      </div>
    </motion.div>
  );
};

export default FileUpload;
