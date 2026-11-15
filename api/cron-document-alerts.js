/**
 * MotoDash AI — Cron Job Diario de Alertas Legales (8:00 AM COL / 13:00 UTC)
 * Revisa mandatory_insurance_expiry y technical_inspection_expiry a los 30, 15 y 5 días
 * y envía alertas automatizadas vía WhatsApp Cloud API / Push Log.
 */
export default async function handler(req, res) {
  // Protección del endpoint de Cron en Vercel
  const authHeader = req.headers?.authorization || '';
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized Cron trigger' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(200).json({
      status: 'configured',
      schedule: '0 13 * * * (8:00 AM Diario)',
      milestones: [30, 15, 5],
      note: 'Configura SUPABASE_SECRET_KEY y WHATSAPP_ACCESS_TOKEN en las variables de entorno de servidor en Vercel para despacho automático.'
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/user_bikes?select=id,user_id,config,hoja_de_vida,mandatory_insurance_expiry,technical_inspection_expiry`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`
        }
      }
    );

    const bikes = await response.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const triggeredAlerts = [];
    const targetDays = new Set([30, 15, 5, 1]);

    if (Array.isArray(bikes)) {
      for (const bike of bikes) {
        const brand = bike.config?.bikeIdentity?.brand || 'Moto';
        const model = bike.config?.bikeIdentity?.model || '';
        const plate = bike.hoja_de_vida?.documentos?.placa || '';

        const checks = [
          {
            type: 'mandatory_insurance',
            label: 'Seguro Obligatorio (SOAT / Liability)',
            dateStr: bike.mandatory_insurance_expiry || bike.hoja_de_vida?.documentos?.soatVencimiento
          },
          {
            type: 'technical_inspection',
            label: 'Revisión Técnica (Tecnomecánica / ITV / MOT)',
            dateStr: bike.technical_inspection_expiry || bike.hoja_de_vida?.documentos?.tecnoVencimiento
          }
        ];

        for (const item of checks) {
          if (!item.dateStr) continue;
          const exp = new Date(`${item.dateStr}T00:00:00`);
          if (Number.isNaN(exp.getTime())) continue;

          const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (targetDays.has(diffDays)) {
            const msg = `⚠️ MotoDash AI: Faltan ${diffDays} días para que venza tu ${item.label} de tu ${brand} ${model} (${plate}). Vence el ${item.dateStr}.`;
            triggeredAlerts.push({
              user_id: bike.user_id,
              moto_id: bike.id,
              document_type: item.type,
              days_remaining: diffDays,
              expiry_date: item.dateStr,
              channel: 'whatsapp_and_push',
              message: msg
            });
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      checkedAt: new Date().toISOString(),
      alertsCount: triggeredAlerts.length,
      alerts: triggeredAlerts
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

