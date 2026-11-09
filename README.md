# MotoDash AI 🏍️⚡
> **The Intelligent Cockpit for Every Motorcycle**  
> *Dominio sugerido:* `motodashai.com`

---

## 🎯 Visión del Proyecto
MotoDash AI es una plataforma global SaaS que transforma el teléfono o pantalla de cualquier motociclista en un dashboard digital hiperpersonalizado. Mediante Inteligencia Artificial generativa y telemetría, el sistema analiza la marca, modelo, año y color de la moto para configurar automáticamente:

1. **Dashboard Paramétrico:** Tacómetro de RPM con redline oficial de fábrica, velocímetro GPS y medidor de combustible/batería adaptados al chasis y colores de la moto.
2. **Design Tokens Dinámicos:** Paleta de colores e interfaz inspirada en la pintura real (ej. Yamaha Icon Blue, KTM Ready to Race Orange, Ducati Rosso Corsa, Kawasaki Lime Green).
3. **Mantenimiento Predictivo:** Calendario de servicios oficiales calculado con IA según los kilómetros reales recorridos.
4. **Monetización Global:** Modelo Freemium con suscripción Rider Pro vía Lemon Squeezy / Stripe.

---

## 🛠️ Stack Tecnológico
- **Frontend:** Next.js / React + Tailwind CSS + Lucide Icons + Framer Motion.
- **Backend & DB:** Supabase (PostgreSQL + Auth + Edge Functions).
- **Motor IA:** Google Gemini Flash (Structured JSON Outputs).
- **Telemetría:** Geolocation API (Velocidad satelital sin hardware) + Bluetooth Web API (OBD-II ELM327 opcional).
- **Pagos Globales:** Lemon Squeezy (Merchant of Record para cobro internacional libre de complicaciones fiscales).

---

## 📂 Estructura Planificada
```
MOTODASH AI/
├── src/
│   ├── components/
│   │   ├── Dashboard/        # Tacómetro, Velocímetro, Odómetro, TPMS
│   │   ├── Onboarding/       # Selector de moto, colores OEM y generador IA
│   │   ├── Subscription/     # Paywall y planes globales
│   │   └── Common/           # Botones, modales y tarjetas
│   ├── hooks/
│   │   ├── useDeviceGps.js   # Lectura de velocidad y odómetro satelital
│   │   └── useBluetoothObd.js# Lectura de RPM vía Bluetooth (opcional)
│   ├── services/
│   │   ├── aiGenerator.js    # Llamada a Gemini con Schema JSON
│   │   └── supabase.js       # Base de datos y autenticación
│   └── types/
│       └── dashboard.ts      # Esquema de datos estricto
└── README.md
```

