# Fullstack E-Commerce Application

[![Backend CI](https://github.com/HuyThanh05/e-Commerce/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/HuyThanh05/e-Commerce/actions/workflows/backend-ci.yml)

A fullstack e-commerce web application with three roles — **Admin**, **Seller**, and **User** — built with Spring Boot and React.

## Features

### Admin
- Manage products, categories, and sellers (CRUD)
- Manage all orders and update order status
- View sales analytics dashboard

### Seller
- Manage own products (CRUD)
- View and update status of own orders

### User
- Browse, search, and filter products
- Add to cart, manage cart quantity
- Save shipping addresses
- Checkout with Stripe payment
- View order history

## Tech Stack

### Frontend (`ecom-frontend`)
- **Framework/Library:** React.js, Vite
- **State Management:** Redux
- **Styling:** Tailwind CSS / Material UI
- **HTTP Client:** Axios

### Backend (`sb-ecom`)
- **Framework:** Spring Boot, Spring Security
- **Language:** Java 17
- **Build Tool:** Maven
- **Database:** MySQL (via Spring Data JPA / Hibernate)
- **API Architecture:** RESTful API
- **Auth:** JWT (cookie-based)
- **Payment:** Stripe
- **API Docs:** Swagger / OpenAPI

## Backend environment variables

The backend reads credentials from environment variables. Do not commit their values.

```text
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
JWT_COOKIE_SECURE=false
STRIPE_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Set `JWT_COOKIE_SECURE=true` when the backend is served over HTTPS.

## Demo Accounts

| Role   | Username | Password  |
|--------|----------|-----------|
| Admin  | admin    | adminPass |
| Seller | seller1  | password2 |
| User   | user1    | password1 |

<img width="1901" height="830" alt="Home" src="https://github.com/user-attachments/assets/d0c42d1d-fff3-440e-b15b-a62bcca921e2" />
