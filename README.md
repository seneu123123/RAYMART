# ALYN SHIR Marine Expeditions & Luxury Charters Inc.
**Stack:** PHP 8.x + ReactJS (TypeScript / Vite) + MySQL  
**Target IDE:** Visual Studio Code (VSC) / XAMPP / WampServer / Docker  
**Licensing & Accreditation:** DOT Accreditation No. DOT-ACCR-RO7-2026-8819  

---

## 🚀 Admin Password & Email OTP System

### 1. Default Administrative Accounts
| Officer Name | System Role | Email for OTP | Default Password | Legacy Key |
| :--- | :--- | :--- | :--- | :--- |
| **Commodore Althea Shir** | Super Admin | `karlljacob8@gmail.com` | `Password123!` | `ALYN-2026` |
| **Capt. Jacob Valderama** | Operations Dispatch | `ops@alynshir.ph` | `Password123!` | `ALYN-2026` |
| **Atty. Marissa Lim** | Finance Auditor | `finance@alynshir.ph` | `Password123!` | `ALYN-2026` |
| **Master Diver Ronilo Cruz** | Field Tour Guide | `guides@alynshir.ph` | `Password123!` | `ALYN-2026` |

*All officer passwords use PHP `password_hash($password, PASSWORD_BCRYPT)` and are verified via `password_verify()`.*

---

## 📧 How the Email OTP Works

1. **Step 1 - Password Validation:**
   - In `AdminOTPModal.tsx` or `/api/auth.php?action=request_otp`, the officer submits their secure password.
   - The backend validates the password hash in the MySQL `users` table.

2. **Step 2 - 6-Digit OTP Generation & Email Dispatch:**
   - A cryptographic 6-digit random code is generated and stored in `users.otp_code` with an expiration timestamp (`users.otp_expires_at`, 2 minutes validity).
   - The system calls `/api/config/mailer.php` which sends an official HTML maritime clearance email to the officer's email address (`karlljacob8@gmail.com`).
   - The email includes Philippine Coast Guard (PCG) & DOT regulatory headers, high-priority flag, and expiration countdown.

3. **Step 3 - OTP Verification & Session Issuance:**
   - The user inputs the 6 digits received in their email inbox.
   - `/api/auth.php?action=verify_otp` verifies the OTP and expiration timestamp.
   - Upon success, the OTP is cleared from the database and a 60-minute cryptographically signed session token is granted.

---

## ⚙️ Visual Studio Code (VSC) & Local Setup

### Option A: Running with PHP + MySQL (XAMPP / Apache / Nginx)
1. **Import Database:**
   - Open phpMyAdmin or MySQL Workbench.
   - Create database `alynshir_maritime`.
   - Import `database/schema.sql`.
2. **Configure Database & Mailer in `api/config/db.php` or `.env`:**
   ```env
   DB_HOST=localhost
   DB_DATABASE=alynshir_maritime
   DB_USERNAME=root
   DB_PASSWORD=
   
   # Optional Live SMTP (Gmail, SendGrid, etc.)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_SECURE=tls
   ```
3. **Run Front-End (VSC Terminal):**
   ```bash
   npm install
   npm run dev
   ```

### Option B: Built-in Dev Server
- Simply launch using `npm run dev` in VSC terminal.
- Full local fallback is active with instant visual email preview & 1-click auto-fill for frictionless testing in development environments!
