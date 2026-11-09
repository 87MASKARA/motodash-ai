import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './translations';

const LanguageContext = createContext(null);

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem('motodash_lang');
    if (saved && TRANSLATIONS[saved]) return saved;

    const browserLang = (navigator.language || 'es').slice(0, 2).toLowerCase();
    if (TRANSLATIONS[browserLang]) return browserLang;
  } catch (e) {}
  return 'es';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLanguage);

  const setLang = (nextLang) => {
    if (!TRANSLATIONS[nextLang]) return;
    setLangState(nextLang);
    try {
      localStorage.setItem('motodash_lang', nextLang);
    } catch (e) {}
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const dictionary = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.es, [lang]);

  const currentLangInfo = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0],
    [lang]
  );

  const t = (path, vars = {}) => {
    const parts = path.split('.');
    let val = dictionary;
    for (const part of parts) {
      val = val?.[part];
    }
    if (typeof val !== 'string') {
      // Fallback to Spanish dictionary
      let fallback = TRANSLATIONS.es;
      for (const part of parts) {
        fallback = fallback?.[part];
      }
      val = typeof fallback === 'string' ? fallback : path;
    }
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
      val
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        dictionary,
        currentLangInfo,
        languages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

