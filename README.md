# Menswear Store

A full-stack men's clothing e-commerce starter built with React, Tailwind CSS, Node.js, Express, MongoDB, and Razorpay-ready checkout.

## What is included

- JWT authentication with register, login, profile, forgot password, and reset password
- Customer profile with multiple addresses, wishlist, saved cart, and order history
- Product catalog with category/size/price filters, real-time search, sorting, featured sections, reviews, and ratings
- Cart, coupon support, step-based checkout flow, Razorpay payment creation, payment verification, and order confirmation flow
- Admin dashboard with seeded admin login, product create/edit/delete, order status updates, and metrics
- Nodemailer-based order email hook
- Deployment-ready folder split for frontend and backend

## Project structure

```text
menswear-store/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      seed/
      utils/
  frontend/
    src/
      api/
      components/
      context/
      pages/
```

## Sample credentials

- Admin: `admin@menswearstore.com` / `Admin@123`
- Customer: `customer@example.com` / `Customer@123`

## Local setup

1. Install MongoDB locally or use MongoDB Atlas.
2. In `backend`, copy `.env.example` to `.env` and fill in the values.
3. In `frontend`, copy `.env.example` to `.env`.
4. From the project root run:

```bash
npm install
npm run install:all
```

5. Seed the database:

```bash
npm run seed
```

6. Start frontend and backend together:

```bash
npm run dev
```

7. Open `http://localhost:5173`.

## Environment notes

### Backend `.env`

- `MONGO_URI`: Mongo connection string
- `JWT_SECRET`: long random secret
- `CLIENT_URL`: frontend URL, usually `http://localhost:5173`
- `SMTP_*`: email settings for password reset and order confirmation
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Razorpay test credentials

### Frontend `.env`

- `VITE_API_URL`: usually `http://localhost:5000/api`
- `VITE_RAZORPAY_KEY_ID`: optional mirror of the Razorpay key for client-side use

## Razorpay test flow

- If Razorpay keys are configured and the Razorpay checkout script loads, checkout opens the Razorpay modal.
- If keys are not configured, the project falls back to a local test confirmation path so the order flow can still be tested end to end.

## Deployment

### Frontend on Vercel

1. Import the `frontend` folder as a Vercel project.
2. Set `VITE_API_URL` to your deployed backend API URL.
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend on Render or Railway

1. Import the `backend` folder as a Node service.
2. Set all backend environment variables from `.env.example`.
3. Build command: `npm install`
4. Start command: `npm start`

### Database

- Use MongoDB Atlas for production.
- Add the deployed backend IP/network access in Atlas if required.

## Practical implementation notes

- Product images are managed through image URLs to keep the starter easy to understand and deploy without object storage.
- The admin panel supports multiple product images, per-size stock, flags for featured/new/best seller, and inline editing.
- Reviews are restricted to users with a paid order containing that product.
- Cart state is stored in localStorage so it survives refresh.

## Recommended next improvements

- Move image management to Cloudinary or S3
- Add SMS provider integration
- Add inventory low-stock alerts
- Add refresh tokens and stricter rate limiting

