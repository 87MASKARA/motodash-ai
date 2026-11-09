import React from 'react';

/**
 * Emblemas vectoriales SVG de alta precisión para las marcas oficiales de motocicletas.
 * Todos usan viewBox cuadrado (0 0 100 100) para escalar con nitidez en cualquier tamaño.
 */

export function YamahaLogo({ className = "w-8 h-8" }) {
  // Tres diapasones entrelazados con simetría rotacional exacta de 120°
  const fork = (
    <g>
      <line x1="50" y1="9.5" x2="50" y2="30.5" stroke="#F8FAFC" strokeWidth="4.2" strokeLinecap="round" />
      <path
        d="M44.2 73 L44.2 35.5 Q44.2 30.2 50 30.2 Q55.8 30.2 55.8 35.5 L55.8 73"
        stroke="#F8FAFC"
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="46" fill="#0B2559" stroke="#E2E8F0" strokeWidth="4.5" />
      <circle cx="50" cy="50" r="37.5" stroke="#94A3B8" strokeWidth="2" />
      <g transform="rotate(0 50 50)">{fork}</g>
      <g transform="rotate(120 50 50)">{fork}</g>
      <g transform="rotate(240 50 50)">{fork}</g>
      <circle cx="50" cy="50" r="4.5" fill="#0B2559" stroke="#F8FAFC" strokeWidth="2.2" />
    </svg>
  );
}

export function KtmLogo({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="4" y="14" width="92" height="72" rx="18" fill="#FF6600" stroke="#FDBA74" strokeWidth="2.5" />
      <path d="M14 68 H86" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />
      <text
        x="50"
        y="59"
        fill="#0A0A0A"
        fontSize="31"
        fontWeight="900"
        fontFamily="Arial Black, Impact, sans-serif"
        textAnchor="middle"
        fontStyle="italic"
        letterSpacing="-1"
      >
        KTM
      </text>
    </svg>
  );
}

export function KawasakiLogo({ className = "w-8 h-8" }) {
  // Emblema oficial Kawasaki River Mark (川) + acento verde lima KRT
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="46" fill="#0A0F0A" stroke="#52C41A" strokeWidth="4.5" />
      {/* River Mark estilizado / K de competición */}
      <path
        d="M27 22 V78 M50 26 V74 M73 22 V78"
        stroke="#52C41A"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <path
        d="M27 38 H50 M50 50 H73 M27 62 H50"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DucatiLogo({ className = "w-8 h-8" }) {
  // Escudo triangular curvo Ducati Rosso Corsa con franja blanca característica
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M50 6 C74 6 91 14 90 36 C89 63 69 83 50 95 C31 83 11 63 10 36 C9 14 26 6 50 6 Z"
        fill="#DC2626"
        stroke="#E5E7EB"
        strokeWidth="4"
      />
      {/* Curva blanca interior oficial del escudo Ducati */}
      <path
        d="M78 35 C63 43 49 58 46 84 C43 62 54 44 74 30 Z"
        fill="#FFFFFF"
      />
      <text
        x="50"
        y="26"
        fill="#FFFFFF"
        fontSize="12.5"
        fontWeight="900"
        fontFamily="Arial Black, sans-serif"
        textAnchor="middle"
        letterSpacing="1.2"
      >
        DUCATI
      </text>
    </svg>
  );
}

export function HondaLogo({ className = "w-8 h-8" }) {
  // Ala Honda Racing sobre escudo oscuro con borde rojo
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="5" y="10" width="90" height="80" rx="20" fill="#111113" stroke="#EF4444" strokeWidth="3.5" />
      {/* Plumas del Ala Honda */}
      <path d="M18 54 C35 48 60 34 83 19 C78 29 63 42 40 52 Z" fill="#EF4444" />
      <path d="M21 60 C38 55 59 44 79 31 C74 40 59 50 38 58 Z" fill="#EF4444" />
      <path d="M25 66 C40 62 57 54 73 44 C68 51 55 59 37 65 Z" fill="#FFFFFF" />
      <text
        x="50"
        y="82"
        fill="#FFFFFF"
        fontSize="13.5"
        fontWeight="900"
        fontFamily="Arial Black, sans-serif"
        textAnchor="middle"
        letterSpacing="2"
      >
        HONDA
      </text>
    </svg>
  );
}

