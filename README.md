# AM Luxury Jewelry — Engraving App

A professional jewelry engraving personalisation tool for [amluxjewelry.com](https://amluxjewelry.com), built with React 18 + Vite + Fabric.js.

---

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` — test with URL params:

```
http://localhost:5173/?img=https://via.placeholder.com/800x800/f8f6f1/c6a25a.png&title=Forever+Pendant&shape=rect-oct
```

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import → select repo
3. Framework: **Vite** (auto-detected)
4. Click **Deploy** — done

Your URL will be `https://your-project.vercel.app`

---

## Adding the Shape Metafield in Shopify

1. In your Shopify Admin → **Settings → Custom data → Products**
2. Add a new metafield:
   - **Namespace**: `engraving`
   - **Key**: `shape`
   - **Type**: Single line text
3. On each product's page, set the `engraving.shape` value to one of:
   - `circle`, `rect-sharp`, `rect-round`, `rect-oct`, `square`, `oval-v`, `oval-h`, `heart`, `star`

---

## Embedding in Shopify

1. Copy the contents of `shopify-snippet.liquid`
2. Replace `YOUR-APP-URL` with your Vercel URL
3. In Shopify Admin → **Online Store → Themes → Edit code**
4. Either:
   - **Option A**: Add as a snippet (`snippets/am-engraving.liquid`) and `{% render 'am-engraving' %}` inside your product form
   - **Option B**: In the Theme Editor, add a **Custom Liquid** block to the product template and paste the code directly

Place the snippet **inside** your `<form>` tag (before the Add to Cart button) so the hidden `properties[Engraving]` inputs are submitted with the cart.

---

## How it Works

1. Shopify product page → customer clicks **Personalise Your Piece**
2. App opens in a popup with product image, title, and shape via URL params
3. Customer designs their engraving (text, image, or symbol), constrained to the engraving zone
4. Customer clicks **Confirm Design** → preview screen
5. Customer clicks **Add to Cart** → app sends `postMessage` to Shopify:

```js
{
  type: 'AM_ENGRAVING_CONFIRMED',
  text: "Forever & Always",
  font: "Playfair Display",
  size: 24,
  imageDataUrl: "data:image/png;base64,...",
  engravingData: "Text: Forever & Always | Font: Playfair Display | Size: 24px"
}
```

6. Shopify stores engraving as line item properties and shows confirmation badge

---

## Supported Shapes

| Value | Description |
|-------|-------------|
| `circle` | Round pendant |
| `rect-sharp` | Sharp-corner rectangle |
| `rect-round` | Rounded rectangle |
| `rect-oct` | Octagon / chamfered (Forever Pendant style) |
| `square` | Square |
| `oval-v` | Vertical oval |
| `oval-h` | Horizontal oval |
| `heart` | Heart shape |
| `star` | 5-point star |

---

## Environment Variables

See `.env.example`. No required variables — the app works with URL params only.
