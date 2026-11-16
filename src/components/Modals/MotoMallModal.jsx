import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  ShoppingBag,
  ShieldCheck,
  Crown,
  Plus,
  Search,
  CheckCircle2,
  Tag,
  Truck,
  MapPin,
  Building2,
  Upload,
  Sparkles,
  Wrench,
  Zap,
  Bike,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';
import { supabase, getAuthenticatedUserId } from '../../services/supabaseClient';
import { isFounderVipEmail } from '../Auth/LoginModal';
import { useLanguage } from '../../i18n/LanguageContext';

const OFFICIAL_FOUNDER_NAME = 'Anderson • Fundador VIP';

export const MALL_CATEGORIES = [
  { id: 'all', label: '🔥 Todo el Mall' },
  { id: 'motor', label: '🛢️ Motor, Aceites & Filtros' },
  { id: 'electrico', label: '⚡ Baterías AGM & Eléctrico' },
  { id: 'frenos', label: '🛑 Pastillas & Frenos' },
  { id: 'transmision', label: '⛓️ Kit de Arrastre & Cadena' },
  { id: 'llantas', label: '🛞 Llantas & Neumáticos' },
  { id: 'motos_nuevas', label: '🏍️ Concesionario (Motos 0 KM)' },
  { id: 'accesorios', label: '📟 Pantallas CarPlay & Cascos' }
];

const INITIAL_OFFICIAL_STORES = [
  {
    id: 'store_auteco_dismerca',
    slug: 'auteco-dismerca-oficial',
    store_name: 'Auteco / Dismerca Concesionario & Repuestos',
    store_type: 'concesionario',
    tax_id_nit: 'NIT 890.900.123-4 • Verificado',
    city: 'Medellín / Nacional',
    country: 'Colombia',
    address: 'Av. Las Vegas / Red Oficial Auteco Mobility & SAS',
    whatsapp_sales: '573009120000',
    logo_url: null,
    accent_color: '#EF4444',
    brands_supported: ['TVS', 'KTM', 'KAWASAKI', 'SUZUKI'],
    is_verified: true,
    founder_overseer_name: OFFICIAL_FOUNDER_NAME,
    rating: 4.95
  },
  {
    id: 'store_mundimotos_pro',
    slug: 'mundorepuestos-racing-co',
    store_name: 'MundoRepuestos & Lubricantes Racing',
    store_type: 'repuestos',
    tax_id_nit: 'NIT 901.442.810-1 • Verificado',
    city: 'Medellín / Bogotá',
    country: 'Colombia',
    address: 'Sector La Bayadera Cra 53 / Calle 38',
    whatsapp_sales: '573104500000',
    logo_url: null,
    accent_color: '#F59E0B',
    brands_supported: ['TVS', 'YAMAHA', 'BAJAJ', 'HONDA', 'SUZUKI', 'AKT'],
    is_verified: true,
    founder_overseer_name: OFFICIAL_FOUNDER_NAME,
    rating: 4.92
  },
  {
    id: 'store_yamaha_incolmotos',
    slug: 'yamaha-incolmotos-boutique',
    store_name: 'Concesionario & Boutique Racing Multimarcas',
    store_type: 'boutique',
    tax_id_nit: 'NIT 890.915.440-8 • Verificado',
    city: 'Medellín / Cali / Bogotá',
    country: 'Colombia',
    address: 'Zona Motera El Poblado / Av. El Dorado',
    whatsapp_sales: '573158000000',
    logo_url: null,
    accent_color: '#06B6D4',
    brands_supported: ['YAMAHA', 'BMW', 'DUCATI', 'TVS', 'KTM'],
    is_verified: true,
    founder_overseer_name: OFFICIAL_FOUNDER_NAME,
    rating: 4.98
  }
];

