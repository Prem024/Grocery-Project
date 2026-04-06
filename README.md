# Grocery Stock Management System - Comprehensive Project Guide

Welcome to the **Grocery Stock Management System**. This document provides a highly detailed breakdown of the application's architecture, data flow, features, and setup instructions. It is designed to help developers understand exactly how the MERN (MongoDB, Express.js, React.js, Node.js) stack components interact with each other to form a complete, production-ready system.

---

## 🏗️ 1. High-Level System Architecture

The project follows a standard decoupled Client-Server architecture:

1. **Client (Frontend)**: A single-page application (SPA) built with React.js and Vite. It handles the UI, client-side routing (React Router), and global state management (Redux Toolkit).
2. **Server (Backend)**: A RESTful API built with Node.js and Express.js. It handles business logic, security, and data persistence.
3. **Database**: MongoDB handles data storage, utilizing Mongoose ODM for schema validation and relational references via `ObjectIds`.

```text
[ React Frontend ]  <--(JSON/HTTP over Axios)-->  [ Express Node.js API ]  <--Mongoose-->  [ MongoDB ]
```

---

## 🔄 2. Data Flow & Logical Workflows

Understanding how information moves through the application is critical. Here are the core flows:

### A. The Request Life Cycle (Backend)
When the React client makes an API request (e.g., creating a new product), it follows this precise path:
1. **Route Match** (`server/routes/productRoutes.js`): The request hits the router.
2. **Authentication Middleware** (`server/middleware/authMiddleware.js`): Checks the `Authorization: Bearer <token>` header. If valid, the user ID is attached to `req.user`. If invalid, returns `401 Unauthorized`.
3. **Validation Middleware** (`server/validators/`): `express-validator` checks the payload (e.g., ensuring `price` is a positive number).
4. **Controller Logic** (`server/controllers/productController.js`): Runs the core business logic (e.g., finding the supplier, checking sku uniqueness).
5. **Database Operation** (`server/models/productModel.js`): Mongoose executes the query and saves it to MongoDB.
6. **Response**: The Controller formats the successful DB record into a standard JSON response and sends it back to the client.

### B. The State Management Life Cycle (Frontend)
When the UI triggers an event (e.g., user clicks "Add Stock"), the Redux + Axios flow activates:
1. **UI Component** (`Inventory.jsx`): Collects form data and calls the API directly.
2. **Axios Interceptor** (`client/src/api/axiosInstance.js`): Automatically reads the JWT from local storage and attaches it to the request header.
3. **API Promise**: Waits for the Backend response.
4. **Redux Dispatch**: Once the response is successful, the component dispatches an action to the Redux Store (`dispatch(addTransaction(res.data))`).
5. **UI Update**: Redux updates the global state, and React automatically re-renders the tables and stats cards globally.

### C. The Inventory/Product Sync Flow (Core Business Logic)
The most critical feature of the system is the Inventory sync logic:
1. A user completes a **Stock In** event for 50 Apples.
2. The `POST /api/inventory` endpoint receives the request.
3. The `inventoryController` first queries the `Product` collection for "Apples".
4. It increments the Apple's `quantity` property by 50 using `$inc`.
5. It then logs the transaction in the `Inventory` collection.
6. **Result**: Both the global Product list and the Inventory transaction history are perpetually perfectly in sync.

---

## 🗄️ 3. Database Schema Relationships

The application uses 5 core Mongoose schemas. They are highly relational:

*   **User**: Stores authentication data (`email`, `password` hashed by bcrypt) and roles.
*   **Supplier**: The vendor supplying the products.
*   **Category**: The grouping entity (e.g., "Dairy", "Vegetables").
*   **Product**: The core item.
    *   *Relations*: Contains `category` (refs Category schema) and `supplier` (refs Supplier schema).
    *   *Properties*: Tracks `quantity` and `minStock` (used to trigger low-stock alerts). 
*   **Inventory**: The ledger log. Every time stock is added or removed, a record is kept here.
    *   *Relations*: Contains `product` (refs Product schema) and `performedBy` (refs User schema).

---

## 📁 4. Comprehensive Folder Structure Map

