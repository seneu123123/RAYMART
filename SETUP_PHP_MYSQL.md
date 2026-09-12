# ALYN SHIR - PHP, ReactJS & MySQL Stack Guide

This application is engineered to run seamlessly on **PHP (7.4 or 8.x)**, **React 19 (Vite)**, and **MySQL**, managed and edited in **Visual Studio Code (VS Code)**.

---

## Architecture Overview

```
alyn-shir-platform/
├── database/
│   └── schema.sql        # Complete MySQL database DDL + Seed Data
├── api/                  # Pure PHP 8.x REST API (PDO + JSON)
│   ├── config/
│   │   └── db.php        # MySQL PDO connection & CORS handler
│   ├── index.php         # Central API front controller / router
│   ├── packages.php      # Packages CRUD
│   ├── bookings.php      # Bookings, Downpayments, & QR Verification
│   ├── auth.php          # Staff Level 4 OTP Authentication
│   ├── fleet.php         # Vessel Seaworthiness & Readiness
│   ├── guides.php        # DOT Master Tour Guides
│   ├── hotels.php        # Luxury Partner Resorts
│   ├── audit.php         # Security & Operational Audit Trail
│   ├── weather.php       # Dynamic Marine Telemetry & Tide Forecasts
│   ├── concierge.php     # Automated Island Concierge Transaction Engine
│   └── settings.php      # Commercial & Maritime Licensing Config
├── src/                  # ReactJS Frontend (Tailwind CSS v4 + Motion)
│   ├── services/
│   │   ├── api.ts        # TypeScript API client connecting React to PHP/MySQL
│   │   └── storage.ts    # Fallback persistence & client state
├── .vscode/              # Visual Studio Code tasks & debuggers
│   ├── tasks.json        # One-click tasks to run PHP and React
│   ├── launch.json       # Browser & PHP debugger setups
│   └── settings.json     # VS Code workspace optimizations
```

---

## 1. Quick Setup in Visual Studio Code (Under 3 Minutes)

### Prerequisites
1. **PHP**: PHP 7.4 or 8.x installed (included in XAMPP, WampServer, Laragon, or standalone PHP).
2. **MySQL**: MySQL 5.7 or 8.x running (e.g. via XAMPP MySQL or Docker).
3. **Node.js**: Node 18+ (for compiling/serving the React frontend).
4. **VS Code**: With recommended extensions (PHP Intelephense, ESLint, Tailwind CSS).

---

### Step 1: Initialize the MySQL Database
Open your terminal or phpMyAdmin:
1. Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI.
2. Import `database/schema.sql`:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *This automatically creates the `alyn_shir_db` database and loads all 6 tour packages, staff accounts, vessels, and seed bookings.*

### Step 2: Configure Database Credentials (Optional)
If your MySQL has a password, set it in `api/config/db.php` or export environment variables:
```bash
export DB_HOST="127.0.0.1"
export DB_USER="root"
export DB_PASS="your_password"
export DB_NAME="alyn_shir_db"
```
*(Default settings connect to `127.0.0.1`, user `root`, no password, database `alyn_shir_db`).*

### Step 3: Launch in VS Code
You can launch both servers simultaneously using VS Code tasks:
- Press **Ctrl + Shift + P** (or **Cmd + Shift + P** on Mac)
- Select **Tasks: Run Task** -> **Run Fullstack (PHP + React)**

Or run them in two terminal tabs:

**Terminal 1 (PHP API Server):**
```bash
php -S localhost:8000 api/index.php
```

**Terminal 2 (React Vite Frontend):**
```bash
npm install
npm run dev
```

Open your browser at `http://localhost:3000` (or `http://localhost:5173`).

---

## 2. API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | Check PHP & MySQL connectivity status |
| `/api/packages` | GET, POST, PUT, DELETE | Tour package catalog management |
| `/api/bookings` | GET, POST, PUT | Reservations, downpayments, and QR boarding passes |
| `/api/auth?action=request_otp` | POST | 6-digit Level 4 Maritime OTP Challenge |
| `/api/auth?action=verify_otp` | POST | OTP verification & session token issuance |
| `/api/weather` | GET | Live dynamic PAGASA marine weather telemetry |
| `/api/concierge` | POST | Automated concierge keyword transactions |
| `/api/fleet` | GET, PUT | Vessel certificates, captains, and status |
| `/api/guides` | GET, PUT | DOT accredited tour guides |
| `/api/audit` | GET, POST | Real-time maritime security audit trail |
| `/api/settings` | GET, PUT | DOT accreditation, tax rate, and hotlines |

---

## 3. Production Deployment with Apache or Nginx
If deploying on a standard LAMP / WAMP / LEMP stack:
- Point your Apache/Nginx web root to `api/` or copy the `api/` folder into your public web root.
- The included `api/.htaccess` file handles URL rewrites and CORS automatically.
- Build the React production assets:
  ```bash
  npm run build
  ```
  Copy the contents of `dist/` into your public HTML folder.
