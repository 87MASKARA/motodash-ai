import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang, currentLangInfo, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`rounded-xl font-racing font-bold bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 hover:border-amber-500/50 flex items-center gap-1 sm:gap-1.5 transition shadow-sm ${
          compact ? 'px-2 py-1.5 text-[10px] sm:text-[11px]' : 'px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs'
        }`}
        title="Cambiar idioma / Change language"
      >
        <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0 hidden sm:inline" />
        <span className="text-xs sm:text-sm leading-none">{currentLangInfo.flag}</span>
        <span className="font-mono font-bold tracking-wider">{currentLangInfo.short}</span>
        <ChevronDown
          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/90 shadow-2xl shadow-black/80 py-1.5 z-50 animate-fadeIn">
          <div className="px-3 py-1.5 border-b border-neutral-800 text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex items-center justify-between">
            <span>Global Language</span>
            <Globe className="w-3 h-3 text-amber-400" />
          </div>

          <div className="py-1">
            {languages.map((item) => {
              const isSelected = item.code === lang;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLang(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 font-bold'
                      : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div>
                      <div className="text-xs font-racing tracking-wide leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[9px] font-mono text-neutral-500">
                        {item.region}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

