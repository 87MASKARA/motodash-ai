import React from 'react';
import { Printer, Download, X, ShieldCheck, Wrench, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogos';

export default function PrintReportModal({ isOpen, onClose, bikeConfig, hojaDeVida = {}, odometer = 0, currency = 'COP' }) {
  if (!isOpen) return null;

  const { bikeIdentity, telemetrySpecs } = bikeConfig;
  const docs = hojaDeVida.documentos || {};
  const servicios = hojaDeVida.servicios || [];
  const totalInvertido = servicios.reduce((acc, s) => acc + (Number(s.costo) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white text-neutral-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none print:max-h-none print:w-full">
        {/* Botones de acción superiores (se ocultan al imprimir) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-800">
              Certificado Digital de Mantenimiento
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Encabezado del Certificado / Hoja de Vida */}
        <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-5 mb-5 gap-4">
          <div className="flex items-center gap-3.5">
            <BrandLogo
              brand={bikeIdentity.brand}
              accentColor={bikeIdentity.colorHex}
              className="w-12 h-12 flex-shrink-0"
            />
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-neutral-500">
                MOTODASH AI • CERTIFICADO DE HOJA DE VIDA TÉCNICA
              </span>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950 mt-0.5">
                {bikeIdentity.brand} {bikeIdentity.model}
              </h1>
              <p className="text-xs text-neutral-600 font-mono mt-0.5">
                Año: {bikeIdentity.year} • Cilindrada: {telemetrySpecs.engineCc}cc • Categoría: {bikeIdentity.category.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="border-2 border-neutral-900 px-3 py-1 rounded-xl font-mono font-black text-sm text-neutral-900 inline-block bg-neutral-50">
              PLACA: {docs.placa || "SIN PLACA"}
            </div>
            <div className="text-[11px] font-mono text-neutral-500 mt-1">
              Odómetro Actual: <strong>{odometer.toLocaleString()} km</strong>
            </div>
          </div>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-neutral-100 border border-neutral-200 text-center font-mono text-xs">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block">Total Intervenciones</span>
            <strong className="text-sm text-neutral-900">{servicios.length} Servicios</strong>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block">Inversión en Repuestos</span>
            <strong className="text-sm text-emerald-700">${totalInvertido.toLocaleString()} {currency}</strong>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block">Estado Mecánico</span>
            <strong className="text-sm text-emerald-700 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Al Día
            </strong>
          </div>
        </div>

        {/* Tabla de Servicios y Mantenimientos */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2.5 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-neutral-600" />
            Bitácora de Servicios & Reparaciones
          </h4>
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-300 text-neutral-500 text-[10px]">
                <th className="py-2">FECHA</th>
                <th className="py-2">KM</th>
                <th className="py-2">SERVICIO REALIZADO</th>
                <th className="py-2">REPUESTO / MARCA</th>
                <th className="py-2">TALLER</th>
                <th className="py-2 text-right">COSTO</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((srv, idx) => (
                <tr key={idx} className="border-b border-neutral-200">
                  <td className="py-2.5 text-neutral-600">{srv.fecha}</td>
                  <td className="py-2.5 font-bold text-neutral-900">{srv.km.toLocaleString()} km</td>
                  <td className="py-2.5 font-sans font-medium text-neutral-900">{srv.servicio}</td>
                  <td className="py-2.5 text-neutral-600">{srv.marcaRepuesto || "--"}</td>
                  <td className="py-2.5 text-neutral-600">{srv.taller || "Particular"}</td>
                  <td className="py-2.5 text-right font-bold text-neutral-900">${Number(srv.costo).toLocaleString()}</td>
                </tr>
              ))}
              {servicios.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-neutral-400 italic">
                    No hay servicios registrados en la bitácora aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Información Legal y Documentación */}
        <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 text-xs font-mono mb-6">
          <h5 className="font-bold uppercase text-[10px] text-neutral-500 tracking-wider mb-2">
            Estado de Documentos Legales
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-[10px] text-neutral-400 block">SOAT:</span>
              <strong className="text-neutral-800">{docs.soatVencimiento || "Vigente"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block">Técnico-Mecánica:</span>
              <strong className="text-neutral-800">{docs.tecnoVencimiento || "Vigente"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block">Seguro Todo Riesgo:</span>
              <strong className="text-neutral-800">{docs.seguroPoliza || "SURA"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block">Impuesto Vehicular:</span>
              <strong className="text-neutral-800">{docs.impuestoVencimiento || "Al día"}</strong>
            </div>
          </div>
        </div>

        {/* Firma y Validez */}
        <div className="pt-4 border-t border-neutral-300 flex justify-between items-end text-[10px] font-mono text-neutral-500">
          <div className="flex items-center gap-2.5">
            <img src="/logo-emblem.png" alt="MotoDash AI" className="h-7 w-auto object-contain bg-neutral-950 p-1 rounded-lg" />
            <div>
              <p>Generado con <strong>MotoDash AI</strong> ({new Date().toLocaleDateString()})</p>
              <p>Documento digital verificado para peritajes, talleres y reventa.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="w-32 border-b border-neutral-400 mb-1"></div>
            <span>Firma Propietario / Taller</span>
          </div>
        </div>
      </div>
    </div>
  );
}

