import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUploadCloud } from 'react-icons/fi';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad }) => {
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
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="mt-6"
    >
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200 group
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50/50' 
            : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-100/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4 border border-zinc-100 group-hover:scale-110 transition-transform">
          <FiUploadCloud className={`text-xl ${isDragActive ? 'text-indigo-500' : 'text-zinc-400'}`} />
        </div>
        {isDragActive ? (
          <p className="text-indigo-600 font-medium">Drop your SQL file here...</p>
        ) : (
          <div>
            <p className="text-zinc-700 font-medium">
              Drag & drop a .sql file here
            </p>
            <p className="text-xs text-zinc-500 mt-1.5">
              or click to browse from your computer
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FileUpload;