export function BmwLogo({ className = "w-8 h-8" }) {
  // Roundel oficial BMW con cuadrantes bávaros azul y blanco
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="46" fill="#0A0A0A" stroke="#E5E7EB" strokeWidth="4" />
      <circle cx="50" cy="50" r="29" stroke="#E5E7EB" strokeWidth="2.5" />
      <path d="M50 21 A29 29 0 0 1 79 50 H50 V21 Z" fill="#0066B1" />
      <path d="M50 50 H21 A29 29 0 0 1 50 21 V50 Z" fill="#FFFFFF" />
      <path d="M50 50 V79 A29 29 0 0 1 21 50 H50 Z" fill="#0066B1" />
      <path d="M50 50 H79 A29 29 0 0 1 50 79 V50 Z" fill="#FFFFFF" />
      <text x="31" y="21" fill="#FFFFFF" fontSize="9.5" fontWeight="900" fontFamily="Arial, sans-serif" textAnchor="middle" transform="rotate(-32 31 21)">B</text>
      <text x="50" y="16" fill="#FFFFFF" fontSize="9.5" fontWeight="900" fontFamily="Arial, sans-serif" textAnchor="middle">M</text>
      <text x="69" y="21" fill="#FFFFFF" fontSize="9.5" fontWeight="900" fontFamily="Arial, sans-serif" textAnchor="middle" transform="rotate(32 69 21)">W</text>
    </svg>
  );
}

export function SuzukiLogo({ className = "w-8 h-8" }) {
  // "S" geométrica oficial de Suzuki con simetría puntual exacta
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polygon
        points="50,7 85,27 71,36 48,23 37,30 85,57 50,93 15,73 29,64 52,77 63,70 15,43"
        fill="#E11D48"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BajajLogo({ className = "w-8 h-8" }) {
  // Emblema geométrico "Flying B" de Bajaj Auto
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polygon
        points="50,6 90,28 90,72 50,94 10,72 10,28"
        fill="#0046BE"
        stroke="#93C5FD"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M28 28 L72 42 L44 50 L28 28 Z" fill="#FFFFFF" />
      <path d="M44 52 L74 58 L30 74 L44 52 Z" fill="#FFFFFF" />
    </svg>
  );
}

export function TvsLogo({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="5" y="12" width="90" height="76" rx="18" fill="#0F172A" stroke="#E11D48" strokeWidth="3.5" />
      {/* Silueta dinámica aerodinámica TVS Racing */}
      <path
        d="M24 42 C38 30 58 26 78 30 C66 36 56 41 44 45 L66 46 C54 52 38 54 24 42 Z"
        fill="#E11D48"
      />
      <text
        x="50"
        y="74"
        fill="#FFFFFF"
        fontSize="22"
        fontWeight="900"
        fontFamily="Arial Black, sans-serif"
        fontStyle="italic"
        textAnchor="middle"
        letterSpacing="2"
      >
        TVS
      </text>
    </svg>
  );
}

export const BRAND_LOGOS = {
  Yamaha: YamahaLogo,
  KTM: KtmLogo,
  Kawasaki: KawasakiLogo,
  Ducati: DucatiLogo,
  Honda: HondaLogo,
  BMW: BmwLogo,
  Suzuki: SuzukiLogo,
  Bajaj: BajajLogo,
  TVS: TvsLogo
};

const NORMALIZED_BRAND_LOGOS = Object.entries(BRAND_LOGOS).reduce((acc, [key, Comp]) => {
  acc[key.toLowerCase()] = Comp;
  return acc;
}, {});

export function getBrandLogoComponent(brandName = "") {
  if (!brandName || typeof brandName !== "string") return null;
  const clean = brandName.trim().toLowerCase();
  if (NORMALIZED_BRAND_LOGOS[clean]) return NORMALIZED_BRAND_LOGOS[clean];
  // Búsqueda parcial (ej. "Yamaha Motor" -> YamahaLogo)
  const foundKey = Object.keys(NORMALIZED_BRAND_LOGOS).find((k) => clean.includes(k));
  return foundKey ? NORMALIZED_BRAND_LOGOS[foundKey] : null;
}

/**
 * Componente universal de Emblema de Marca:
 * Renderiza el logo oficial de la marca (sin importar mayúsculas/minúsculas)
 * o un escudo monograma deportivo si es una marca personalizada.
 */
export function BrandLogo({ brand = "", className = "w-8 h-8", accentColor = "#F59E0B" }) {
  const LogoComp = getBrandLogoComponent(brand);
  if (LogoComp) {
    return <LogoComp className={className} />;
  }

  const initials = (brand || "M")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="45" fill="#18181B" stroke={accentColor} strokeWidth="5" />
      <text
        x="50"
        y="61"
        fill="#FFFFFF"
        fontSize="34"
        fontWeight="900"
        fontFamily="Arial Black, sans-serif"
        textAnchor="middle"
      >
        {initials}
      </text>
    </svg>
  );
}