const INITIAL_OFFICIAL_PRODUCTS = [
  {
    id: 'prod_1',
    store_slug: 'auteco-dismerca-oficial',
    store_name: 'Auteco / Dismerca Concesionario & Repuestos',
    title: 'Aceite Sintético 10W-40 JASO MA2 (Especial TVS Apache 4V / FI)',
    category: 'motor',
    maintenance_comp_id: 'aceite_motor',
    compatible_brands: ['TVS', 'YAMAHA', 'KTM', 'BAJAJ', 'SUZUKI', 'HONDA'],
    compatible_models: 'TVS Apache RTR 160/200 4V FI NG, MT-09, Duke 390 y 4T Inyección',
    oem_reference: 'OEM-TVS-TRU4-10W40',
    price: 54000,
    currency: 'COP',
    discount_pct: 12,
    stock: 48,
    image_url: null,
    whatsapp_sales: '573009120000',
    delivery_available: true
  },
  {
    id: 'prod_2',
    store_slug: 'mundorepuestos-racing-co',
    store_name: 'MundoRepuestos & Lubricantes Racing',
    title: 'Batería AGM Gel Alto Arranque 12V 8Ah (Compatible Telemetría TFT)',
    category: 'electrico',
    maintenance_comp_id: 'bateria_sistema_carga',
    compatible_brands: ['TVS', 'YAMAHA', 'KTM', 'BAJAJ', 'HONDA', 'SUZUKI'],
    compatible_models: 'Apache RTR 160 4V FI, Pulsar NS200, FZ25, Gixxer 150/250',
    oem_reference: 'AGM-YTX9-BS-PRO',
    price: 175000,
    currency: 'COP',
    discount_pct: 15,
    stock: 19,
    image_url: null,
    whatsapp_sales: '573104500000',
    delivery_available: true
  },
  {
    id: 'prod_3',
    store_slug: 'auteco-dismerca-oficial',
    store_name: 'Auteco / Dismerca Concesionario & Repuestos',
    title: 'Juego Pastillas de Freno Sinterizadas ABS (Delanteras / Traseras)',
    category: 'frenos',
    maintenance_comp_id: 'pastillas_delanteras',
    compatible_brands: ['TVS', 'KTM', 'BAJAJ', 'YAMAHA'],
    compatible_models: 'TVS Apache RTR 160/200 4V ABS, KTM Duke 200/390',
    oem_reference: 'N9112580-ABS-SINT',
    price: 62000,
    currency: 'COP',
    discount_pct: 10,
    stock: 34,
    image_url: null,
    whatsapp_sales: '573009120000',
    delivery_available: true
  },
  {
    id: 'prod_4',
    store_slug: 'mundorepuestos-racing-co',
    store_name: 'MundoRepuestos & Lubricantes Racing',
    title: 'Kit de Arrastre Reforzado Cadena O-Ring Dorada (Acero 1045)',
    category: 'transmision',
    maintenance_comp_id: 'cadena_lubricacion',
    compatible_brands: ['TVS', 'YAMAHA', 'BAJAJ', 'HONDA', 'SUZUKI'],
    compatible_models: 'TVS Apache RTR 160 4V (428H / 520 O-Ring) y Naked 150-250cc',
    oem_reference: 'KIT-ORING-4V-GOLD',
    price: 168000,
    currency: 'COP',
    discount_pct: 14,
    stock: 22,
    image_url: null,
    whatsapp_sales: '573104500000',
    delivery_available: true
  },
  {
    id: 'prod_5',
    store_slug: 'yamaha-incolmotos-boutique',
    store_name: 'Concesionario & Boutique Racing Multimarcas',
    title: 'Pantalla Portátil Moto 3.6" CarPlay & Android Auto IPX7 (3000mAh USB-C)',
    category: 'accesorios',
    maintenance_comp_id: null,
    compatible_brands: ['TVS', 'YAMAHA', 'KTM', 'BMW', 'DUCATI', 'HONDA', 'SUZUKI', 'BAJAJ'],
    compatible_models: 'Universal Manubrio (640×1080 HD Solar • Procesador V851S)',
    oem_reference: 'HUD-36-V851S-IP66',
    price: 349000,
    currency: 'COP',
    discount_pct: 18,
    stock: 12,
    image_url: null,
    whatsapp_sales: '573158000000',
    delivery_available: true
  },
  {
    id: 'prod_6',
    store_slug: 'auteco-dismerca-oficial',
    store_name: 'Auteco / Dismerca Concesionario & Repuestos',
    title: 'TVS Apache RTR 160 4V FI NG ABS SmartXonnect (Modelo 0 KM Concesionario)',
    category: 'motos_nuevas',
    maintenance_comp_id: null,
    compatible_brands: ['TVS'],
    compatible_models: 'Entrega inmediata • Financiación directa y Garantía Oficial 24m/24.000km',
    oem_reference: 'CONCESIONARIO-0KM-RTR160',
    price: 11290000,
    currency: 'COP',
    discount_pct: 5,
    stock: 6,
    image_url: null,
    whatsapp_sales: '573009120000',
    delivery_available: true
  }
];

