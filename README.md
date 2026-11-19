# MQ Adorn — Storefront

Customer-facing storefront for **MQ Adorn**, a jewellery-first online store with a separate Dresses section.
Built with **React 19**, **Vite**, **Tailwind CSS 4** and **React Router**, backed by a Laravel REST API.

> Status: **Step 1 — project setup** (design system, shared layout, routing and placeholder pages).

## Features (planned)

- Home page with hero banner, shop-by-category, best sellers and new arrivals
- Shop with Jewellery and Dresses tabs, filters (category, price, sale), sorting and search
- Product pages with image gallery, colour and size variants, wishlist and WhatsApp order button
- Cart and guest checkout with manual payment (JazzCash, Easypaisa, bank transfer) and payment screenshot upload
- Customer accounts, order history and admin-approved order reviews

## Design system

| Token | Value | Use |
|---|---|---|
| `primary` | `#1A1A1A` | Text, buttons, footer |
| `gold` | `#D4AF37` | Accents, highlights |
| `cream` | `#FAF7F2` | Page background |
| `card` | `#FFFFFF` | Cards |
| `blush` | `#F8E8E6` | Soft sections |
| `muted` | `#6B7280` | Secondary text |
| `sale` | `#B91C1C` | Sale badges |
| `success` | `#16A344` | Success states |

Fonts: **Playfair Display** (headings) and **Poppins** (body). Tokens are defined with `@theme` in `src/index.css`.

## Project structure

```
src/
  api/        API client (fetch wrapper for the Laravel backend)
  components/ Header, Footer, Logo, AnnouncementBar, icons, shared UI
  context/    Cart and wishlist state
  layouts/    MainLayout (announcement bar + header + footer)
  pages/      Route pages: Home, Shop, Product, Cart, Checkout, Dresses
```

## Routes

`/` · `/shop` · `/product/:slug` · `/cart` · `/checkout` · `/dresses`

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL to the backend API
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Deployment

Deployed on Vercel. `vercel.json` rewrites all routes to `index.html` for client-side routing.
Set `VITE_API_URL` in the Vercel project settings.

## Author

**Qurratulain Naseem** — [GitHub](https://github.com/qurratulain-dev) · [LinkedIn](https://www.linkedin.com/in/qurratulain-dev/)
