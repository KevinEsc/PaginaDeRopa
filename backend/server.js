require('dotenv').config();
const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS simple (ajusta según necesites)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ============================================================
// Rutas de autenticación para Shopify
// ============================================================

/**
 * POST /api/auth
 * Inicia el flujo de autenticación OAuth con Shopify.
 * Body esperado: { shop: "mi-tienda.myshopify.com" }
 */
app.post('/api/auth', async (req, res) => {
  try {
    const { shop } = req.body;

    if (!shop) {
      return res.status(400).json({ error: 'Campo "shop" requerido' });
    }

    // Validar formato de tienda (simple)
    if (!shop.includes('.myshopify.com')) {
      return res.status(400).json({ error: 'Formato de tienda inválido' });
    }

    // Construir URL de autorización
    const apiKey = process.env.SHOPIFY_API_KEY;
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/callback`;
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_orders';

    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return res.json({ authUrl, redirectUrl: authUrl });
  } catch (error) {
    console.error('Error en /api/auth:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/callback
 * Callback que Shopify usa para enviar el código de autorización.
 * Parámetros query: ?code=...&hmac=...&shop=...&state=...&timestamp=...
 */
app.get('/api/auth/callback', async (req, res) => {
  try {
    const { code, shop, hmac, state, timestamp } = req.query;

    if (!code || !shop) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (code, shop)' });
    }

    // Validar HMAC (recomendado para seguridad)
    // const crypto = require('crypto');
    // const message = qs.stringify({ code, shop, state, timestamp });
    // const hash = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    //   .update(message, 'utf8').digest('base64');
    // if (hash !== hmac) {
    //   return res.status(401).json({ error: 'HMAC inválido' });
    // }

    // Intercambiar código por token de acceso
    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('Faltan SHOPIFY_API_KEY o SHOPIFY_API_SECRET en .env');
      return res.status(500).json({ error: 'Configuración incompleta del servidor' });
    }

    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenData = {
      client_id: apiKey,
      client_secret: apiSecret,
      code: code
    };

    const response = await axios.post(tokenUrl, tokenData);
    const { access_token, scope } = response.data;

    // Aquí puedes guardar el token en base de datos, sesión, etc.
    console.log(`Token generado para ${shop}:`, access_token);

    // Responder con el token (en producción: guardarlo de forma segura)
    return res.json({
      success: true,
      shop,
      accessToken: access_token,
      scope,
      message: 'Autenticación completada exitosamente'
    });
  } catch (error) {
    console.error('Error en /api/auth/callback:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================================
// Rutas de prueba
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir archivos estáticos del frontend (opcional)
app.use(express.static(path.join(__dirname, '../')));

// Ruta raíz (página de inicio)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.path });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('Rutas disponibles:');
  console.log('  POST /api/auth — Iniciar autenticación');
  console.log('  GET /api/auth/callback — Callback de Shopify');
  console.log('  GET /api/health — Estado del servidor');
});
