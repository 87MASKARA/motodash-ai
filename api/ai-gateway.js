/**
 * MotoDash AI — Serverless AI Gateway (/api/ai-gateway)
 * Mantiene la llave GEMINI_API_KEY 100% protegida en el servidor de Vercel
 * para que nunca quede expuesta en el navegador del cliente.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
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

    const parts = [{ text: prompt.slice(0, 6000) }];
    if (base64Image && typeof base64Image === 'string') {
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
            temperature,
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
