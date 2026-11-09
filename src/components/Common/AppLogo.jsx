import React from 'react';

/**
 * Componente Central del Logo Oficial de MotoDash AI
 * - variant="horizontal" (por defecto): Emblema dorado de circuito IA + tipografía plata/oro
 * - variant="full": Logo oficial completo vertical (/logo-full.png)
 */
export default function AppLogo({ 
  size = "md", 
  showText = true, 
  variant = "horizontal",
  customImgSrc = null, 
  className = "" 
}) {
  if (variant === "full") {
    const fullSizeClasses = {
      sm: "h-16",
      md: "h-24",
      lg: "h-28",
      xl: "h-36"
    };

    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={customImgSrc || "/logo-full.png"}
          alt="MotoDash AI"
          className={`${fullSizeClasses[size] || fullSizeClasses.lg} w-auto object-contain drop-shadow-[0_0_18px_rgba(245,158,11,0.3)] select-none`}
        />
      </div>
    );
  }

  const emblemSizes = {
    sm: "h-8",
    md: "h-10 sm:h-11",
    lg: "h-14"
  };

  const titleSizes = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-xl"
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <img 
        src={customImgSrc || "/logo-emblem.png"} 
        alt="MotoDash AI Logo" 
        className={`${emblemSizes[size] || emblemSizes.md} w-auto object-contain flex-shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.32)]`} 
      />

      {showText && (
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black font-racing italic tracking-wide ${titleSizes[size] || titleSizes.md}`}>
              <span className="bg-gradient-to-b from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                MotoDash
              </span>{' '}
              <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                AI
              </span>
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 block mt-0.5 tracking-widest uppercase">
            INTELLIGENT COCKPIT
          </span>
        </div>
      )}
    </div>
  );
}
