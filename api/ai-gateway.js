/**
 * MotoDash AI — Serverless AI Gateway Protegido (/api/ai-gateway)
 * - Mantiene GEMINI_API_KEY 100% oculta en el servidor de Vercel.
 * - Incluye Rate Limiting por IP (máx. 25 solicitudes/minuto por IP) contra abuso de bots.
 * - Valida Origin/Referer y limita el tamaño de prompt e imagen.
 */

const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQ_PER_WINDOW = 25;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= MAX_REQ_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Validación básica de Origin / Referer para bloquear consumo desde dominios externos
  const origin = String(req.headers?.origin || req.headers?.referer || '').toLowerCase();
  const host = String(req.headers?.host || '').toLowerCase();
  if (
    origin &&
    host &&
    !origin.includes(host) &&
    !origin.includes('localhost') &&
    !origin.includes('127.0.0.1') &&
    !origin.includes('vercel.app') &&
    !origin.includes('motodash')
  ) {
    return res.status(403).json({ error: 'Origen no autorizado' });
  }

  // 2. Rate Limiting por IP
  const clientIp =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Demasiadas consultas seguidas. Espera 1 minuto.',
      fallback: true
    });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY no configurada en el servidor',
      fallback: true
    });
  }

  try {
    const { prompt, base64Image, mimeType = 'image/jpeg', temperature = 0.15 } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt requerido' });
    }

    const parts = [{ text: prompt.slice(0, 5500) }];
    if (base64Image && typeof base64Image === 'string') {
      // Limitar tamaño máximo de imagen en base64 (~2.5 MB)
      if (base64Image.length > 3500000) {
        return res.status(413).json({ error: 'Imagen demasiado grande', fallback: true });
      }
      const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: cleanBase64
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: Math.min(1, Math.max(0, Number(temperature) || 0.15)),
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error desde Gemini API', fallback: true });
    }

    const result = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Error interno en AI Gateway',
      fallback: true
    });
  }
}
