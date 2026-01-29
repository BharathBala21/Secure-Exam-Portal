# Secure Online Exam Portal

A high-security web application for managing university assessments, built with **React**, **Node.js**, **Express**, and **MongoDB Atlas**. This project adheres to **NIST SP 800-63-2** guidelines for digital identity and implements advanced cryptographic protections.

## 🛡️ Security Implementation Details

### 1. Authentication (NIST SP 800-63-2)
- **Multi-Factor Authentication (MFA)**: Implements Step 1 (Username/Password) and Step 2 (Simulated Email OTP).
- **Session Security**: Uses JWT (JSON Web Tokens) with 30-day expiration, transmitted in secure headers.
- **Password Hashing**: Utilizes **bcrypt** with a salt factor of 10 to protect against rainbow table and brute-force attacks.

### 2. Authorization (RBAC)
- **Role-Based Access Control**: Strict middleware-enforced permissions for `Admin`, `Faculty`, and `Student`.
- **Permission Matrix**:
  - `Student`: Attempt exams, view own results.
  - `Faculty`: Create/Manage exams, evaluate submissions, view results of their exams.
  - `Admin`: Full system access, auditing.

### 3. Cryptography
- **Confidentiality (AES-256-CBC)**: Student answers and final marks are encrypted symmetrically before being stored in the database. Data is never stored in plain text.
- **Asymmetric Key Exchange**: RSA-2048 keys are generated for each user upon registration.
- **Integrity (Digital Signatures)**: Submissions are signed using **SHA-256 with RSA**. The backend verifies the signature using the student's public key before allowing evaluation.
- **Encoding**: All encrypted binary data is transmitted using **Base64** encoding to ensure safe transport over HTTP.

## 🏚️ Threat Model & Mitigation

| Threat | Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Identity Theft** | Attacker steals password | MFA (OTP) ensures even stolen credentials cannot access the portal. |
| **Data Tampering** | Changing answers during transit | Digital Signature (RSA) verification on server-side fails if data is altered. |
| **Privilege Escalation** | Student trying to access create-exam API | Express middleware checks JWT role and blocks unauthorized access (RBAC). |
| **Database Breach** | Attacker gains access to MongoDB | Sensitive data (marks/answers) is AES-encrypted; passwords are salted & hashed. |
| **Replay Attacks** | Re-submitting a valid signed exam | Submission timestamps and unique ID checks in the database. |

## 🚀 Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB (Local or Atlas)
- NPM

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` file (already provided in folder). Update `MONGO_URI` if using Atlas.
4. `npm start` (Runs on port 5000)

### 2. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173)

### 3. Usage
1. **Register** a new user. Note the **Private Key** generated during registration (simulated for demo).
2. **Login** with email/password.
3. Check terminal for **Simulated OTP** (e.g., `OTP for student@univ.edu: 123456`).
4. Enter OTP to enter dashboard.
5. If **Faculty**: Create an exam.
6. If **Student**: Attempt the exam and "Sign & Submit".

## 📂 Project Structure
- `backend/controllers`: Logical implementation of Auth, Exams, results.
- `backend/utils/security.js`: Core cryptographic functions (AES, RSA, SHA).
- `frontend/src/pages`: UI for Exam Taker, Creator, and Results.
- `frontend/src/utils/securityUtils.js`: Client-side hashing and signing simulation.
