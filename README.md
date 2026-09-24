# SpendWise — Personal Finance & Expense Management

SpendWise is a production-quality personal expense and finance management platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

---

## 📁 Project Architecture

```text
SpendWise/
│
├── client/                 # React.js + Vite frontend
│   ├── src/                # Components, pages, services, contexts
│   ├── public/             # Static public assets
│   ├── index.html          # HTML entry point
│   ├── package.json        # Frontend dependencies & scripts
│   ├── vite.config.js      # Vite build & chunk configuration
│   ├── tailwind.config.js  # Dark-first theme & design tokens
│   ├── postcss.config.js   # PostCSS configuration
│   └── .env                # Frontend environment (VITE_API_URL)
│
├── server/                 # Node.js + Express.js backend
│   ├── config/             # Database connection (db.js)
│   ├── controllers/        # REST API controllers & aggregations
│   ├── models/             # Mongoose schemas & data models
│   ├── routes/             # Express API route declarations
│   ├── middleware/         # Centralized error handlers
│   ├── utils/              # Starter data seeders
│   ├── server.js           # Server entry point
│   ├── package.json        # Backend dependencies & scripts
│   ├── .env.example        # Backend environment template
│   └── .env                # Local backend environment
│
├── .gitignore              # Git ignore configuration
└── README.md               # Project documentation
```

---

## 🚀 Two-Terminal Development Workflow

### Terminal 1: Backend Server (Port 5000)

```bash
cd server
npm run dev
```

* Backend REST API URL: `http://localhost:5000/api`
* Health Check: `http://localhost:5000/api/health`

### Terminal 2: Frontend Client (Port 3000 / 5173)

```bash
cd client
npm run dev
```

* Frontend Application: `http://localhost:3000` (or `http://localhost:5173`)

---

## 🛠️ Build Verification

To verify the production build of the frontend:

```bash
cd client
npm run build
```
