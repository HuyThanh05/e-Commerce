# Amazing Shop — E-Commerce Platform

[![Backend CI](https://github.com/HuyThanh05/e-Commerce/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/HuyThanh05/e-Commerce/actions/workflows/backend-ci.yml)
![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

A full-stack marketplace built with Spring Boot and React. The project focuses on secure authentication, product and inventory management, persistent carts, transactional checkout, and online payment.

## Key Features

- Role-based access for customers, sellers, and administrators
- JWT authentication with HTTP-only cookies and Google OAuth 2.0
- Product search, filtering, sorting, pagination, and wishlist
- Cart and checkout with server-side price and stock validation
- Stripe Payment Intents and saved shipping addresses
- Seller product/order management and admin dashboard
- Product image storage with Cloudinary
- Unit and API integration tests with GitHub Actions CI

## Tech Stack

| Backend | Frontend | Infrastructure |
| --- | --- | --- |
| Java 17, Spring Boot, Spring Security, JPA/Hibernate | React 19, Vite, Redux, Axios, Tailwind CSS, Material UI | MySQL, H2, Stripe, Cloudinary, GitHub Actions |

## Project Structure

```text
e-Commerce/
├── ecom-frontend/          # React application
├── sb-ecom/                # Spring Boot REST API
└── .github/workflows/      # CI workflow
```

## Run Locally

Requirements: Java 17+, Maven 3.9+, and Node.js 20+.

```bash
git clone https://github.com/HuyThanh05/e-Commerce.git
cd e-Commerce/sb-ecom
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The `local` profile uses an embedded H2 database and automatically creates sample products and a seller account.

In another terminal:

```bash
cd e-Commerce/ecom-frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger-ui/index.html`

### Demo Seller

```text
Username: seller
Password: Seller@123
```

## External Services

Configure these environment variables only when using the related integration:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OAUTH2_FRONTEND_REDIRECT_URI=http://localhost:5173/oauth2/redirect

STRIPE_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Frontend environment (`ecom-frontend/.env.local`):

```text
VITE_BACK_END_URL=http://localhost:5000
VITE_FRONT_END_URL=http://localhost:5173
VITE_STRIPE_PUBLISHABLE_KEY=
```

Never commit real credentials or API keys.

## Testing

```bash
cd sb-ecom
mvn test

cd ../ecom-frontend
npm run build
```

Backend tests run automatically on every push and pull request through GitHub Actions.

## Purpose

This project was developed for learning and portfolio purposes.
