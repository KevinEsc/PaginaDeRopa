import type { ActionFunctionArgs, HeadersFunction } from "react-router";
import { Form, redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const title = form.get('title');
  const price = form.get('price');

  if (!title) {
    return { error: 'Title required' };
  }

  const { admin } = await authenticate.admin(request);

  // Crear producto con una variante con el precio proporcionado
  const resp = await admin.graphql(
    `#graphql
      mutation productCreate($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product { id title handle }
          userErrors { field message }
        }
      }
    `,
    {
      variables: {
        product: {
          title,
          variants: [{ price: price || '0.00' }],
        },
      },
    },
  );

  const json = await resp.json();
  const userErrors = json.data?.productCreate?.userErrors || [];
  if (userErrors.length) {
    return { errors: userErrors };
  }

  return redirect('/app/products');
};

export default function NewProduct() {
  return (
    <s-page heading="Create product">
      <s-section heading="New product">
        <Form method="post">
          <label>
            <div>Title</div>
            <input name="title" type="text" />
          </label>
          <label style={{ display: 'block', marginTop: 12 }}>
            <div>Price</div>
            <input name="price" type="text" placeholder="0.00" />
          </label>
          <div style={{ marginTop: 12 }}>
            <button className="s-button" type="submit">Create</button>
          </div>
        </Form>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
