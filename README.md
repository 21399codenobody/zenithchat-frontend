# ⚡ Zenith Chat — Client Application (Frontend)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-v5-orange?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

> The official Next.js 16 client for **Zenith Chat** — an enterprise-grade, real-time messaging, supergroup, and community platform inspired by Telegram and WhatsApp.

---

## 🔗 Connected Ecosystem
- 🌐 **Live Web Application:** [https://zenithchat.vercel.app](https://zenithchat.vercel.app) *(Coming Soon / Active)*
- ⚙️ **Backend Repository (Node.js/Socket.io):** [https://github.com/your-username/zenithchat-backend](https://github.com/your-username/zenithchat-backend)

---

## 📱 Client Features & User Experience

- **Passwordless Phone Auth:** WhatsApp-style international phone number input with automatic dial code lookup (`libphonenumber-js`) and auto-advancing 6-digit OTP boxes.
- **Telegram 24h Stories Suite:** Horizontal circular stories tray with full-screen video/photo player and progress bars.
- **Voice Notes Recording:** Native Web Audio `MediaRecorder` integration with live recording timers and in-bubble audio players.
- **Real-Time Messaging:** Instant socket delivery, live read-receipts (`CheckCheck`), typing indicators, and emoji reactions.
- **Supergroup & Channel Governance:** Full Role-Based Access Control (RBAC) drawer for Admins & Owners with 10-character smart invite links and slow-mode controllers.
- **WebRTC Call Overlay:** Interactive cyberpunk-themed 1-on-1 audio/video call screen.
- **Contacts Directory:** Instant phonebook synchronization and contact search.

---

## 🛠️ Frontend Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Library:** React 19
- **State Management:** Zustand v5 (Reactive and decoupled stores)
- **Styling:** Tailwind CSS v4 with Glassmorphism and Custom Cyberpunk Dark Palette
- **Real-time Client:** `socket.io-client` (Singleton gateway)
- **HTTP Client:** Axios with JWT request/response interceptors
- **Icons:** Lucide React

---

## 🔌 How It Connects to Backend

This client connects to the **Zenith Backend Gateway** using two primary channels:
1. **RESTful APIs (`Axios`):** Handles authentication, media uploads, contact directory sync, and user profile management.
2. **WebSockets (`Socket.io`):** Establishes an always-on bi-directional communication tunnel for instant messaging, peer calling signals, typing events, and online presence.

---

## 💻 Local Setup Instructions

```bash
# Clone this repository
git clone https://github.com/your-username/zenithchat-frontend.git

# Navigate to project folder
cd zenithchat-frontend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env.local
Environment Variables (.env.local)
code
Env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
code
Bash
# Run local development server
npm run dev
Open http://localhost:3000 in your browser.
👨‍💻 Developed By
GitHub: 21399codenobody
LinkedIn: https://www.linkedin.com/in/omar-khattab-safar
