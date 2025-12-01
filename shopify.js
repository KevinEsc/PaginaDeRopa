// Archivo placeholder para integración con Shopify.
// Cuando facilites las credenciales, reemplazar el contenido de `initShopify`
// para inicializar el SDK de storefront y renderizar productos.

window.initShopify = async function initShopify(opts){
  // opts = { domain, storefrontAccessToken }
  if(!opts || !opts.domain || !opts.storefrontAccessToken){
    console.warn('initShopify: faltan credenciales. Llamar initShopify({domain, storefrontAccessToken}) cuando estén disponibles.');
    return;
  }

  // Ejemplo: si se añade el SDK, inicializar aquí.
  // const client = ShopifyBuy.buildClient({
  //   domain: opts.domain,
  //   storefrontAccessToken: opts.storefrontAccessToken
  // });
  // ... renderizado de productos en #store-grid

  console.log('Inicializando Shopify para', opts.domain);
  // (aquí añadirías la carga de productos y botones de compra)
}
