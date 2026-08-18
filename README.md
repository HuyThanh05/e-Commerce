# E-Commerce Platform

[![Backend CI](https://github.com/HuyThanh05/e-Commerce/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/HuyThanh05/e-Commerce/actions/workflows/backend-ci.yml)
![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)

A full-stack, role-based e-commerce application built with Spring Boot and React. It supports product and inventory management, persistent shopping carts, checkout, Stripe payments, Cloudinary image storage, and authentication with either credentials or Google OAuth 2.0.

## Highlights

- Role-based access for administrators, sellers, and customers
- JWT authentication using secure HTTP-only cookies
- Google OAuth 2.0 / OpenID Connect login
- Product catalogue with search, filtering, sorting, and pagination
- Persistent cart with stock and quantity validation
- Checkout with saved shipping addresses
- Stripe Payment Intents with VND payment verification
- Product image upload and deletion through Cloudinary
- Sales analytics and order-management dashboards
- Unit and API integration tests executed by GitHub Actions
- Swagger/OpenAPI documentation

## Roles

| Role | Capabilities |
| --- | --- |
| Admin | Manage categories, products, sellers, orders, and analytics |
| Seller | Manage owned products and process seller-related orders |
| Customer | Browse products, manage a cart and addresses, and place orders |

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Redux, Axios, Tailwind CSS, Material UI |
| Backend | Java 17, Spring Boot, Spring MVC, Spring Security |
| Authentication | JWT cookies, Google OAuth 2.0 / OpenID Connect |
| Persistence | MySQL, Spring Data JPA, Hibernate |
| Payments | Stripe Payment Intents |
| Media | Cloudinary |
| API documentation | Springdoc OpenAPI / Swagger UI |
| Testing and CI | JUnit 5, Mockito, MockMvc, GitHub Actions |

## Repository Structure

```text
e-Commerce/
├── .github/workflows/     # GitHub Actions workflows
├── ecom-frontend/         # React/Vite client
├── sb-ecom/               # Spring Boot API
└── README.md
```

## Prerequisites

- Java 17 or newer
- Maven 3.9+
- Node.js 20+
- MySQL 8+
- Stripe and Cloudinary accounts for payment and image features
- Google Cloud OAuth credentials for Google login

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/HuyThanh05/e-Commerce.git
cd e-Commerce
```

### 2. Configure the backend

The backend reads credentials and environment-specific settings from environment variables. Never commit real secret values.

```text
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/ecommerce
DB_USERNAME=ecommerce_user
DB_PASSWORD=change-me
JWT_SECRET=base64-encoded-secret-with-sufficient-length
JWT_COOKIE_SECURE=false

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OAUTH2_FRONTEND_REDIRECT_URI=http://localhost:5173/oauth2/redirect

STRIPE_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Start the API:

```bash
cd sb-ecom
mvn spring-boot:run
```

The backend runs at `http://localhost:5000`.

### 3. Configure the frontend

Create `ecom-frontend/.env.local`:

```text
VITE_BACK_END_URL=http://localhost:5000
VITE_FRONT_END_URL=http://localhost:5173
VITE_STRIPE_PUBLISHABLE_KEY=
```

Install dependencies and start Vite:

```bash
cd ecom-frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Google OAuth Setup

Create a **Web application** OAuth client in Google Auth Platform and configure:

```text
Authorized JavaScript origin:
http://localhost:5173

Authorized redirect URI:
http://localhost:5000/login/oauth2/code/google
```

The Google client secret belongs only in `GOOGLE_CLIENT_SECRET`; it must never be stored in `application.properties` or committed to Git.

## Testing

Run backend unit and API integration tests:

```bash
cd sb-ecom
mvn test
```

Build the frontend for production:

```bash
cd ecom-frontend
npm run build
```

GitHub Actions runs the Maven test suite automatically for every push and pull request.

## API Documentation

With the backend running, Swagger UI is available at:

```text
http://localhost:5000/swagger-ui/index.html
```

## Security Notes

- Use `JWT_COOKIE_SECURE=true` in production and serve the application over HTTPS.
- Restrict CORS to trusted frontend origins when credentials are enabled.
- Keep database, JWT, Google, Stripe, and Cloudinary secrets outside source control.
- The backend calculates payable totals from persisted cart data rather than trusting amounts supplied by the browser.
- Use Stripe webhooks and database migrations before operating the project as a production store.

## License

This project is currently provided for learning and portfolio purposes. Add a license before distributing or accepting external contributions.
