# MiTienda — Frontend ligero

Proyecto estático con 3 páginas: `index.html`, `tienda.html` y `contacto.html`.

Características:
- Animaciones suaves y eficientes usando `gsap` y `IntersectionObserver`.
- Renderizado perezoso para minimizar CPU/GPU hasta que el usuario interactúe.
- `tienda.html` preparado para integrarse con Shopify mediante `initShopify` en `shopify.js`.

Cómo probar localmente:

```bash
# Desde la carpeta del proyecto
python3 -m http.server 8000
# Abrir http://localhost:8000
```

Integración con Shopify:

1. Provee las credenciales: `domain` (p. ej. `mi-tienda.myshopify.com`) y `storefrontAccessToken`.
2. En la consola del navegador, llama a:

```js
initShopify({ domain: 'mi-tienda.myshopify.com', storefrontAccessToken: 'TOK' })
```

3. Alternativamente, puedes modificar `shopify.js` para inicializar automáticamente. El archivo incluye un ejemplo comentado para el SDK oficial `buy-button-storefront`.

Recomendaciones de despliegue:
- Para producción, build con Vite/Svelte/React si quieres añadir más interactividad y un pipeline de assets.
- Hospeda en Netlify/Cloudflare Pages o Vercel; son rápidos y fáciles de integrar con GitHub.
