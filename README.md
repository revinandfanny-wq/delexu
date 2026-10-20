# DIKSS BOT PANEL — starter implementasi

Panel web Next.js untuk login Google dan pengelolaan bot Baileys melalui 3 panel Pterodactyl. Paket ini adalah fondasi integrasi; pembuatan server produksi sengaja dikunci sampai konfigurasi panel dan template bot diverifikasi.

## Yang sudah ada
- Login Google via Firebase Authentication.
- Endpoint backend memverifikasi Firebase ID token menggunakan Firebase Admin.
- Data bot per pemilik UID; endpoint aksi mengecek kepemilikan sebelum mengirim power action.
- Dukungan daftar konfigurasi multi-panel Pterodactyl dan percobaan provisioning secara berurutan.
- UI dashboard mobile, buat bot, daftar bot, start/stop/restart, developer panel status.
- Firestore rules menolak tulis langsung dari browser.

## Belum otomatis selesai
- API keys, URL, lokasi, egg, allocation IDs, owner user ID dari ketiga panel.
- Memasang template/egg OURIN Baileys pada panel dan memastikan startup/install script.
- Persistent volume/session storage untuk tiap server bot.
- Uji end-to-end ke server milikmu. Jangan aktifkan provisioning sebelum langkah ini selesai.
- Fitur penghapusan bot dan provisioning teardown belum disediakan agar tidak ada server terhapus tanpa prosedur aman.

## 1. Firebase
1. Buat proyek Firebase.
2. Authentication → Sign-in method → aktifkan Google.
3. Tambahkan domain preview/deployment Vercel ke Authentication → Settings → Authorized domains.
4. Buat Firestore database dan terapkan `firestore.rules`.
5. Buat service account khusus server; simpan JSON-nya hanya sebagai `FIREBASE_SERVICE_ACCOUNT_JSON` di Vercel Environment Variables.
6. Login pertama, lalu salin UID yang sudah diverifikasi dari Firebase Authentication untuk diisi ke `ADMIN_UIDS`.

## 2. Siapkan tiga panel Pterodactyl
Untuk setiap panel, catat URL dasar, tipe API, lokasi ID, nest ID, egg ID, allocation ID yang bebas, dan user ID yang akan menjadi pemilik server bot. Untuk membuat server otomatis umumnya dibutuhkan Application API Key dari panel administrator. Client API Key saja tidak cukup untuk endpoint Application API `/api/application/servers`.

Buat API key dengan hak minimum yang diperlukan. Jangan menaruh key di frontend, GitHub, atau file ZIP publik. Setiap panel harus punya alokasi port yang tersedia dan kapasitas RAM/disk/CPU yang cukup.

`PTERO_PANELS_JSON` adalah JSON array. Contoh struktur (ganti semua nilai dummy; jangan gunakan contoh ini apa adanya):
```json
[
  {"name":"panel-1","url":"https://panel1.example.com","apiKey":"PANEL1_SECRET","userId":1,"locationId":1,"nestId":1,"eggId":1,"allocationIds":[11,12],"dockerImage":"ghcr.io/parkervcp/yolks:nodejs_22","startup":"npm start","limits":{"memory":1024,"disk":4096,"cpu":100}},
  {"name":"panel-2","url":"https://panel2.example.com","apiKey":"PANEL2_SECRET","userId":1,"locationId":1,"nestId":1,"eggId":1,"allocationIds":[21,22]},
  {"name":"panel-3","url":"https://panel3.example.com","apiKey":"PANEL3_SECRET","userId":1,"locationId":1,"nestId":1,"eggId":1,"allocationIds":[31,32]}
]
```

Isi `userId` pada masing-masing konfigurasi dengan ID user numeric pemilik server pada panel itu.

## 3. Pasang template OURIN Baileys
Pterodactyl tidak otomatis mengunggah source ZIP hanya karena server dibuat. Buat egg/install flow yang memasang source bot OURIN/DIKSS dan dependensinya pada server baru. Pastikan `package.json` dan entry point berada di root server. Atur volume persisten khusus per server untuk folder sesi/auth (misalnya `auth_info`/folder auth yang benar-benar digunakan oleh source). Jangan gunakan folder sesi bersama lintas pengguna.

Verifikasi bot bisa start dan pairing secara manual pada satu server percobaan terlebih dahulu. Baru setelah itu set `PTERO_PROVISIONING_ENABLED=true`.

## 4. Vercel
1. Import repository GitHub ke Vercel.
2. Framework: Next.js; Node runtime sesuai versi yang didukung deployment.
3. Tambahkan environment variables dari `.env.example` pada Preview dan Production.
4. Deploy, uji Google login dan API status.
5. Tambahkan domain Vercel ke Authorized domains Firebase.

## Keamanan sebelum produksi
- Atur `ADMIN_UIDS` berdasarkan UID Firebase, bukan email/nama yang dikirim browser.
- Jangan pernah menaruh Pterodactyl API key di `NEXT_PUBLIC_*`.
- Batasi kuota per akun dan resource tiap bot; tambahkan rate limiting sebelum membuka pendaftaran publik.
- Buat log audit, alert kegagalan, dan prosedur revoke/restart server.
- Sediakan consent dan aturan penggunaan WhatsApp, dan patuhi kebijakan WhatsApp.
- Periksa respons error sebelum menampilkan kepada pengguna; jangan expose token atau detail rahasia.

## Pengembangan lokal
```bash
npm install
cp .env.example .env.local
npm run dev
```

Perlu nilai Firebase yang valid untuk login. Tanpa konfigurasi rahasia Pterodactyl, provisioning tidak aktif secara default.
