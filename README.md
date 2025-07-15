# Tidur.io – Capstone Project DB6-PG010
*A Gamified Sleep Tracker for Better Health and Habit Building*

---

## 📚 Daftar Isi
- [📖 Deskripsi Proyek](#-deskripsi-proyek)
- [🚀 Alur MVP & Fitur Utama](#-alur-mvp--fitur-utama)
- [🧠 Formula Gamifikasi (Points & Streak)](#-formula-gamifikasi-points--streak)
- [🗂️ Struktur Folder](#️-struktur-folder)
- [🎯 Scope Tugas Per Tim](#-scope-tugas-per-tim)
- [🔗 API Contract (Draft)](#-api-contract-draft)
- [🛠️ Tools & Tech Stack](#️-tools--tech-stack)

---

## 📖 Deskripsi Proyek

Tidur.io adalah aplikasi pelacak tidur berbasis web dengan fitur gamifikasi untuk membantu pengguna membangun kebiasaan tidur sehat dan konsisten. Kami menggabungkan sleep logging dengan sistem poin, streak, dan dashboard statistik agar pengguna terdorong menjaga rutinitas tidur yang lebih baik.

---

## 🚀 Alur MVP & Fitur Utama

### 💡 MVP Flow
1. User mendaftar & login
2. User mencatat waktu tidur dan bangun setiap hari
3. Sistem menghitung durasi, poin, dan streak
4. User melihat progress mereka di dashboard

### 🎯 Core Features:
1. **User Authentication** - Register, login, profile management
2. **Sleep Logging** - Manual bedtime/wake time input
3. **Point System** - Earn points for meeting sleep goals
4. **Streak Tracking** - Consecutive days counter
5. **Achievement System** - Unlock badges for milestones
6. **Dashboard** - View stats, progress, recent logs
7. **Sleep History** - List of past sleep records

---

## 🧠 Formula Gamifikasi (Points & Streak)

### 🔢 Poin:
| Syarat Tidur                     | Poin |
|----------------------------------|------|
| Tidur ≥ 7 jam                    | +10  |
| Tidur mulai pukul 21:00–23:00    | +5   |
| Logging berturut-turut 3 hari    | +5   |

### 🔁 Streak:
- Streak naik **+1** jika tidur memenuhi syarat setiap hari
- Streak **reset ke 0** jika hari ini tidak logging atau durasi < 7 jam

---

## 🗂️ Struktur Folder

```plaintext
tidurio-capstone-db6pg010/
│
├── frontend/                  # Aplikasi React
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── routes/
│       ├── services/          # API calls ke backend
│       └── App.jsx
│
├── backend/                   # Server Hapi.js
│   ├── src/
│   │   ├── api/               # Handler dan route
│   │   ├── exceptions/        # Custom error handling
│   │   ├── services/          # Business logic (poin, streak)
│   │   ├── tokenize/          # JWT token management
│   │   └── utils/             # Helper functions
│   ├── migrations/            # node-pg-migrate
│   ├── server.js
│   └── .env
│
├── docs/                      # Dokumentasi capstone
│   └── presentasi, laporan, dsb.
│
├── README.md
└── .gitignore
```

---

## 🎯 Scope Tugas Per Tim

### 🧩 Frontend (React)
- Halaman: Login, Register, Dashboard, Form Sleep Logging
- Integrasi dengan API Backend menggunakan JWT
- Data visualization menggunakan Chart.js
- Implementasi calendar dengan react-calendar

### ⚙️ Backend (Hapi.js)
- Endpoint: `/register`, `/login`, `/sleep`, `/dashboard`
- JWT Auth, validasi, dan kalkulasi poin/streak
- Struktur database: `users`, `sleep_logs`, `user_stats`
- Logika bisnis: streak handler & point engine

---

## 🔗 API Contract (Draft)

| Method | Endpoint    | Deskripsi                       | Body                           | Response                                    |
|--------|-------------|--------------------------------|--------------------------------|---------------------------------------------|
| POST   | `/register` | Daftar user baru               | `{ username, password }`       | `201 Created`                               |
| POST   | `/login`    | Login user                     | `{ username, password }`       | `{ token }`                                 |
| POST   | `/sleep`    | Input waktu tidur & bangun     | `{ sleepStart, sleepEnd }`     | `{ points, currentStreak }`                 |
| GET    | `/dashboard`| Ambil statistik & histori tidur| -                              | `{ totalPoints, currentStreak, logs: [] }`  |

---

## 🛠️ Tools & Tech Stack

**Frontend**: React, Vite, React-Router, React Calendar, Chart.js

**Backend**: Node.js, Hapi.js, PostgreSQL, JWT

**Deployment**: Netlify (frontend), Railway/Render (backend)

**Database Migration**: node-pg-migrate

**Version Control**: Git + GitHub