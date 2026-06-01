# 🏡 ReState — Modern Real Estate Platform

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.5-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=flat-square&logo=docker)](https://www.docker.com/)

**ReState** is a full-stack, enterprise-grade real estate platform designed for property buyers, sellers, and agents. Built with a high-performance **Spring Boot** backend and a reactive, interactive **Next.js** frontend, ReState offers seamless property listings, real-time messaging, map exploration, push notifications, and robust security integrations.

---

## 🚀 Key Features

*   **🔒 Secure Authentication**: Multi-flow JWT authentication supporting HTTP-only secure cookies (for Web) and authorization headers (for Mobile). Integrates **Google OAuth 2.0 (Google Sign-in)** and OTP-based email verification.
*   **🏡 Property Management**: Detailed listings supporting transaction types (Sale/Rent), pricing, property attributes (bedrooms, bathrooms, area), and image uploads. Includes advanced serverside searching and filtering.
*   **📍 Interactive Maps Integration**: Fully integrated with the Google Maps API for geolocated property browsing and distance exploration.
*   **💬 Real-Time Chat System**: STOMP over SockJS WebSocket communication, allowing clients and agents to message each other instantly. Includes conversation management and chat history persistence.
*   **🔔 Push & In-App Notifications**: Backed by **Firebase Cloud Messaging (FCM)** to dispatch real-time web push notifications to user devices when a client expresses interest in a property or receives a message.
*   **🛡️ Performance & API Protection**: **Redis**-backed rate-limiting using the **Bucket4j** token bucket algorithm. Built-in CORS protections and token blocklisting upon logout.
*   **☁️ Media Storage**: Seamless image uploading directly integrated with **Cloudinary** for image processing, hosting, and dynamic CDN delivery.

---

## 🛠️ Technology Stack

### Backend (`/Backend`)
*   **Core Framework**: Spring Boot 4.0.5 (Java 17)
*   **Database & ORM**: PostgreSQL, Spring Data JPA, Hibernate (DDL-auto updates)
*   **Caching & Limiting**: Redis, Bucket4j Redis rate-limiting
*   **Security**: Spring Security, JJWT (JSON Web Token), Google API Client (OAuth)
*   **Push Notifications**: Firebase Admin SDK (FCM)
*   **Media**: Cloudinary Http5 Client
*   **Mailing**: Spring Boot Starter Mail (SMTP)
*   **Utilities**: Lombok, Jackson (Datatypes & JSR310 support)

### Frontend (`/web-ui`)
*   **Core Framework**: Next.js 16.2.3 (App Router), React 19.2.4, TypeScript
*   **Styling**: Tailwind CSS v4, Radix UI primitive components, Shadcn/UI, Lucide icons, Sonner Toast
*   **State Management**: Zustand
*   **Data Fetching**: TanStack React Query (`@tanstack/react-query`), Axios
*   **Real-time Communication**: `@stomp/stompjs`, `sockjs-client`
*   **Maps**: `@react-google-maps/api`
*   **Forms**: React Hook Form, Zod validation
*   **Messaging UI**: `@chatscope/chat-ui-kit-react`

---

## 📂 Directory Structure

```text
ReState/
├── Backend/                    # Spring Boot Application
│   ├── .mvn/                   # Maven Wrapper configuration
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/restate/app/
│   │   │   │   ├── config/     # Security, Web, Redis, Firebase configs
│   │   │   │   ├── controller/ # REST Endpoints
│   │   │   │   ├── dto/        # Request/Response payloads
│   │   │   │   ├── entity/     # JPA Models (User, Property, Address, etc.)
│   │   │   │   ├── filter/     # Security and JWT filters
│   │   │   │   ├── repository/ # Database Queries
│   │   │   │   ├── service/    # Business Logic
│   │   │   │   └── utils/      # Standard Helpers
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── firebase-service-account.json
│   │   └── test/               # Unit and Integration tests
│   ├── Dockerfile
│   └── docker-compose.yml       # Production-ready orchestration
└── web-ui/                     # Next.js Frontend App
    ├── app/                    # Next.js Pages & Routing
    │   ├── (auth)/             # Login, Signup, Reset Password, OTP Verify
    │   ├── (main-site)/        # Dashboard, Explore (Map), Chat, Profile
    │   └── globals.css
    ├── components/             # Reusable UI Components
    ├── hooks/                  # Custom React Hooks
    ├── lib/                    # Shared libraries & clients (Axios, Axios-Interceptors)
    ├── public/                 # Static Assets
    ├── services/               # API Integration Services
    └── package.json
```

---

## ⚙️ Environment Configuration

### 1. Backend Settings (`Backend/.env`)
Create a `.env` file in the `Backend/` folder. Use the following keys:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `POSTGRES_DB` | Database Name | `restate` |
| `POSTGRES_USER` | PostgreSQL Username | `restate_user` |
| `POSTGRES_PASSWORD` | PostgreSQL Password | `your_db_password` |
| `REDIS_PASSWORD` | Secure password for Redis | `your_redis_password` |
| `SECRET_KEY` | HS256 JWT signing key | *Generate using `openssl rand -base64 64`* |
| `EMAIL` | SMTP Sender Gmail Address | `your_gmail@gmail.com` |
| `EMAIL_PASS` | Gmail App Password (16 characters) | `abcd efgh ijkl mnop` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your_google_client_id.apps.googleusercontent.com` |
| `FRONTEND_URL` | Cross-Origin Frontend Domain | `http://localhost:3000` |
| `CLOUD_NAME` | Cloudinary Account Name | `your_cloud_name` |
| `CLOUD_KEY` | Cloudinary API Key | `your_cloudinary_key` |
| `CLOUD_SECRET` | Cloudinary API Secret | `your_cloudinary_secret` |
| `FIREBASE_CONFIG_JSON` | Firebase service account credentials (JSON) | `{"type":"service_account",...}` |
| `VAPID_KEY` | Firebase Push Notification Key | `your_firebase_vapid_key` |

### 2. Frontend Settings (`web-ui/.env`)
Create a `.env` file in the `web-ui/` folder:

```env
NEXT_PUBLIC_API_URL="http://localhost:8080"
SECRET_KEY="your_auth_secret_key"
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
CLIENT_SECRET="your_google_client_secret"
NEXT_PUBLIC_MAP_API_KEY="your_google_maps_api_key"

# Firebase Config (for FCM push notifications)
NEXT_PUBLIC_FCM_API_KEY="your_fcm_api_key"
NEXT_PUBLIC_FCM_AUTH_DOMAIN="restate-app.firebaseapp.com"
NEXT_PUBLIC_FCM_PROJECT_ID="restate-app"
NEXT_PUBLIC_FCM_STORAGE_BUCKET="restate-app.firebasestorage.app"
NEXT_PUBLIC_FCM_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FCM_APP_ID="your_app_id"
NEXT_PUBLIC_FCM_VAPID_KEY="your_fcm_vapid_key"
```

---

## 🏃 Quick Start

### Option A: Complete Docker Orchestration (Recommended)
Spin up PostgreSQL, Redis, and the Spring Boot application together.

1. Ensure Docker Desktop is installed and running.
2. From the root directory, navigate to `Backend/` and start the stack:
   ```bash
   cd Backend
   docker-compose --env-file .env up -d --build
   ```
3. Run the Frontend locally:
   ```bash
   cd ../web-ui
   npm install
   npm run dev
   ```
4. Access the web app at `http://localhost:3000`.

---

### Option B: Local Developer Run (Manual)

#### 1. Setup Infrastructure
*   Install and run **PostgreSQL** (default port `5432`). Create a database named `restate`.
*   Install and run **Redis** (default port `6379`).

#### 2. Start the Spring Boot Backend
1. Copy `Backend/.env.example` to `Backend/.env` and edit the values to match your local setup.
2. Run the application using Maven:
   ```bash
   cd Backend
   ./mvnw spring-boot:run
   ```
   The API server will launch at `http://localhost:8080`.

#### 3. Start the Next.js Frontend
1. Copy the environment parameters into `web-ui/.env`.
2. Install client dependencies and run the Next.js dev server:
   ```bash
   cd web-ui
   npm install
   npm run dev
   ```
   The site will load at `http://localhost:3000`.

---

## 🔌 API Endpoints Summary

### Auth Services (`/api/v1/auth`)
*   `POST /register` – Initialize new user details.
*   `POST /register-user` – Complete profile registration (step configuration).
*   `POST /login` – Log in to user dashboard (Sets access/refresh tokens in secure cookies).
*   `POST /refresh-token` – Rotate JWT tokens.
*   `POST /logout` – Log out user & blacklist tokens.
*   `POST /google` – Authenticate with Google Sign-in token.
*   `POST /forgot-password` – Generate recovery OTP email.
*   `POST /reset-password` – Set new password.

### Property Services (`/api/v1/properties`)
*   `GET /` – Paginated and filterable property listings.
*   `GET /trending` – Get popular listings.
*   `GET /{id}` – Detail view of a property.
*   `POST /` – Add a new property (Agent/Broker).
*   `PUT /{id}` – Update property details.
*   `DELETE /{id}` – Remove a listing.
*   `POST /{propertyId}/interest` – Express buyer interest (dispatches notifications).

### Communication Services (`/api/v1/chat` & `/ws`)
*   `GET /api/v1/chat/conversations` – List chat interactions.
*   `GET /api/v1/chat/messages/{convoId}` – Fetch message history.
*   `WebSocket Connection Path: /ws` – WebSocket gateway utilizing STOMP.
