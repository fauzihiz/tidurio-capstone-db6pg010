// Mengaktifkan dotenv agar variabel dari file .env bisa digunakan
require('dotenv').config();

// Mengimpor Hapi.js sebagai web framework utama
const Hapi = require('@hapi/hapi');

// Mengimpor config .env
const config = require('./src/utils/config');

// Fungsi utama untuk menginisialisasi dan menjalankan server
const init = async () => {
  // Konfigurasi server Hapi
  const server = Hapi.server({
    port: config.app.port,    // Mengambil port dari .env
    host: 'localhost',         // Host lokal selama development
    routes: { cors: { origin: ['*'] } }, // Mengizinkan akses dari semua origin (untuk frontend React)
  });

  // Contoh route sederhana: GET /
  server.route({
    method: 'GET',
    path: '/',
    handler: () => {
      return {
        status: 'success',
        message: 'Tidur.io API is running!',
      };
    },
  });

  // Menjalankan server
  await server.start();
  console.log(`🚀 Server berjalan pada ${server.info.uri}`);
};

// Menangani error yang tidak ditangkap (unhandled promise rejection)
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1); // Keluar dari proses jika ada error kritikal
});

// Memanggil fungsi init() untuk menjalankan server
init();