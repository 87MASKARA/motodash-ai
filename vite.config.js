import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function localAiGatewayPlugin(env) {
  return {
    name: 'local-ai-gateway',
    configureServer(server) {
      server.middlewares.use('/api/ai-gateway', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });
        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr || '{}');
            const apiKey =
              env.GEMINI_API_KEY ||
              env.VITE_GEMINI_API_KEY ||
              process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY no configurada', fallback: true }));
              return;
            }
            const { prompt, base64Image, mimeType = 'image/jpeg', temperature = 0.1 } = body;
            const parts = [{ text: String(prompt || '').slice(0, 5500) }];
            if (base64Image && typeof base64Image === 'string') {
              const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
              parts.push({
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64
                }
              });
            }

            const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
            for (const modelName of models) {
              const generationConfig = {
                temperature: Number(temperature) || 0.1,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json'
              };
              if (modelName.startsWith('gemini-2.5')) {
                generationConfig.thinkingConfig = { thinkingBudget: 0 };
              }
              const r = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contents: [{ parts }], generationConfig })
                }
              );
              if (r.ok) {
                const json = await r.json();
                const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                const cleaned = rawText.replace(/```json|```/g, '').trim();
                const match = cleaned.match(/\{[\s\S]*\}/);
                const parsed = JSON.parse(match ? match[0] : cleaned);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, model: modelName, data: parsed }));
                return;
              }
            }
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No se pudo obtener respuesta de Gemini', fallback: true }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message, fallback: true }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), localAiGatewayPlugin(env)],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    server: {
      port: 3000,
      open: true
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('lucide-react')) return 'vendor-icons';
              return 'vendor-core';
            }
            if (id.includes('src/components/Modals/')) {
              return 'feature-modals';
            }
            if (id.includes('src/services/') || id.includes('src/i18n/')) {
              return 'feature-services';
            }
          }
        }
      }
    }
  };
});
