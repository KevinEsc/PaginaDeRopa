import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const resp = await admin.graphql(
    `#graphql
      query listProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              publishedAt
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    sku
                  }
                }
              }
            }
          }
        }
      }
    `,
    { variables: { first: 25 } },
  );

  const json = await resp.json();
  const products = json.data?.products?.edges?.map((e: any) => e.node) || [];

  return { products };
};

export default function Products() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Products">
      <s-section heading="List of products">
        {products.length === 0 ? (
          <s-paragraph>No products found.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {products.map((p: any) => (
              <s-box
                key={p.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 96, height: 96, overflow: "hidden", borderRadius: 8 }}>
                    {p.images?.edges?.[0]?.node?.url ? (
                      <img src={p.images.edges[0].node.url} alt={p.images.edges[0].node.altText || p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)'}} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <s-heading size="subdued">{p.title}</s-heading>
                    <div style={{ color: 'var(--muted)', marginTop: 6 }}>{p.handle}</div>
                    <div style={{ marginTop: 8 }}>
                      <strong>Variant price:</strong>{' '}
                      {p.variants?.edges?.[0]?.node?.price || '—'}
                    </div>
                  </div>
                  <div>
                    <s-button
                      onClick={() => {
                        (window as any).Shopify?.AppBridge?.Intents?.invoke?.('edit:shopify/Product', { value: p.id });
                      }}
                      variant="secondary"
                    >
                      Edit
                    </s-button>
                  </div>
                </div>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Soporta acciones desde la UI: eliminar producto
  const form = await request.formData();
  const _action = form.get('_action');
  const productId = form.get('productId') as string | null;

  if (_action === 'delete' && productId) {
    const { admin } = await authenticate.admin(request);
    // Ejecutar mutación de eliminación
    const resp = await admin.graphql(
      `#graphql
        mutation productDelete($id: ID!) {
          productDelete(input: { id: $id }) {
            deletedProductId
            userErrors { field message }
          }
        }
      `,
      { variables: { id: productId } },
    );

    // Podríamos comprobar userErrors en resp.json(), pero redirigimos de vuelta al listado.
    return redirect('/app/products');
  }

  return null;
};
