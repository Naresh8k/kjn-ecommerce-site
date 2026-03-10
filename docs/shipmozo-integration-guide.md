# ShipMozo Integration Guide — KJN Shop

> **Prepared for:** KJN Trading Company  
> **Stack:** Next.js 15 (frontend) · Node.js / Express (backend) · PostgreSQL / Prisma  
> **ShipMozo Docs:** https://app.shipmozo.com/api-docs

---

## Table of Contents

1. [What Was Implemented](#1-what-was-implemented)
2. [Files Changed or Created](#2-files-changed-or-created)
3. [Database Changes](#3-database-changes)
4. [Environment Variables to Set](#4-environment-variables-to-set)
5. [Step-by-Step Setup in ShipMozo Dashboard](#5-step-by-step-setup-in-shipmozo-dashboard)
6. [How the Admin Workflow Works](#6-how-the-admin-workflow-works)
7. [How the Customer Experience Works](#7-how-the-customer-experience-works)
8. [Webhook — Status Auto-Update Mapping](#8-webhook--status-auto-update-mapping)
9. [API Endpoints Reference](#9-api-endpoints-reference)
10. [Things to Verify / Test After Going Live](#10-things-to-verify--test-after-going-live)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. What Was Implemented

### Overview

The integration connects your KJN Shop backend directly to ShipMozo's API. Once wired up, the full order fulfillment lifecycle — from shipment booking to delivery — is handled automatically with no manual status changes needed by the admin.

### Feature List

| Feature | Details |
|---|---|
| **Create Shipment** | Admin clicks one button in the order modal to book the courier on ShipMozo. Weight is auto-calculated from product data. |
| **AWB Stored** | ShipMozo returns an AWB number and courier name which are saved to the order in your database. |
| **Live Tracking (Customer)** | Customer's order detail page shows a live timeline of scan events pulled directly from ShipMozo in real time. |
| **Live Tracking (Admin)** | Admin can click "Live Track" in the order modal to see the same scan timeline. |
| **Cancel Shipment** | Admin can cancel a ShipMozo shipment from the order modal before pickup. |
| **Serviceability Check** | Admin endpoint to check if a destination pincode is serviceable before creating a shipment. |
| **Webhook Auto-Updates** | ShipMozo posts status events to your server. Your backend automatically updates the order status, sends the customer an email, and creates an in-app notification — no manual admin action required. |

---

## 2. Files Changed or Created

### Backend — New Files

| File | Purpose |
|---|---|
| `backend/src/config/shipmozo.js` | ShipMozo API wrapper. Contains `createShipment`, `trackShipment`, `getServiceability`, `cancelShipment` functions. All API calls go through here. |
| `backend/src/modules/shipmozo/shipmozo.controller.js` | All request handlers: create shipment, track order, track by AWB, cancel shipment, check serviceability, and the webhook handler. |
| `backend/src/modules/shipmozo/shipmozo.routes.js` | Express routes for all ShipMozo endpoints. |

### Backend — Modified Files

| File | What Changed |
|---|---|
| `backend/src/index.js` | Added `app.use('/api/shipmozo', ...)` to register the ShipMozo routes. |
| `backend/prisma/schema.prisma` | Added `shipmozoShipmentId` (String?) and `shipmozoCourier` (String?) fields to the `Order` model. |
| `backend/src/modules/orders/order.controller.js` | Minor: `updateOrderStatus` no longer passes `undefined` for tracking fields (uses conditional spread). `getOrderById` query comment added for clarity. |
| `backend/.env` | Added `SHIPMOZO_API_KEY` and `SHIPMOZO_WEBHOOK_SECRET` placeholder keys. |

### Database Migration Applied

```
migrations/20260310093519_add_shipmozo_fields/migration.sql
```

Adds two nullable columns to the `orders` table:
- `shipmozoShipmentId VARCHAR`
- `shipmozoCourier VARCHAR`

### Frontend — Modified Files

| File | What Changed |
|---|---|
| `frontend/app/admin/orders/page.js` | Added **ShipMozo panel** inside the order detail modal. Shows create-shipment form or existing shipment info with live track and cancel buttons. |
| `frontend/app/orders/[id]/page.js` | Added **Live Tracking section** that appears automatically when an order is SHIPPED or later. Shows AWB, courier, and a scan event timeline from ShipMozo. |

---

## 3. Database Changes

Two new columns were added to the `Order` table:

```sql
ALTER TABLE "Order"
  ADD COLUMN "shipmozoShipmentId" TEXT,
  ADD COLUMN "shipmozoCourier"    TEXT;
```

These are nullable. Orders that existed before this integration will have `NULL` in both columns.

The migration has already been applied to the local database. When deploying to production, run:

```bash
npx prisma migrate deploy
```

---

## 4. Environment Variables to Set

Open `backend/.env` and fill in these two values with your real ShipMozo credentials:

```env
# ShipMozo
SHIPMOZO_API_KEY=your_shipmozo_api_key
SHIPMOZO_WEBHOOK_SECRET=your_shipmozo_webhook_secret
```

### Where to find these values

| Variable | Where to get it |
|---|---|
| `SHIPMOZO_API_KEY` | ShipMozo Dashboard ? **Settings** ? **API** ? copy the API Token |
| `SHIPMOZO_WEBHOOK_SECRET` | ShipMozo Dashboard ? **Settings** ? **Webhooks** ? set a secret and copy it here (optional but recommended for security) |

> **Important:** Never commit the real `.env` file to Git. The `.env` is already in `.gitignore`.

---

## 5. Step-by-Step Setup in ShipMozo Dashboard

### Step 1 — Get Your API Key

1. Log in to [https://app.shipmozo.com](https://app.shipmozo.com)
2. Go to **Settings** ? **API Integration**
3. Copy the **API Token / Bearer Token**
4. Paste it as `SHIPMOZO_API_KEY` in `backend/.env`

### Step 2 — Configure Your Pickup Address (Warehouse)

1. In ShipMozo, go to **Settings** ? **Pickup Address**
2. Add your warehouse address:
   - **Address:** SY No 444/3, Near Bharat Petroleum, Kadiri Road
   - **City:** Mulakalacheruvu
   - **State:** Andhra Pradesh
   - **Pincode:** 517390
   - **Phone:** 9804599804
3. Mark it as the **default pickup address**

> ShipMozo uses this address for all pickup requests. If it is not set, shipment creation will fail.

### Step 3 — Register the Webhook URL

1. In ShipMozo, go to **Settings** ? **Webhooks** (or **Tracking Notifications**)
2. Add a new webhook:
   - **URL:** `https://your-domain.com/api/shipmozo/webhook`
   - **Events:** Select **all status events** (Picked Up, In Transit, Out for Delivery, Delivered, Cancelled, RTO, etc.)
   - **Method:** POST
   - **Format:** JSON
3. If ShipMozo asks for a secret/token, set one and copy it to `SHIPMOZO_WEBHOOK_SECRET` in your `.env`
4. Save the webhook

> For local development testing, use a tool like [ngrok](https://ngrok.com) to expose your local server:
> ```bash
> ngrok http 5000
> # Use the https://xxxx.ngrok.io/api/shipmozo/webhook URL in ShipMozo
> ```

### Step 4 — Verify API Connectivity

After setting the API key, restart your backend server and create a test shipment for an order. Check your backend logs for:

```
[ShipMozo] Shipment created: { shipmozoShipmentId: "...", awbNumber: "...", courierName: "..." }
```

---

## 6. How the Admin Workflow Works

### Before This Integration (Old Flow)

```
Order arrives
  -> Admin packs items
  -> Admin ships with ShipMozo manually
  -> Admin copies AWB number
  -> Admin opens order in admin panel
  -> Admin manually changes status to SHIPPED
  -> Admin types in AWB number
  -> Admin changes status to OUT_FOR_DELIVERY manually
  -> Admin changes status to DELIVERED manually
```

### After This Integration (New Flow)

```
Order arrives
  -> Admin packs items
  -> Admin opens order modal -> clicks "Create Shipment on ShipMozo"
  -> Done. Everything else is automatic.

ShipMozo courier picks up
  -> Webhook fires -> Order becomes PROCESSING automatically
  -> Customer gets notification

Courier dispatches the package
  -> Webhook fires -> Order becomes SHIPPED automatically
  -> Customer gets email: "Your order is on its way!"
  -> Customer gets in-app notification

Package out for delivery
  -> Webhook fires -> Order becomes OUT_FOR_DELIVERY automatically
  -> Customer gets email: "Arriving today! Keep Rs. X ready (COD)"
  -> Customer gets in-app notification

Package delivered
  -> Webhook fires -> Order becomes DELIVERED automatically
  -> COD orders are automatically marked PAID
  -> Customer gets email: "Order Delivered - Rate your products"
  -> Customer gets in-app notification
  -> Customer can now leave product reviews
```

### What the Admin Sees in the Order Modal

**Before creating shipment:**

- Orange "ShipMozo Shipping" panel
- Optional weight input field (auto-calculated from product weights if left empty)
- Shows payment type (COD/Prepaid), total amount, and destination pincode
- "Create Shipment on ShipMozo" button

**After creating shipment:**

- ShipMozo Shipment ID
- AWB number (with copy button)
- Courier name
- "Live Track" button — fetches real-time scan events
- "Cancel" button — cancels the shipment on ShipMozo

---

## 7. How the Customer Experience Works

### Order Detail Page (`/orders/[id]`)

When the order status is `SHIPPED`, `OUT_FOR_DELIVERY`, or `DELIVERED`, a **Live Tracking** section appears automatically below the status stepper.

**What the customer sees:**

1. AWB number displayed prominently
2. Courier name (e.g., "Delhivery", "Xpressbees")
3. A timeline of scan events:
   - Most recent event highlighted at the top
   - Each event shows: status text, location, and date/time
4. If ShipMozo has no scan events yet: "Your package is on its way. Tracking events will appear here soon."
5. If the API is down: "Live tracking is not available right now. Check back later."

### Emails Sent Automatically

| Event | Email Subject |
|---|---|
| Shipment picked up | *(no email — PROCESSING is internal)* |
| Order shipped | "Your Order #KJNxxxxxx Has Been Shipped" |
| Out for delivery | "Out for Delivery - Order #KJNxxxxxx" |
| Delivered | "Order Delivered - #KJNxxxxxx" |

---

## 8. Webhook — Status Auto-Update Mapping

The webhook handler maps ShipMozo's status strings to your internal `OrderStatus` enum. Here is the complete mapping:

| ShipMozo Status String | Your Order Status |
|---|---|
| pickup scheduled | PROCESSING |
| pickup generated | PROCESSING |
| out for pickup | PROCESSING |
| picked up | PROCESSING |
| pickup done | PROCESSING |
| manifested | PROCESSING |
| in transit | SHIPPED |
| shipment booked | SHIPPED |
| shipped | SHIPPED |
| dispatched | SHIPPED |
| reached at hub | SHIPPED |
| reached at destination hub | SHIPPED |
| out for delivery | OUT_FOR_DELIVERY |
| with delivery agent | OUT_FOR_DELIVERY |
| delivered | DELIVERED |
| delivery done | DELIVERED |
| cancelled | CANCELLED |
| rto initiated | RETURNED |
| rto in transit | RETURNED |
| rto delivered | RETURNED |
| return initiated | RETURNED |
| return in transit | RETURNED |
| return delivered | RETURNED |

> **Anti-regression guard:** The system will never downgrade a status. For example, if an order is already DELIVERED, a late webhook for SHIPPED will be ignored.

> **Adding new statuses:** If ShipMozo sends a status string not in the table above, it is silently ignored. Add it to the `SHIPMOZO_STATUS_MAP` object in `backend/src/modules/shipmozo/shipmozo.controller.js` if needed.

---

## 9. API Endpoints Reference

All endpoints are prefixed with `/api/shipmozo`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/webhook` | None (public) | Receives status updates from ShipMozo. Called by ShipMozo, not by your app. |
| `POST` | `/orders/:orderId/create-shipment` | Admin | Books a shipment on ShipMozo for the given order. |
| `POST` | `/orders/:orderId/cancel-shipment` | Admin | Cancels the shipment on ShipMozo. |
| `GET` | `/serviceability?pincode=&weight=&paymentMode=` | Admin | Checks if a pincode is serviceable. |
| `GET` | `/orders/:orderId/track` | Logged-in user | Returns live tracking for the order (customer can only see their own order). |
| `GET` | `/track/:awbNumber` | Public | Returns live tracking by AWB number directly. |

### Create Shipment — Request Body (Optional Overrides)

```json
{
  "weightGrams": 1500,
  "length": 20,
  "breadth": 15,
  "height": 12
}
```

All fields are optional. If `weightGrams` is omitted, it is calculated automatically from the `weightGrams` field of each product in the order (falls back to 500g per item if not set on the product).

---

## 10. Things to Verify / Test After Going Live

### Checklist

- [ ] `SHIPMOZO_API_KEY` is set in production `.env`
- [ ] Pickup address is configured in ShipMozo dashboard
- [ ] Webhook URL is registered in ShipMozo dashboard pointing to `https://your-domain.com/api/shipmozo/webhook`
- [ ] Webhook events: all status events are selected
- [ ] Create a test shipment for a real order and confirm:
  - [ ] ShipMozo Shipment ID appears in the order modal
  - [ ] AWB number is saved to the order
  - [ ] Courier name appears
- [ ] Wait for courier pickup and confirm:
  - [ ] Order status changes to PROCESSING automatically in admin panel
  - [ ] Customer receives in-app notification
- [ ] Wait for delivery and confirm:
  - [ ] Order status changes to DELIVERED automatically
  - [ ] Customer receives delivery email
  - [ ] COD order shows payment status PAID

### Product Weights (Recommended)

For accurate shipping cost calculation and weight input on ShipMozo, set the `weightGrams` field on your products in the admin panel. This field is used to auto-calculate the total shipment weight when creating a shipment.

---

## 11. Troubleshooting

### "SHIPMOZO_API_KEY is not configured"

Your `.env` file still has `your_shipmozo_api_key` as the value. Replace it with the real API token from ShipMozo dashboard.

### Shipment creation fails with 401 / Unauthorized

The API key is wrong or expired. Go to ShipMozo ? Settings ? API and regenerate the token.

### Shipment creation fails with 422 / Validation Error

Common causes:
- Pickup address not set in ShipMozo dashboard (most common)
- Destination pincode not serviceable — use the serviceability check endpoint first
- Weight is 0 or negative

### Webhook is not firing

1. Confirm the webhook URL is correctly registered in ShipMozo dashboard
2. Confirm your server is publicly accessible (not `localhost`)
3. Check your backend logs for `[ShipMozo Webhook]` entries
4. Use ngrok for local testing

### Order status not changing after webhook fires

Check backend logs for:
- `[ShipMozo Webhook] Unmapped status "..."` — add the status to `SHIPMOZO_STATUS_MAP`
- `[ShipMozo Webhook] Order not found` — the AWB on the webhook does not match any order; confirm the order was created through your system
- `[ShipMozo Webhook] already at X, skipping downgrade` — the order is already at a higher status, this is expected behaviour

### Live tracking shows "not available"

- The order may not have an AWB yet (shipment not created)
- ShipMozo tracking API may be temporarily down
- The AWB may not have any scan events yet (normal for first few hours after pickup)

---

## Summary

| Task | Who Does It | How |
|---|---|---|
| Add API key | Developer | Set `SHIPMOZO_API_KEY` in `.env` |
| Add pickup address | Admin/Developer | ShipMozo dashboard ? Settings ? Pickup Address |
| Register webhook | Developer | ShipMozo dashboard ? Settings ? Webhooks |
| Book a shipment | Admin | Order modal ? "Create Shipment on ShipMozo" button |
| Track status updates | Automatic | ShipMozo webhook ? your backend |
| Customer tracking | Automatic | Live Tracking section on order detail page |
