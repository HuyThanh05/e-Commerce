# Fullstack E-Commerce Application

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

## Demo Accounts

| Role   | Username | Password  |
|--------|----------|-----------|
| Admin  | admin    | adminPass |
| Seller | seller1  | password2 |
| User   | user1    | password1 |

<img width="1901" height="830" alt="Home" src="https://github.com/user-attachments/assets/d0c42d1d-fff3-440e-b15b-a62bcca921e2" />
