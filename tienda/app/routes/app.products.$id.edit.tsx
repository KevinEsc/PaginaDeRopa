import type { ActionFunctionArgs, LoaderFunctionArgs, HeadersFunction } from "react-router";
import { Form, redirect, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const id = params.id as string;

  const resp = await admin.graphql(
    `#graphql
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          images(first: 1) { edges { node { id url altText } } }
          variants(first: 1) { edges { node { id price sku } } }
        }
      }
    `,
    { variables: { id } },
  );

  const json = await resp.json();
  const product = json.data?.product || null;
  return { product };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const _action = form.get('_action');
  const title = form.get('title');
  const price = form.get('price');
  const id = params.id as string;

  const { admin } = await authenticate.admin(request);

  if (_action === 'delete') {
    await admin.graphql(
      `#graphql
        mutation productDelete($id: ID!) {
          productDelete(input: { id: $id }) { deletedProductId }
        }
      `,
      { variables: { id } },
    );

    return redirect('/app/products');
  }

  // Update title
  if (title) {
    await admin.graphql(
      `#graphql
        mutation productUpdate($product: ProductInput!) {
          productUpdate(product: $product) {
            product { id title }
            userErrors { field message }
          }
        }
      `,
      { variables: { product: { id, title } } },
    );
  }

  // Update variant price (si existe)
  if (price) {
    // Obtener variant id: para simplicidad usamos una segunda llamada para leer el primer variant id
    const readResp = await admin.graphql(
      `#graphql
        query getVariant($id: ID!) {
          product(id: $id) { variants(first:1) { edges { node { id } } } }
        }
      `,
      { variables: { id } },
    );
    const readJson = await readResp.json();
    const variantId = readJson.data?.product?.variants?.edges?.[0]?.node?.id;
    if (variantId) {
      await admin.graphql(
        `#graphql
          mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkUpdate(productId: $productId, variants: $variants) {
              productVariants { id price }
            }
          }
        `,
        { variables: { productId: id, variants: [{ id: variantId, price: price }] } },
      );
    }
  }

  return redirect('/app/products');
};

export default function EditProduct() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Edit product">
      <s-section heading="Edit">
        <Form method="post">
          <label>
            <div>Title</div>
            <input name="title" defaultValue={product?.title || ''} />
          </label>
          <label style={{ display: 'block', marginTop: 12 }}>
            <div>Price</div>
            <input name="price" defaultValue={product?.variants?.edges?.[0]?.node?.price || ''} />
          </label>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="s-button" type="submit">Save</button>
            <button
              className="s-button"
              name="_action"
              value="delete"
              formMethod="post"
              type="submit"
              style={{ background: 'rgba(255,90,90,0.12)', color: 'white' }}
            >
              Delete
            </button>
          </div>
        </Form>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