### Backend Directory (`server/`)
```text
server/
├── config/                 # db.js contains the MongoDB connection logic.
├── controllers/            # House the core business logic (Auth, Product, Inventory logic)
├── middleware/             # Interceptors for requests:
│   ├── authMiddleware.js   # Verifies JWTs
│   ├── errorMiddleware.js  # Catches server crashes and formats custom error JSON
│   └── validateMiddleware.js # Parses express-validator results
├── models/                 # Mongoose Schemas definitions and relation setups
├── routes/                 # Express Router configuration mapping URLs to Controllers
├── utils/                  # Utility scripts:
│   └── seed.js             # ⚠️ CRITICAL: Script to wipe the DB and inject initial dummy data
├── validators/             # Rules ensuring bad data never reaches the controllers
├── .env                    # Environment variables (Port, Mongo URI, JWT Secret)
└── server.js               # The entrypoint. Configures Express app, CORS, Helmet, etc.
```

### Frontend Directory (`client/`)
```text
client/
├── public/                 # Static assets
├── src/
│   ├── api/                # Abstracts Axios calls into functions (e.g., productApi.js)
│   │   └── axiosInstance.js# ⚠️ CRITICAL: Injects Auth headers and handles 401 logouts globally
│   ├── components/         # Reusable UI parts:
│   │   ├── Layout/         # Sidebar, Navbar, and Layout wrappers
│   │   └── UI/             # Modals, Pagination, Loaders
│   ├── hooks/              # Custom hooks like useDebounce for search optimizations
│   ├── pages/              # The main views corresponding to Sidebar tabs:
│   │   ├── auth/           # Login screen
│   │   ├── dashboard/      # KPI Stats Overview
│   │   ├── inventory/      # Stock In / Stock Out log
│   │   ├── products/       # Detailed product CRUD tables
│   │   └── reports/        # Analytics using Recharts
│   ├── store/              # Redux Toolkit configuration:
│   │   ├── store.js        # Global state registry
│   │   └── slices/         # Individual state slices (authSlice, productSlice)
│   ├── utils/              # Helper functions (format currency, dates, stock status colors)
│   ├── App.jsx             # React Router setup ensuring PrivateRoutes require JWTs
│   └── main.jsx            # React DOM mounting
└── index.css               # Tailwind directives and overarching global dark-theme styles
```

---

## 🚀 5. Setup & Launch Instructions

### Prerequisites
- **Node.js**: v16 or higher
- **MongoDB**: Locally running on default port (`mongodb://localhost:27017`)

### Step 1: Start the Backend & Seed the Database
1. Open a terminal and navigate to the backend:
   ```bash
   cd server
   ```
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Initialize the database. This script wipes existing data and adds an Admin account, categories, dummy products, and suppliers:
   ```bash
   npm run seed
   ```
4. Start the backend DEV server:
   ```bash
   npm run dev
   ```
   > The server will start on `http://localhost:5001`. (Port configurable in `server/.env`)

### Step 2: Start the Frontend UI
1. Open a **new** terminal window and navigate to the client:
   ```bash
   cd client
   ```
2. Install the React dependencies:
   ```bash
   npm install
   ```
3. Boot up Vite:
   ```bash
   npm run dev
   ```
   > The client will run on `http://localhost:5173` (or `5174` if busy).
   > *Note: Vite is configured via `vite.config.js` to proxy all `/api/*` requests to `localhost:5001` automatically to avoid CORS headaches.*

### Step 3: Log In
Open your browser and navigate to the frontend URL. Log in using the credentials generated by the seed script:
- **Email**: `admin@grocery.com`
- **Password**: `admin123`

---

## 📊 6. Key Feature Highlights
*   **The Aggregation Pipeline**: In `reportController.js`, MongoDB aggregates are used to crunch huge datasets into tiny JSON summaries (calculating Top 5 products moved all time) natively on the DB level, without crushing generic Node.js memory.
*   **Debounced Search**: The frontend implements a custom `useDebounce` hook. This prevents the search bar in the `Products` table from firing an API request on every single keystroke. It waits 400ms after the user stops typing to ping the backend.
*   **Centralized Error Handling**: If an API request fails, the backend `errorMiddleware` wraps it uniformly. The frontend uses `react-toastify` wrapped universally inside the catch blocks to guarantee the user always receives a clean popup error (e.g., "SKU must be unique") instead of the app crashing silently.
