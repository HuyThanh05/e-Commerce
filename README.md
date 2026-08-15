# Fullstack E-Commerce Application
## Tech Stack
###  Frontend (`ecom-frontend`)
- **Framework/Library:** React.js, Vite
- **State Management:** Redux
- **Styling:** Tailwind CSS / Material UI
- **HTTP Client:** Axios
###  Backend (`sb-ecom`)
- **Framework:** Spring Boot, Spring Security
- **Language:** Java
- **Build Tool:** Maven
- **Database:** MySQL
- **API Architecture:** RESTful API

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
