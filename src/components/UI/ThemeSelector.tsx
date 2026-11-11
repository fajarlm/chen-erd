import React, { useState, useRef, useEffect } from 'react';
import { useAppTheme, type AppTheme } from '../../context/ThemeContext';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { HiColorSwatch } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES: Array<{
  id: AppTheme;
  name: string;
  desc: string;
  previewClass: string;
}> = [
  {
    id: 'modern',
    name: 'Modern Clean',
    desc: 'Sleek, minimalist SaaS interface',
    previewClass: 'bg-white border border-zinc-300 shadow-xs',
  },
  {
    id: 'neobrutalism',
    name: 'Neobrutalism',
    desc: 'Bold borders & retro hard shadows',
    previewClass: 'bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_#000]',
  },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const isNeo = theme === 'neobrutalism';

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-all
          ${
            isNeo
              ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
              : 'bg-white text-zinc-700 border border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl shadow-2xs active:scale-95'
          }
        `}
        aria-label="Select theme"
      >
        <HiColorSwatch className={`w-3.5 h-3.5 ${isNeo ? 'text-black' : 'text-indigo-600'}`} />
        <span className="hidden sm:inline">{currentTheme.name}</span>
        <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`
              absolute right-0 top-full mt-2 w-56 z-50 overflow-hidden
              ${
                isNeo
                  ? 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]'
                  : 'bg-white/95 backdrop-blur-xl border border-zinc-200/80 rounded-2xl shadow-xl'
              }
            `}
          >
            <div className={`p-2.5 border-b ${isNeo ? 'border-black bg-[#FFE600]' : 'border-zinc-100 bg-zinc-50/60'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Choose Aesthetic</p>
            </div>

            <div className="p-1.5 space-y-1">
              {THEMES.map((item) => {
                const isSelected = item.id === theme;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTheme(item.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between p-2 text-left rounded-xl transition-all
                      ${
                        isSelected
                          ? isNeo
                            ? 'bg-black text-white font-bold'
                            : 'bg-indigo-50/80 text-indigo-900 font-semibold'
                          : isNeo
                          ? 'hover:bg-zinc-100 text-black font-bold'
                          : 'hover:bg-zinc-100 text-zinc-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-sm shrink-0 ${item.previewClass}`} />
                      <div>
                        <div className="text-xs leading-none">{item.name}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? (isNeo ? 'text-zinc-300' : 'text-indigo-600/70') : 'text-zinc-400'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <FiCheck className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