async function compressMallImage(file, targetSize = 360) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(targetSize / img.width, targetSize / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Mapea un ID de componente de Mantenimiento Predictivo a la categoría correspondiente del Mall
function mapComponentToCategory(compId) {
  if (!compId) return 'all';
  if (compId.includes('bateria') || compId.includes('check_engine') || compId.includes('bujia')) return 'electrico';
  if (compId.includes('aceite') || compId.includes('filtro')) return 'motor';
  if (compId.includes('pastilla') || compId.includes('liquido_frenos') || compId.includes('suspension')) return 'frenos';
  if (compId.includes('cadena') || compId.includes('kit') || compId.includes('guaya')) return 'transmision';
  if (compId.includes('llanta')) return 'llantas';
  return 'all';
}

export default function MotoMallModal({
  isOpen,
  onClose,
  bike,
  userProfile,
  initialComponentId = null,
  initialTab = 'home' // 'home' | 'catalog' | 'stores' | 'merchant_portal'
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const isFounderUser = Boolean(
    userProfile?.plan === 'founder_vip' ||
    userProfile?.isLifetimeVip ||
    isFounderVipEmail(userProfile?.email)
  );

  const [activeTab, setActiveTab] = useState(initialTab);
  const [mallBillingCycle, setMallBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [mallCurrency, setMallCurrency] = useState('COP'); // 'COP' | 'USD'
  const [selectedMerchantPlan, setSelectedMerchantPlan] = useState('almacen_pro'); // 'vitrina_basica' | 'almacen_pro' | 'concesionario_vip'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterOnlyMyBike, setFilterOnlyMyBike] = useState(false);
  const [selectedStoreSlug, setSelectedStoreSlug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [stores, setStores] = useState(() => {
    try {
      const saved = localStorage.getItem('motodash_mall_stores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_OFFICIAL_STORES;
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('motodash_mall_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_OFFICIAL_PRODUCTS;
  });

  // Estado del Portal de Registro Diferenciado para Tiendas y Concesionarios (B2B)
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('repuestos'); // 'repuestos' | 'concesionario' | 'taller' | 'boutique'
  const [storeNit, setStoreNit] = useState('');
  const [storeCity, setStoreCity] = useState(userProfile?.city || 'Medellín');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeBrands, setStoreBrands] = useState('TVS, YAMAHA, KTM, BAJAJ');
  const [storeLogoUrl, setStoreLogoUrl] = useState(null);
  const [registeringStore, setRegisteringStore] = useState(false);
  const [storeRegisteredMsg, setStoreRegisteredMsg] = useState('');
  const storeLogoInputRef = useRef(null);

  // Estado para Publicar un Producto / Repuesto / Moto 0 KM en el Mall
  const [prodStoreSlug, setProdStoreSlug] = useState(INITIAL_OFFICIAL_STORES[0].slug);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('motor');
  const [prodModels, setProdModels] = useState('TVS Apache RTR 160 4V / Multimarcas');
  const [prodOem, setProdOem] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('10');
  const [prodStock, setProdStock] = useState('15');
  const [prodImageUrl, setProdImageUrl] = useState(null);
  const [publishingProd, setPublishingProd] = useState(false);
  const [prodPublishedMsg, setProdPublishedMsg] = useState('');
  const prodImgInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialComponentId) {
      setActiveTab('catalog');
      setSelectedCategory(mapComponentToCategory(initialComponentId));
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialComponentId, initialTab]);

  // Cargar tiendas y productos reales desde Supabase al abrir
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadMallFromSupabase() {
      const authUid = await getAuthenticatedUserId();
      if (!authUid) return;

      const [storesRes, prodsRes] = await Promise.all([
        supabase.from('mall_stores').select('*').order('created_at', { ascending: false }),
        supabase.from('mall_products').select('*').order('created_at', { ascending: false })
      ]);

      if (isMounted && !storesRes.error && Array.isArray(storesRes.data) && storesRes.data.length > 0) {
        const mergedStores = [...storesRes.data];
        INITIAL_OFFICIAL_STORES.forEach((seed) => {
          if (!mergedStores.some((s) => s.slug === seed.slug)) mergedStores.push(seed);
        });
        setStores(mergedStores);
      }

      if (isMounted && !prodsRes.error && Array.isArray(prodsRes.data) && prodsRes.data.length > 0) {
        const mergedProds = [...prodsRes.data];
        INITIAL_OFFICIAL_PRODUCTS.forEach((seed) => {
          if (!mergedProds.some((p) => p.title === seed.title)) mergedProds.push(seed);
        });
        setProducts(mergedProds);
      }
    }

    loadMallFromSupabase();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const identity = bike?.config?.bikeIdentity || {};
  const activeBikeBrand = String(identity.brand || 'TVS').toUpperCase();
  const activeBikeModel = `${identity.brand || 'TVS'} ${identity.model || 'Apache RTR 160 4V'}`;

  // Filtrado inteligente de productos
  const filteredProducts = products.filter((p) => {
    if (selectedStoreSlug && p.store_slug !== selectedStoreSlug) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (filterOnlyMyBike) {
      const brandsArr = Array.isArray(p.compatible_brands)
        ? p.compatible_brands.map((b) => String(b).toUpperCase())
        : [];
      const matchesBrand =
        brandsArr.includes('TODAS') ||
        brandsArr.includes(activeBikeBrand) ||
        String(p.compatible_models || '').toUpperCase().includes(activeBikeBrand);
      if (!matchesBrand) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        String(p.title || '').toLowerCase().includes(q) ||
        String(p.compatible_models || '').toLowerCase().includes(q) ||
        String(p.store_name || '').toLowerCase().includes(q) ||
        String(p.oem_reference || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStoreLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressMallImage(file, 240);
      setStoreLogoUrl(dataUrl);
    } catch {}
  };

  const handleProductImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressMallImage(file, 480);
      setProdImageUrl(dataUrl);
    } catch {}
  };

  // Registrar una nueva Tienda de Repuestos o Concesionario (Flujo Comercial B2B)
  const handleRegisterCommercialStore = async (e) => {
    e.preventDefault();
    if (!storeName.trim() || !storeNit.trim() || !storeWhatsapp.trim()) return;

    setRegisteringStore(true);
    const slug = `${storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const brandsArray = storeBrands
      .split(',')
      .map((b) => b.trim().toUpperCase())
      .filter(Boolean);

    const newStoreObj = {
      id: `store_${Date.now()}`,
      slug,
      store_name: storeName.trim(),
      store_type: storeType,
      tax_id_nit: storeNit.trim(),
      city: storeCity.trim() || 'Medellín',
      country: userProfile?.country || 'Colombia',
      address: storeAddress.trim() || 'Sede Comercial Verificada',
      whatsapp_sales: storeWhatsapp.replace(/[^0-9]/g, ''),
      logo_url: storeLogoUrl,
      accent_color: storeType === 'concesionario' ? '#EF4444' : storeType === 'boutique' ? '#06B6D4' : '#F59E0B',
      brands_supported: brandsArray.length > 0 ? brandsArray : ['MULTIMARCAS'],
      is_verified: true,
      founder_overseer_name: OFFICIAL_FOUNDER_NAME,
      rating: 5.0
    };

    try {
      const authUid = await getAuthenticatedUserId();
      if (authUid) {
        await supabase.from('mall_stores').insert({
          slug: newStoreObj.slug,
          owner_id: authUid,
          store_name: newStoreObj.store_name,
          store_type: newStoreObj.store_type,
          tax_id_nit: newStoreObj.tax_id_nit,
          city: newStoreObj.city,
          country: newStoreObj.country,
          address: newStoreObj.address,
          whatsapp_sales: newStoreObj.whatsapp_sales,
          logo_url: newStoreObj.logo_url,
          accent_color: newStoreObj.accent_color,
          brands_supported: newStoreObj.brands_supported,
          is_verified: true,
          founder_overseer_name: OFFICIAL_FOUNDER_NAME
        });
      }

      const nextStores = [newStoreObj, ...stores];
      setStores(nextStores);
      setProdStoreSlug(newStoreObj.slug);
      try {
        localStorage.setItem('motodash_mall_stores', JSON.stringify(nextStores));
      } catch {}

      setStoreRegisteredMsg(
        `✅ ¡Comercio "${newStoreObj.store_name}" (${newStoreObj.tax_id_nit}) registrado en MotoMall con Sello Verificado y supervisión oficial de ${OFFICIAL_FOUNDER_NAME}! Ahora puedes publicar tus productos abajo.`
      );
      setStoreName('');
      setStoreNit('');
      setStoreAddress('');
      setStoreLogoUrl(null);
    } finally {
      setRegisteringStore(false);
    }
  };

  // Publicar un Repuesto, Accesorio o Moto 0 KM en la vitrina de la tienda
  const handlePublishProduct = async (e) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodPrice) return;

    setPublishingProd(true);
    const parentStore = stores.find((s) => s.slug === prodStoreSlug) || stores[0];

    const newProdObj = {
      id: `prod_${Date.now()}`,
      store_slug: parentStore.slug,
      store_name: parentStore.store_name,
      title: prodTitle.trim(),
      category: prodCategory,
      compatible_brands: parentStore.brands_supported || ['TODAS'],
      compatible_models: prodModels.trim() || 'Universal / Multimarcas',
      oem_reference: prodOem.trim() || `REF-${Date.now().toString().slice(-5)}`,
      price: Number(prodPrice) || 0,
      currency: 'COP',
      discount_pct: Number(prodDiscount) || 10,
      stock: Number(prodStock) || 10,
      image_url: prodImageUrl,
      whatsapp_sales: parentStore.whatsapp_sales || '573009120000',
      delivery_available: true
    };

    try {
      const authUid = await getAuthenticatedUserId();
      if (authUid) {
        await supabase.from('mall_products').insert({
          seller_id: authUid,
          store_slug: newProdObj.store_slug,
          store_name: newProdObj.store_name,
          title: newProdObj.title,
          category: newProdObj.category,
          compatible_brands: newProdObj.compatible_brands,
          compatible_models: newProdObj.compatible_models,
          oem_reference: newProdObj.oem_reference,
          price: newProdObj.price,
          currency: newProdObj.currency,
          discount_pct: newProdObj.discount_pct,
          stock: newProdObj.stock,
          image_url: newProdObj.image_url,
          whatsapp_sales: newProdObj.whatsapp_sales,
          delivery_available: true
        });
      }

      const nextProducts = [newProdObj, ...products];
      setProducts(nextProducts);
      try {
        localStorage.setItem('motodash_mall_products', JSON.stringify(nextProducts));
      } catch {}

      setProdPublishedMsg(`✅ ¡Producto "${newProdObj.title}" publicado en la vitrina de ${parentStore.store_name}!`);
      setProdTitle('');
      setProdPrice('');
      setProdOem('');
      setProdImageUrl(null);
      setTimeout(() => {
        setProdPublishedMsg('');
        setActiveTab('catalog');
      }, 1800);
    } finally {
      setPublishingProd(false);
    }
  };

  const handleOrderViaWhatsApp = (prod) => {
    const cleanPhone = String(prod.whatsapp_sales || '573009120000').replace(/[^0-9]/g, '');
    const msg = `🛒 *PEDIDO OFICIAL MOTOMALL — MOTODASH AI*\nHola *${prod.store_name}*, vengo desde MotoDash AI.\n\n📦 *Producto:* ${prod.title}\n🔖 *Referencia:* ${prod.oem_reference}\n💰 *Precio MotoMall:* $${Number(prod.price).toLocaleString()} ${prod.currency} (-${prod.discount_pct}% Dto. Miembro)\n🏍️ *Mi Moto:* ${activeBikeModel}\n\n¿Tienen disponibilidad para despacho inmediato?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-amber-500/50 rounded-3xl max-w-6xl w-full p-4 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.18)] text-white my-auto max-h-[94vh] overflow-y-auto flex flex-col">
        {/* ENCABEZADO DEL MOTOMALL OFICIAL B2B2C */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-black">
                  MOTOMALL OFICIAL B2B2C • REPUESTOS & CONCESIONARIOS
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Gobernanza Oficial: {OFFICIAL_FOUNDER_NAME}</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black font-racing uppercase tracking-wider text-white mt-1">
                {isEn
                  ? 'Official MotoMall: Verified Parts Stores & Dealerships'
                  : 'Centro Comercial Motero: Almacenes de Repuestos & Concesionarios'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('merchant_portal')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-racing font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Building2 className="w-4 h-4" />
              <span>Soy Tienda / Concesionario (Registro B2B)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL DE 4 PESTAÑAS DEL MALL (INCLUYE PORTADA & PLANES B2B) */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-neutral-800">
          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border transition whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>🏠 Inicio MotoMall & Planes B2B</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border transition whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>🛒 Catálogo de Repuestos & Motos ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedStoreSlug(null);
                setActiveTab('stores');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border transition whitespace-nowrap ${
                activeTab === 'stores'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>🏪 Tiendas & Concesionarios Verificados ({stores.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('merchant_portal')}
              className={`px-4 py-2 rounded-xl text-xs font-racing font-bold uppercase tracking-wider flex items-center gap-1.5 border transition whitespace-nowrap ${
                activeTab === 'merchant_portal'
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏢 Portal Empresas (Registrar Tienda / Subir Productos)</span>
            </button>
          </div>

          {/* Interruptor Inteligente: Filtrar repuestos compatibles con la moto activa del piloto */}
          {activeTab === 'catalog' && (
            <button
              type="button"
              onClick={() => setFilterOnlyMyBike(!filterOnlyMyBike)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 transition ${
                filterOnlyMyBike
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                  : 'bg-neutral-900 text-emerald-300 border-emerald-500/40 hover:bg-neutral-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>
                {filterOnlyMyBike
                  ? `✓ Filtrado para mi ${activeBikeModel}`
                  : `🎯 Filtrar solo para mi ${activeBikeModel}`}
              </span>
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* PESTAÑA 0: PORTADA DE INICIO DEL MOTOMALL & PLANES COMERCIALES    */}
        {/* ================================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-5 pt-4 max-h-[68vh] overflow-y-auto pr-1 animate-fadeIn">
            {/* Hero Principal del MotoMall */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/50 via-neutral-900 to-emerald-950/40 border-2 border-amber-500/40 flex flex-col lg:flex-row items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-black uppercase">
                    0% COMISIÓN POR VENTA • PEDIDOS DIRECTOS A TU WHATSAPP
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                    14 DÍAS DE PRUEBA GRATIS PARA COMERCIOS
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black font-racing uppercase text-white leading-tight">
                  El Primer Mall Conectado al{' '}
                  <span className="text-amber-400">Mantenimiento Predictivo</span> de cada Moto
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Cuando a un piloto se le agota el aceite, las pastillas de freno, la batería o el kit de arrastre en <strong>MotoDash AI</strong>, el sistema le recomienda automáticamente las tiendas y concesionarios aliados de su ciudad que tienen el repuesto exacto para su moto.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-racing font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>🛒 Soy Piloto: Ver Repuestos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stores')}
                  className="px-5 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 font-racing font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>🏪 Ver Tiendas Oficiales ({stores.length})</span>
                </button>
              </div>
            </div>

            {/* Encabezado y Conmutador de Planes de Suscripción B2B para Tiendas y Concesionarios */}
            <div className="text-center space-y-2 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                MEMBRESÍAS COMERCIALES B2B • PARA ALMACENES DE REPUESTOS, TALLERES Y CONCESIONARIOS
              </span>
              <h4 className="text-xl sm:text-2xl font-black font-racing uppercase text-white">
                Elige el Plan de tu Vitrina Comercial en MotoMall
              </h4>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {/* Selector Mensual / Anual (-25%) */}
                <div className="inline-flex bg-neutral-900 border border-neutral-800 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setMallBillingCycle('monthly')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-racing font-bold uppercase transition ${
                      mallBillingCycle === 'monthly'
                        ? 'bg-neutral-800 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Pago Mensual
                  </button>
                  <button
                    type="button"
                    onClick={() => setMallBillingCycle('annual')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-racing font-bold uppercase transition ${
                      mallBillingCycle === 'annual'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Anual (-25% Dto.)
                  </button>
                </div>

                {/* Selector Moneda COP / USD */}
                <div className="inline-flex bg-neutral-900 border border-neutral-800 p-1 rounded-2xl text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setMallCurrency('COP')}
                    className={`px-3 py-1.5 rounded-xl font-bold ${
                      mallCurrency === 'COP' ? 'bg-emerald-500 text-black' : 'text-neutral-400'
                    }`}
                  >
                    🇨🇴 $ COP
                  </button>
                  <button
                    type="button"
                    onClick={() => setMallCurrency('USD')}
                    className={`px-3 py-1.5 rounded-xl font-bold ${
                      mallCurrency === 'USD' ? 'bg-emerald-500 text-black' : 'text-neutral-400'
                    }`}
                  >
                    🌎 $ USD
                  </button>
                </div>
              </div>
            </div>

            {/* LAS 3 SUSCRIPCIONES B2B DEL MOTOMALL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plan 1: Vitrina Repuestera / Taller Local */}
              <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono uppercase text-neutral-300 font-bold">
                      🏪 Vitrina Repuestera / Taller
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      14 DÍAS GRATIS
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black font-telemetry text-white mt-1">
                    {mallCurrency === 'COP'
                      ? mallBillingCycle === 'annual'
                        ? '$39.900'
                        : '$49.900'
                      : mallBillingCycle === 'annual'
                      ? '$9.99'
                      : '$12.99'}{' '}
                    <span className="text-xs font-mono text-neutral-400 font-normal">
                      {mallCurrency} / mes
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    0% comisión por venta • Con 1 repuesto vendido al mes se paga solo
                  </p>

                  <ul className="text-xs text-neutral-300 space-y-2 mt-4 font-sans">
                    <li>✓ Vitrina con tu Logo propio y NIT verificado</li>
                    <li>✓ Hasta <strong>25 repuestos o servicios</strong> en catálogo</li>
                    <li>✓ Pedidos directos a tu <strong>WhatsApp Business</strong></li>
                    <li>✓ Conexión con el Mantenimiento Predictivo local</li>
                    <li>✓ Respaldo oficial del Fundador ({OFFICIAL_FOUNDER_NAME})</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMerchantPlan('vitrina_basica');
                    setStoreType('repuestos');
                    setActiveTab('merchant_portal');
                  }}
                  className="mt-5 w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-racing font-bold uppercase text-xs transition"
                >
                  Elegir Plan Vitrina Básica →
                </button>
              </div>

              {/* Plan 2: Almacén & Boutique Pro (MÁS POPULAR) */}
              <div className="p-5 rounded-3xl bg-neutral-900 border-2 border-amber-500 shadow-2xl shadow-amber-950/40 flex flex-col justify-between relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full whitespace-nowrap">
                  🔥 MÁS POPULAR • ALMACENES & BOUTIQUES
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 mt-1">
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" /> Almacén & Boutique PRO
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      14 DÍAS GRATIS
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black font-telemetry text-amber-400 mt-1">
                    {mallCurrency === 'COP'
                      ? mallBillingCycle === 'annual'
                        ? '$89.900'
                        : '$119.900'
                      : mallBillingCycle === 'annual'
                      ? '$22.99'
                      : '$29.99'}{' '}
                    <span className="text-xs font-mono text-neutral-300 font-normal">
                      {mallCurrency} / mes
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-amber-200 mt-0.5">
                    0% comisión por venta • Posicionamiento prioritario por IA
                  </p>

                  <ul className="text-xs text-neutral-200 space-y-2 mt-4 font-sans">
                    <li>✓ Hasta <strong>150 productos</strong> con fotos HD y referencia OEM</li>
                    <li className="text-amber-300 font-bold">
                      ✓ Recomendación Prioritaria cuando al piloto le sale Alerta en Mantenimiento Predictivo
                    </li>
                    <li className="text-emerald-300 font-bold">
                      ✓ Sello Dorado «Comercio Oficial Verificado ✅»
                    </li>
                    <li>✓ Filtro automático por Marca y Modelo de Moto</li>
                    <li>✓ Destacado en el Doctor Motor IA como proveedor</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMerchantPlan('almacen_pro');
                    setStoreType('repuestos');
                    setActiveTab('merchant_portal');
                  }}
                  className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-racing font-black uppercase text-xs shadow-lg shadow-amber-500/25 transition"
                >
                  Activar Plan Almacén PRO (14d Gratis) →
                </button>
              </div>

              {/* Plan 3: Concesionario Oficial & Red Nacional */}
              <div className="p-5 rounded-3xl bg-neutral-900/80 border border-cyan-500/40 hover:border-cyan-400 flex flex-col justify-between transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                      🏢 Concesionario Oficial VIP
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      14 DÍAS GRATIS
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black font-telemetry text-cyan-400 mt-1">
                    {mallCurrency === 'COP'
                      ? mallBillingCycle === 'annual'
                        ? '$189.900'
                        : '$249.900'
                      : mallBillingCycle === 'annual'
                      ? '$44.99'
                      : '$59.99'}{' '}
                    <span className="text-xs font-mono text-neutral-400 font-normal">
                      {mallCurrency} / mes
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-cyan-300 mt-0.5">
                    Ideal para Concesionarios 0 KM, Importadoras y Redes Multisede
                  </p>

                  <ul className="text-xs text-neutral-300 space-y-2 mt-4 font-sans">
                    <li className="text-cyan-300 font-bold">
                      ✓ Catálogo Ilimitado de Repuestos OEM + Vitrina de Motos 0 KM
                    </li>
                    <li className="text-emerald-300 font-bold">
                      ✓ Integrado al Guardián de Garantía (Agendamiento de revisiones 500km, 2.500km, 5.000km)
                    </li>
                    <li>✓ Cotizador directo de Motos Nuevas y Financiación</li>
                    <li>✓ Cobertura Nacional o Múltiples Sedes por Ciudad</li>
                    <li>✓ Supervisión directa con {OFFICIAL_FOUNDER_NAME}</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMerchantPlan('concesionario_vip');
                    setStoreType('concesionario');
                    setActiveTab('merchant_portal');
                  }}
                  className="mt-5 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-racing font-black uppercase text-xs transition shadow-lg shadow-cyan-500/20"
                >
                  Elegir Plan Concesionario Oficial →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 1: CATÁLOGO DE REPUESTOS, ACCESORIOS Y MOTOS 0 KM         */}
        {/* ================================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-4 pt-3">
            {/* Buscador y Categorías */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Buscar repuesto, aceite, batería, llantas o concesionario para ${activeBikeModel}...`}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {selectedStoreSlug && (
                <button
                  type="button"
                  onClick={() => setSelectedStoreSlug(null)}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-xs font-mono text-amber-300 flex items-center gap-1.5"
                >
                  <span>Viendo tienda: {stores.find((s) => s.slug === selectedStoreSlug)?.store_name}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {MALL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-racing font-bold whitespace-nowrap border transition ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-black border-amber-400 shadow'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grilla de Productos del Mall */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[55vh] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 flex flex-col justify-between transition group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-950 text-amber-300 border border-neutral-800 truncate">
                        🏪 {prod.store_name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
                        -{prod.discount_pct}% DTO. APP
                      </span>
                    </div>

                    {prod.image_url && (
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-black mb-2.5 border border-neutral-800">
                        <img src={prod.image_url} alt={prod.title} className="w-full h-full object-contain" />
                      </div>
                    )}

                    <h3 className="text-sm font-black font-racing uppercase text-white group-hover:text-amber-300 transition leading-snug">
                      {prod.title}
                    </h3>

                    <p className="text-[11px] font-mono text-cyan-300 mt-1">
                      🏍️ Compatible: {prod.compatible_models}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-2 pt-2 border-t border-neutral-800/80">
                      <span>Ref: {prod.oem_reference}</span>
                      <span className="text-emerald-400 font-bold">Stock: {prod.stock} disponibles</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 block">Precio Miembro MotoDash</span>
                      <span className="text-lg font-black font-telemetry text-white">
                        ${Number(prod.price).toLocaleString()}{' '}
                        <span className="text-xs font-mono text-amber-400">{prod.currency || 'COP'}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOrderViaWhatsApp(prod)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-racing font-black uppercase text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Comprar / Pedir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 2: DIRECTORIO DE TIENDAS Y CONCESIONARIOS OFICIALES       */}
        {/* ================================================================= */}
        {activeTab === 'stores' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-h-[62vh] overflow-y-auto pr-1">
            {stores.map((st) => (
              <div
                key={st.slug}
                style={{ borderColor: `${st.accent_color || '#F59E0B'}66` }}
                className="p-4 rounded-2xl bg-neutral-900/95 border-2 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    style={{ borderColor: st.accent_color || '#F59E0B' }}
                    className="w-14 h-14 rounded-2xl border-2 bg-neutral-950 flex items-center justify-center overflow-hidden flex-shrink-0"
                  >
                    {st.logo_url ? (
                      <img src={st.logo_url} alt={st.store_name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-7 h-7" style={{ color: st.accent_color || '#F59E0B' }} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {st.store_type === 'concesionario'
                          ? '🏢 Concesionario Oficial'
                          : st.store_type === 'boutique'
                          ? '🪖 Boutique & Accesorios'
                          : '🏪 Almacén de Repuestos'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Comercio Verificado
                      </span>
                    </div>

                    <h3 className="text-base font-black font-racing uppercase text-white mt-1">
                      {st.store_name}
                    </h3>
                    <p className="text-xs font-mono text-neutral-400">
                      {st.tax_id_nit} • 📍 {st.city} ({st.address})
                    </p>
                    <p className="text-[11px] font-mono text-amber-300 mt-1">
                      👑 Avalado por: {OFFICIAL_FOUNDER_NAME}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-800">
                  <div className="flex flex-wrap gap-1">
                    {(st.brands_supported || []).slice(0, 5).map((b) => (
                      <span
                        key={b}
                        className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStoreSlug(st.slug);
                      setActiveTab('catalog');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-racing font-black uppercase text-xs transition"
                  >
                    Ver Productos de esta Tienda →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 3: PORTAL B2B — REGISTRO DIFERENCIADO PARA TIENDAS        */}
        {/* ================================================================= */}
        {activeTab === 'merchant_portal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* COLUMNA 1: REGISTRO COMERCIAL B2B DE NUEVA TIENDA O CONCESIONARIO */}
            <form
              onSubmit={handleRegisterCommercialStore}
              className="p-4 rounded-2xl bg-neutral-900 border-2 border-amber-500/40 space-y-3"
            >
              <div className="border-b border-neutral-800 pb-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  PASO 1 • REGISTRO COMERCIAL DIFERENCIADO (B2B)
                </span>
                <h3 className="text-base font-black font-racing uppercase text-white">
                  🏢 Registrar Mi Almacén de Repuestos o Concesionario
                </h3>
                <p className="text-[11px] font-mono text-neutral-400">
                  Exclusivo para negocios con NIT/RUT. Incluye vitrina con logo propio y respaldo del Fundador ({OFFICIAL_FOUNDER_NAME}).
                </p>
              </div>

              {storeRegisteredMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs font-mono text-emerald-300">
                  {storeRegisteredMsg}
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <input
                  ref={storeLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleStoreLogoChange}
                />
                <div
                  onClick={() => storeLogoInputRef.current?.click()}
                  className="w-14 h-14 rounded-2xl border-2 border-amber-500 bg-neutral-900 flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
                >
                  {storeLogoUrl ? (
                    <img src={storeLogoUrl} alt="Logo Comercio" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-6 h-6 text-amber-400" />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => storeLogoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{storeLogoUrl ? 'Cambiar Logo Comercial' : 'Subir Logo de la Tienda / Concesionario'}</span>
                  </button>
                  <span className="text-[10px] font-mono text-neutral-500 block mt-1">
                    Tu logo oficial se mostrará en todas tus publicaciones del Mall.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-amber-300 uppercase font-bold block mb-1">
                    Plan de Membresía Comercial B2B (Incluye 14 Días Gratis) *
                  </label>
                  <select
                    value={selectedMerchantPlan}
                    onChange={(e) => setSelectedMerchantPlan(e.target.value)}
                    className="w-full bg-neutral-950 border-2 border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-bold"
                  >
                    <option value="vitrina_basica">
                      🏪 Plan Vitrina Repuestera / Taller — $49.900 COP/mes ($12.99 USD) • Hasta 25 productos
                    </option>
                    <option value="almacen_pro">
                      🚀 Plan Almacén & Boutique PRO — $119.900 COP/mes ($29.99 USD) • Hasta 150 productos + Prioridad IA
                    </option>
                    <option value="concesionario_vip">
                      🏢 Plan Concesionario Oficial VIP — $249.900 COP/mes ($59.99 USD) • Ilimitado + Motos 0 KM & Garantías
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Tipo de Comercio *
                  </label>
                  <select
                    value={storeType}
                    onChange={(e) => setStoreType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="repuestos">🏪 Almacén de Repuestos & Lubricantes</option>
                    <option value="concesionario">🏢 Concesionario Oficial (Motos 0 KM)</option>
                    <option value="taller">🔧 Taller Autorizado & Servicio</option>
                    <option value="boutique">🪖 Boutique (Cascos, CarPlay, Llantas)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    NIT / RUT / ID Fiscal *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeNit}
                    onChange={(e) => setStoreNit(e.target.value)}
                    placeholder="Ej: NIT 901.552.104-2"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Razón Social / Nombre de la Tienda o Concesionario *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ej: Repuestos & Motos Antioquia SAS"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Ciudad Sede *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeCity}
                    onChange={(e) => setStoreCity(e.target.value)}
                    placeholder="Medellín"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    WhatsApp Business de Ventas *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeWhatsapp}
                    onChange={(e) => setStoreWhatsapp(e.target.value)}
                    placeholder="Ej: 573001234567"
                    className="w-full bg-neutral-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-emerald-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Dirección Física del Local / Concesionario
                  </label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Ej: Cra 53 # 38-15 La Bayadera / Av. El Poblado"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Marcas que Maneja (Separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={storeBrands}
                    onChange={(e) => setStoreBrands(e.target.value)}
                    placeholder="TVS, YAMAHA, KTM, BAJAJ, HONDA, SUZUKI"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-amber-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registeringStore}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-racing font-black uppercase text-xs tracking-wider shadow-lg"
              >
                {registeringStore ? 'Registrando Comercio en MotoMall...' : '✅ Registrar Tienda / Concesionario en MotoMall'}
              </button>
            </form>

            {/* COLUMNA 2: PUBLICAR REPUESTO, ACCESORIO O MOTO 0 KM EN LA VITRINA */}
            <form
              onSubmit={handlePublishProduct}
              className="p-4 rounded-2xl bg-neutral-900 border-2 border-cyan-500/40 space-y-3"
            >
              <div className="border-b border-neutral-800 pb-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                  PASO 2 • PUBLICAR EN VITRINA COMERCIAL
                </span>
                <h3 className="text-base font-black font-racing uppercase text-white">
                  📦 Subir Repuesto, Accesorio o Moto 0 KM al Mall
                </h3>
                <p className="text-[11px] font-mono text-neutral-400">
                  Se conectará automáticamente con el Mantenimiento Predictivo de los pilotos que tengan esa moto.
                </p>
              </div>

              {prodPublishedMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs font-mono text-emerald-300">
                  {prodPublishedMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Seleccionar Tu Tienda / Concesionario *
                  </label>
                  <select
                    value={prodStoreSlug}
                    onChange={(e) => setProdStoreSlug(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-amber-300"
                  >
                    {stores.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.store_name} ({s.tax_id_nit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Nombre del Repuesto / Accesorio / Moto 0 KM *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="Ej: Filtro de Aceite Original TVS Apache 160/200 4V"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Categoría del Producto *
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  >
                    {MALL_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Referencia OEM / SKU
                  </label>
                  <input
                    type="text"
                    value={prodOem}
                    onChange={(e) => setProdOem(e.target.value)}
                    placeholder="Ej: OEM-N9080120"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Precio de Venta (COP) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="Ej: 45000"
                    className="w-full bg-neutral-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-emerald-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    % Descuento App / Stock
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={prodDiscount}
                      onChange={(e) => setProdDiscount(e.target.value)}
                      placeholder="% Dto"
                      className="w-1/2 bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-2 text-white"
                    />
                    <input
                      type="number"
                      min="1"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="Stock"
                      className="w-1/2 bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase block mb-1">
                    Motos Compatibles
                  </label>
                  <input
                    type="text"
                    value={prodModels}
                    onChange={(e) => setProdModels(e.target.value)}
                    placeholder="Ej: TVS Apache RTR 160 4V, 200 4V, Yamaha MT-09"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <input
                  ref={prodImgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProductImageChange}
                />
                <button
                  type="button"
                  onClick={() => prodImgInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{prodImageUrl ? '✓ Foto Cargada' : 'Subir Foto del Producto'}</span>
                </button>

                <button
                  type="submit"
                  disabled={publishingProd}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-racing font-black uppercase text-xs tracking-wider shadow-lg"
                >
                  {publishingProd ? 'Publicando...' : '🚀 Publicar en MotoMall'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
