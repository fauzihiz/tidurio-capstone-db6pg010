# Tidur.io – Capstone Project DB6-PG010
*A Gamified Sleep Tracker for Better Health and Habit Building*

---

## 📚 Daftar Isi
- [📖 Deskripsi Proyek](#deskripsi-proyek)
- [🔄 Alur Logika Aplikasi](#alur-logika-aplikasi)
  - [1️⃣ Memulai Tidur](#1️-memulai-tidur)
  - [2️⃣ Mengakhiri Tidur](#2️-mengakhiri-tidur)
    - [🎯 Perhitungan Poin](#🎯-perhitungan-poin)
    - [🏅 Pengecekan Achievement](#🏅-pengecekan-achievement)
    - [🔄 Update Data](#🔄-update-data)
  - [3️⃣ Melihat Perkembangan](#3️-melihat-perkembangan)
- [🌟 Fitur Utama](#🌟-fitur-utama)
- [🧮 Formula Gamifikasi (Poin & Streak)](#🧮-formula-gamifikasi-poin--streak)
  - [🔢 Poin](#🔢-poin)
  - [🔁 Streak](#🔁-streak)
- [⚠️ Penanganan Error](#⚠️-penanganan-error)
- [🗂️ Struktur Folder](#🗂️-struktur-folder)
- [🎯 Scope Tugas Per Tim](#🎯-scope-tugas-per-tim)
- [🔗 API Endpoint](#🔗-api-endpoint)
- [🛠️ Tools & Tech Stack](#🛠️-tools--tech-stack)

---

## 📖 Deskripsi Proyek

Tidur.io adalah aplikasi pelacak tidur berbasis web dengan fitur gamifikasi untuk membantu pengguna membangun kebiasaan tidur sehat dan konsisten. Kami menggabungkan sleep logging dengan sistem poin, streak, dan dashboard statistik agar pengguna terdorong menjaga rutinitas tidur yang lebih baik.

---

## 🔄 Alur Logika Aplikasi

### 1️⃣ Memulai Tidur
- Pengguna menekan tombol **“Start Sleep”**
- Sistem:
  - Menyimpan waktu sekarang sebagai `startTime`
  - Membuat Sleep Log baru, terhubung ke ID pengguna
  - Sleep Log menunggu waktu bangun

---

### 2️⃣ Mengakhiri Tidur
- Pengguna menekan tombol **“End Sleep”**
- Sistem:
  - Mencatat `endTime`
  - Menghitung durasi tidur: `endTime - startTime`

#### 🎯 Perhitungan Poin:
- Jika durasi **< 8 jam**:
  - ❌ Tidak mendapat poin
  - 🔁 Streak di-reset ke 0

- Jika durasi **≥ 8 jam**:
  - ✅ Dapat **poin dasar** (misal: 10 poin per jam setelah 8 jam)
  - Cek apakah kemarin juga tidur ≥ 8 jam:
    - Jika iya → **streak naik +1**, dapat **bonus poin**
    - Jika tidak → **streak reset ke 1**
  - Hanya **1 sesi tidur berkualitas per hari** yang dihitung untuk streak

#### 🏅 Pengecekan Achievement:
- Sistem secara otomatis mengecek apakah pengguna mendapatkan achievement baru
  - Berdasarkan total poin atau panjang streak
- Achievement disimpan dan ditampilkan di dashboard

#### 🔄 Update Data:
- Sleep log diperbarui:
  - `endTime`, `duration`, `poin`, `streak`, `achievement`
- Profil pengguna diperbarui:
  - `totalPoin`, `streakAktif`

---

### 3️⃣ Melihat Perkembangan
Di halaman dashboard, pengguna dapat melihat:
- Durasi tidur terakhir dan poin yang didapat
- Total poin keseluruhan
- Streak saat ini
- Achievement terbaru yang berhasil dibuka
- Riwayat tidur lengkap

---

### 🌟 Fitur Utama:

- **🔐 Autentikasi Pengguna**  
  Pengguna dapat mendaftar, login, dan mengelola profil mereka.

- **⏰ Pencatatan Tidur**  
  Pengguna memulai dan mengakhiri sesi tidur dengan tombol **“Start Sleep”** dan **“End Sleep”**. Aplikasi otomatis mencatat waktu tidur dan bangun.

- **🎯 Sistem Poin**  
  Pengguna mendapatkan poin jika tidur **≥ 8 jam**. Poin dasar bertambah seiring durasi, dan bonus tambahan didapat dari streak.

- **🔥 Pelacakan Streak**  
  Pengguna menjaga streak tidur berkualitas (≥ 8 jam). Streak bertambah jika tidur konsisten, dan reset jika ada hari terlewat atau tidur kurang.

- **🏅 Sistem Prestasi (Achievement)**  
  Prestasi terbuka secara otomatis jika pengguna mencapai total poin atau streak tertentu, misalnya: "Rajin Banget!" atau "Tidur 5 Hari Beruntun".

- **📊 Dashboard**  
  Menampilkan statistik pengguna secara real-time: durasi tidur terakhir, total poin, streak aktif, dan achievement terbaru.

- **🕓 Riwayat Tidur**  
  Menyimpan daftar semua catatan tidur sebelumnya, lengkap dengan durasi, poin yang didapat, dan status streak.

---

## 🧮 Formula Gamifikasi (Poin & Streak)

### 🔢 Poin
| Kriteria                                                                 | Poin       |
|--------------------------------------------------------------------------|------------|
| Tidur ≥ 8 jam                                                            | +10 per jam setelah 8 jam |
| Waktu tidur dimulai antara pukul 21.00–23.00                             | +5         |
| Mendapat tidur berkualitas (≥8 jam) selama 3 hari berturut-turut        | +5 (bonus streak) |

> **Catatan:** Poin dasar hanya diberikan jika durasi tidur memenuhi 8 jam atau lebih.

---

### 🔁 Streak
- **Streak bertambah +1** jika:
  - Pengguna tidur ≥ 8 jam hari ini dan kemarin
- **Streak di-reset ke 1** jika:
  - Hari ini tidur ≥ 8 jam tetapi kemarin tidak
- **Streak di-reset ke 0** jika:
  - Hari ini tidak mencatat tidur **atau** tidur < 8 jam
- Hanya **1 sesi tidur per hari** yang berkontribusi pada streak

---

## ⚠️ Penanganan Error
| Kasus                                 | Tindakan Sistem                     |
|--------------------------------------|-------------------------------------|
| Menekan “End Sleep” tanpa “Start”    | ❌ Gagal: Log tidur tidak ditemukan |
| Mengakhiri log tidur milik orang lain| ❌ Gagal: Akses ditolak              |
| Mengakhiri log yang sudah selesai    | ❌ Gagal: Log sudah diakhiri        |

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

## 🔗 API Endpoint

🔗 [API Docs Swagger](https://tidurio-capstone-db6pg010-production.up.railway.app/api-docs)

| Method | Endpoint                  | Deskripsi                             | Auth | Body Params / Query                |
| ------ | ------------------------- | ------------------------------------- | ---- | ---------------------------------- |
| POST   | `/users`                  | Register user baru                    | ❌    | `username`, `password`, `fullname` |
| POST   | `/authentications`        | Login dan dapatkan access token       | ❌    | `username`, `password`             |
| PUT    | `/authentications`        | Refresh access token                  | ❌    | `refreshToken`                     |
| DELETE | `/authentications`        | Logout dan hapus refresh token        | ❌    | `refreshToken`                     |
| GET    | `/users/me`               | Dapatkan profil pengguna saat ini     | ✅    | -                                  |
| POST   | `/sleeps`                 | Logging tidur                         | ✅    | `date`, `startTime`, `endTime`     |
| GET    | `/sleeps`                 | Ambil semua data tidur                | ✅    | -                                  |
| GET    | `/sleeps/today`           | Ambil data tidur hari ini             | ✅    | -                                  |
| PUT    | `/sleeps/{id}`            | Update data tidur tertentu            | ✅    | `date`, `startTime`, `endTime`     |
| DELETE | `/sleeps/{id}`            | Hapus data tidur tertentu             | ✅    | -                                  |
| GET    | `/dashboard/summary`      | Ringkasan total tidur, rata-rata, dll | ✅    | -                                  |
| GET    | `/dashboard/progress`     | Perkembangan tidur (grafik mingguan)  | ✅    | -                                  |
| GET    | `/dashboard/gamification` | Dapatkan data poin & streak user      | ✅    | -                                  |
| GET    | `/achievements`           | Lihat daftar pencapaian               | ✅    | -                                  |
| GET    | `/achievements/user`      | Lihat pencapaian milik user           | ✅    | -                                  |
| POST   | `/exports/playlists`      | Ekspor playlist via email (demo)      | ✅    | `targetEmail`                      |
| GET    | `/albums/{id}/likes`      | Lihat jumlah like pada album          | ✅    | -                                  |
| POST   | `/albums/{id}/likes`      | Like/unlike album                     | ✅    | -                                  |

---

## 🛠️ Tools & Tech Stack

**Frontend**: React, Vite, React-Router, React Calendar, Chart.js

**Backend**: Node.js, Hapi.js, PostgreSQL, JWT

**Deployment**: Netlify (frontend), Railway/Render (backend)

**Database Migration**: node-pg-migrate

**Version Control**: Git + GitHub