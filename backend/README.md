# Backend — Guía de uso

El backend Express incluye las rutas de autenticación OAuth con Shopify.

## Instalación

```bash
cd backend
npm install
```

## Configuración

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Completa los valores:
   - `SHOPIFY_API_KEY`: API Key de tu app Shopify
   - `SHOPIFY_API_SECRET`: API Secret
   - `SHOPIFY_REDIRECT_URI`: URL de callback (p. ej. `http://localhost:3000/api/auth/callback`)
   - `SHOPIFY_SCOPES`: Permisos solicitados

## Ejecución

Desarrollo (con auto-reload):
```bash
npm run dev
```

Producción:
```bash
npm start
```

El servidor estará en `http://localhost:3000`.

## Rutas de API

### POST /api/auth
Inicia el flujo de autenticación.

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"shop":"mi-tienda.myshopify.com"}'
```

Respuesta:
```json
{
  "authUrl": "https://mi-tienda.myshopify.com/admin/oauth/authorize?...",
  "redirectUrl": "https://mi-tienda.myshopify.com/admin/oauth/authorize?..."
}
```

### GET /api/auth/callback
Callback automático desde Shopify. Redirige a esta ruta.

### GET /api/health
Verifica el estado del servidor.

```bash
curl http://localhost:3000/api/health
```

Respuesta:
```json
{"status":"ok","timestamp":"2025-12-01T..."}
```

## Integración con frontend

Desde `shopify.js` o tu código frontend, llama a:

```js
// Iniciar auth
fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ shop: 'mi-tienda.myshopify.com' })
})
.then(r => r.json())
.then(data => {
  // Redirigir al usuario a data.authUrl
  window.location.href = data.authUrl;
});
```

Notas:
- El token de acceso se devuelve en `/api/auth/callback`. En producción, guárdalo en base de datos.
- La validación HMAC está comentada por defecto (descomenta en producción).
