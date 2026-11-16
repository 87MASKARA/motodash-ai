/**
 * Servicio compartido de geolocalización y cálculo de cercanía Haversine
 * para tiendas de repuestos, talleres y concesionarios aliados en MotoMall.
 */

export const DEFAULT_MALL_STORES = [
  {
    id: 'store_auteco_dismerca',
    slug: 'auteco-dismerca-oficial',
    store_name: 'Auteco / Dismerca Concesionario & Repuestos',
    store_type: 'concesionario',
    tax_id_nit: 'NIT 890.900.123-4 • Verificado',
    city: 'Medellín / Av. Las Vegas',
    country: 'Colombia',
    address: 'Av. Las Vegas Cra 48 # 16-24, Medellín',
    latitude: 6.21895,
    longitude: -75.57612,
    whatsapp_sales: '573009120000',
    logo_url: null,
    accent_color: '#EF4444',
    brands_supported: ['TVS', 'KTM', 'KAWASAKI', 'SUZUKI'],
    is_verified: true,
    founder_overseer_name: 'Anderson • Fundador VIP',
    rating: 4.95
  },
  {
    id: 'store_mundimotos_pro',
    slug: 'mundorepuestos-racing-co',
    store_name: 'MundoRepuestos & Lubricantes Racing (La Bayadera)',
    store_type: 'repuestos',
    tax_id_nit: 'NIT 901.442.810-1 • Verificado',
    city: 'Medellín / La Bayadera',
    country: 'Colombia',
    address: 'Cra 53 # 38-28 Sector La Bayadera, Medellín',
    latitude: 6.24035,
    longitude: -75.57468,
    whatsapp_sales: '573104500000',
    logo_url: null,
    accent_color: '#F59E0B',
    brands_supported: ['TVS', 'YAMAHA', 'BAJAJ', 'HONDA', 'SUZUKI', 'AKT'],
    is_verified: true,
    founder_overseer_name: 'Anderson • Fundador VIP',
    rating: 4.92
  },
  {
    id: 'store_yamaha_incolmotos',
    slug: 'yamaha-incolmotos-boutique',
    store_name: 'Concesionario & Boutique Racing Multimarcas',
    store_type: 'boutique',
    tax_id_nit: 'NIT 890.915.440-8 • Verificado',
    city: 'Medellín / El Poblado',
    country: 'Colombia',
    address: 'Cra 43A # 14-57 El Poblado, Medellín',
    latitude: 6.21562,
    longitude: -75.57031,
    whatsapp_sales: '573158000000',
    logo_url: null,
    accent_color: '#06B6D4',
    brands_supported: ['YAMAHA', 'BMW', 'DUCATI', 'TVS', 'KTM'],
    is_verified: true,
    founder_overseer_name: 'Anderson • Fundador VIP',
    rating: 4.98
  },
  {
    id: 'store_norte_bello',
    slug: 'taller-repuestos-norte-bello',
    store_name: 'Serviteca & Desvare Motero Zona Norte',
    store_type: 'taller',
    tax_id_nit: 'NIT 900.781.219-5 • Verificado',
    city: 'Bello / Norte Aburrá',
    country: 'Colombia',
    address: 'Autopista Norte Diag 50 # 34-18, Bello',
    latitude: 6.33418,
    longitude: -75.55792,
    whatsapp_sales: '573127700000',
    logo_url: null,
    accent_color: '#10B981',
    brands_supported: ['TVS', 'BAJAJ', 'YAMAHA', 'HONDA', 'SUZUKI', 'AKT'],
    is_verified: true,
    founder_overseer_name: 'Anderson • Fundador VIP',
    rating: 4.91
  }
];

export function computeHaversineKm(lat1, lon1, lat2, lon2) {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (
    !Number.isFinite(nLat1) ||
    !Number.isFinite(nLon1) ||
    !Number.isFinite(nLat2) ||
    !Number.isFinite(nLon2)
  ) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(nLat2 - nLat1);
  const dLon = toRad(nLon2 - nLon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(nLat1)) * Math.cos(toRad(nLat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistanceLabel(km) {
  if (km === null || km === undefined || !Number.isFinite(km)) return null;
  if (km < 1) {
    const meters = Math.max(50, Math.round(km * 1000));
    return `${meters} m de ti • ~${Math.max(1, Math.round(meters / 400))} min`;
  }
  const roundedKm = km < 10 ? km.toFixed(1) : Math.round(km);
  const mins = Math.max(2, Math.round((km / 28) * 60));
  return `a ${roundedKm} km de ti • ~${mins} min en moto`;
}

export function sortStoresByProximity(stores = [], riderCoords = null) {
  if (!Array.isArray(stores)) return [];
  const enriched = stores.map((st) => {
    const distanceKm =
      riderCoords?.lat && riderCoords?.lng && st.latitude && st.longitude
        ? computeHaversineKm(riderCoords.lat, riderCoords.lng, st.latitude, st.longitude)
        : null;
    return {
      ...st,
      distanceKm,
      distanceLabel: formatDistanceLabel(distanceKm)
    };
  });

  if (!riderCoords?.lat || !riderCoords?.lng) return enriched;

  return enriched.sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) return 0;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}

export function getLoadedMallStores() {
  try {
    const saved = localStorage.getItem('motodash_mall_stores');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Asegurar que las tiendas antiguas en caché hereden coordenadas si no tenían
        return parsed.map((st) => {
          if (st.latitude && st.longitude) return st;
          const match = DEFAULT_MALL_STORES.find((d) => d.slug === st.slug);
          return match ? { ...st, latitude: match.latitude, longitude: match.longitude, address: st.address || match.address } : st;
        });
      }
    }
  } catch {}
  return DEFAULT_MALL_STORES;
}

export function buildStoreMapsUrl(store, riderCoords = null) {
  if (store?.latitude && store?.longitude) {
    if (riderCoords?.lat && riderCoords?.lng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${riderCoords.lat},${riderCoords.lng}&destination=${store.latitude},${store.longitude}&travelmode=two-wheeler`;
    }
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store?.store_name || ''} ${store?.address || ''} ${store?.city || ''}`)}`;
}
