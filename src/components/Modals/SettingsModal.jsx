import React, { useState, useEffect } from 'react';
import { 
  Settings, X, Download, Upload, Volume2, Globe, DollarSign, 
  Check, Database, Trash2, Languages, Lock
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function SettingsModal({
  isOpen,
  onClose,
  globalSettings = {},
  onSaveSettings,
  onExportBackup,
  onImportBackup,
  onResetFactory
}) {
  const { lang, setLang, languages, t } = useLanguage();
  const [unitSystem, setUnitSystem] = useState(globalSettings.unitSystem || 'metric'); // 'metric' | 'imperial'
  const [currency, setCurrency] = useState(globalSettings.currency || 'USD'); // 'USD' | 'COP' | 'EUR' | 'MXN' | 'BRL'
  const [soundEnabled, setSoundEnabled] = useState(globalSettings.soundEnabled !== false);
  const [wakeLockEnabled, setWakeLockEnabled] = useState(globalSettings.wakeLockEnabled !== false);
  const [checkpointPin, setCheckpointPin] = useState(() => {
    try {
      return localStorage.getItem('motodash_checkpoint_pin') || '1234';
    } catch {
      return '1234';
    }
  });

  useEffect(() => {
    if (isOpen) {
      try {
        setCheckpointPin(localStorage.getItem('motodash_checkpoint_pin') || '1234');
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanPin = checkpointPin.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleanPin.length === 4) {
      try {
        localStorage.setItem('motodash_checkpoint_pin', cleanPin);
      } catch {}
    }
    onSaveSettings({
      unitSystem,
      currency,
      soundEnabled,
      wakeLockEnabled,
      checkpointPin: cleanPin.length === 4 ? cleanPin : '1234'
    });
    onClose();
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Max file size: 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportBackup(json);
        onClose();
      } catch (err) {
        alert("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-white my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-black shadow-lg"
              style={{ backgroundColor: "var(--primary-accent)" }}
            >
              <Settings className="w-5 h-5 text-white drop-shadow" />
            </div>
            <div>
              <h3 className="text-base font-bold font-racing uppercase tracking-wider text-white">
                {t('settings.title')}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 my-5">
          {/* 0. Idioma de la Aplicación (Global) */}
          <div>
            <label className="text-xs font-racing uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              {t('settings.languageLabel')}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-mono text-xs">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`py-2 px-1 rounded-xl border text-center font-bold transition ${
                    lang === item.code
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="text-base leading-none mb-1">{item.flag}</div>
                  <div className="text-[10px] font-racing">{item.short}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Unidades de Medida */}
          <div>
            <label className="text-xs font-racing uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              {t('settings.unitSystemLabel')}
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`p-3 rounded-xl border text-left transition ${
                  unitSystem === 'metric'
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <div className="font-bold text-white text-sm">{t('settings.metricTitle')}</div>
                <span className="text-[10px] text-neutral-400">{t('settings.metricDesc')}</span>
              </button>

              <button
                type="button"
                onClick={() => setUnitSystem('imperial')}
                className={`p-3 rounded-xl border text-left transition ${
                  unitSystem === 'imperial'
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <div className="font-bold text-white text-sm">{t('settings.imperialTitle')}</div>
                <span className="text-[10px] text-neutral-400">{t('settings.imperialDesc')}</span>
              </button>
            </div>
          </div>

          {/* 2. Moneda de Costos */}
          <div>
            <label className="text-xs font-racing uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              {t('settings.currencyLabel')}
            </label>
            <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
              {[
                { code: "USD", symbol: "$ USD" },
                { code: "COP", symbol: "$ COP" },
                { code: "EUR", symbol: "€ EUR" },
                { code: "MXN", symbol: "$ MXN" },
                { code: "BRL", symbol: "R$ BRL" }
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={`py-2 px-1 rounded-xl border text-center font-bold transition ${
                    currency === c.code
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="text-xs">{c.code}</div>
                  <div className="text-[9px] text-neutral-500">{c.symbol}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Audio & Pantalla */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-neutral-400" />
                <span>{t('settings.soundLabel')}</span>
              </span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded border-neutral-700 text-amber-500 focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-neutral-200 cursor-pointer pt-2 border-t border-neutral-800/60">
              <span>{t('settings.wakeLockLabel')}</span>
              <input
                type="checkbox"
                checked={wakeLockEnabled}
                onChange={(e) => setWakeLockEnabled(e.target.checked)}
                className="rounded border-neutral-700 text-amber-500 focus:ring-0 w-4 h-4"
              />
            </label>

            <div className="flex items-center justify-between text-xs text-neutral-200 pt-2 border-t border-neutral-800/60">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>{lang === 'en' ? 'Officer Mode 4-Digit PIN' : 'PIN de 4 Dígitos (Modo Retén)'}</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={checkpointPin}
                onChange={(e) => setCheckpointPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="1234"
                className="w-24 bg-neutral-900 border border-amber-500/50 rounded-xl px-2.5 py-1 text-center font-mono font-bold text-xs text-amber-300 tracking-widest focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 4. Copia de Seguridad & Respaldo JSON */}
          <div>
            <label className="text-xs font-racing uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              {t('settings.backupLabel')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono font-bold text-neutral-200 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('settings.exportJson')}</span>
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono font-bold text-neutral-200 flex items-center justify-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('settings.importJson')}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono mt-1.5">
              {t('settings.backupDesc')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => {
              if (confirm(t('settings.resetConfirm'))) {
                onResetFactory();
                onClose();
              }
            }}
            className="text-[11px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('settings.resetFactory')}</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl font-bold font-racing text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            >
              {t('settings.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2 px-5 rounded-xl font-bold font-racing text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('settings.save')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
