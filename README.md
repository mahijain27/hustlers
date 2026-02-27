🚀 RxGuard AI
🧠 AI-Powered Prescription Risk Intelligence System
<img width="1919" height="926" alt="image" src="https://github.com/user-attachments/assets/b439f6da-e9a8-4193-822e-1346b6345eaa" />


Turning handwritten prescriptions into intelligent clinical safety insights.

🏥 Why RxGuard?

Medication errors are one of the most overlooked yet dangerous problems in healthcare.
Illegible prescriptions, overlooked drug interactions, and manual cross-checking — all slow down critical decision-making.

RxGuard AI fixes this.
Upload a prescription → Analyze risk → Generate structured safety intelligence → Ready for real-world healthcare systems.

✨ What Makes It Different?
This is not a basic CRUD app.

<img width="1919" height="931" alt="image" src="https://github.com/user-attachments/assets/e753e351-1d41-4a28-9d4c-82da017a7bfb" />

RxGuard is built with:

⚡ Asynchronous AI-ready architecture
🔐 Secure JWT + Google OAuth authentication
🧑‍⚕️ Role-based dashboards (Pharmacist, Doctor, Patient)
📊 Risk scoring engine
🧬 FHIR-compatible structured output
🏗 Scalable backend service layer
Designed like a real SaaS product. Not a demo.

🔁 How It Works
Upload Prescription
        ↓
Async Processing Pipeline
        ↓
Drug Extraction (Mock / AI-ready)
        ↓
Interaction Detection
        ↓
Risk Scoring
        ↓
FHIR Structured Report

The system instantly accepts uploads (202 response) and processes them in the background.
No blocking. No freezing. Built for scale.

🧱 Tech Stack
Frontend
React • Vite • Tailwind CSS • React Router • Context API

Backend
Node.js • Express • MongoDB • JWT • Multer • Google OAuth

Architecture
Service-layer separation • Async processing • Role middleware • Secure token verification

🔐 Authentication System

JWT-based session management
Google OAuth login
Role-based route protection
Secure password hashing
Rate limiting + Helmet security

📂 Project Structure
stitch/
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── services/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   └── utils/

Clean separation. Easy scaling.

🚀 Getting Started
Backend
cd backend
npm install
npm run dev

Create .env:

PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/rxguard
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
Frontend
cd frontend
npm install
npm run dev

Add .env:

VITE_API_URL=http://localhost:8000
🧠 Innovation Highlights
Non-blocking prescription analysis pipeline
Background processing simulation (AI-ready)
Clean microservice-friendly structure
FHIR-compatible medical output
Designed for Redis queue integration
Ready for real OCR & ML engine plug-in

🌍 Future Scope
Real OCR integration
AI-based drug interaction engine
Worker queues (Redis / Bull)
Hospital EHR integration
Cloud deployment
Advanced analytics dashboard

👨‍💻 Built By

Team SSH_HUSTLERS

⭐ If You Like It

Star the repo.
Healthcare needs smarter systems.
