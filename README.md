# Web-Based ATS Resume Builder (Static & Serverless)

Aplikasi pembina resume berasaskan web pintar yang dioptimumkan secara khusus untuk melepasi Sistem Penapisan Pemohon (ATS) serta mesra-bacaan bagi Pegawai Sumber Manusia (HR).

Aplikasi ini kini telah dihijrahkan sepenuhnya menjadi **Aplikasi Web Statik 100% (Serverless)** yang boleh dijalankan secara terus dalam pelayar web tanpa memerlukan pelayan backend Python/Flask atau pangkalan data luaran. Semua data disimpan secara selamat secara terus di dalam **LocalStorage** pelayar pengguna.

---

## 🚀 Tech Stack & Reka Bentuk
*   **Seni Bina:** Statik 100% (Serverless / Client-Side)
*   **Database Lokal:** Browser LocalStorage (Menyimpan data pengguna dan profil resume secara setempat)
*   **Frontend:** HTML5, CSS3, Tailwind CSS (via CDN) & Google Fonts (Inter & Outfit)
*   **Reka Bentuk:** Tipografi premium (*Outfit* untuk tajuk, *Inter* untuk teks) dan reka letak lajur tunggal (single-column) untuk memastikan bot parser ATS boleh mengekstrak teks dengan lancar.
*   **Validasi:** Pematuhan format IC Malaysia (`XXXXXX-XX-XXXX`) dan validasi e-mel secara terus pada pelayar.

---

## ✨ Ciri-ciri Utama (ATS & Career Booster)
1.  **10 Maklumat Wajib ATS:** Menyusun 10 medan maklumat penting mengikut format yang dicadangkan oleh algoritma ATS global.
2.  **Storan Lokal Selamat (LocalStorage):** Maklumat akaun dan resume disimpan di dalam memori pelayar anda sendiri. Tiada data yang dihantar ke pelayan luar.
3.  **Foto Profil (Ukuran Pasport):** Keupayaan memuat naik foto profil secara terus di dashboard dan disimpan sebagai rentetan Base64 secara lokal.
4.  **Eksport PDF Digital Bersih:** Dengan menggunakan butang **Muat Turun PDF** (memanfaatkan CSS `@media print`), aplikasi menyembunyikan semua elemen UI web secara automatik dan mencetak resume dalam mod teks digital asli (searchable & selectable text).
5.  **Portal Pentadbir (Admin Panel):** Pentadbir boleh memantau, melihat, dan menyunting draf resume bagi mana-mana pengguna lain yang berdaftar di dalam storan lokal pelayar tersebut.

---

## 🛠️ Cara Penggunaan & Larian Lokal

### 1. Jalankan Laman Web Secara Terus
Anda tidak memerlukan pemasangan Python atau pelayan web! Anda boleh menjalankan aplikasi ini dengan cara:
*   Dwi-klik (double-click) fail **`index.html`** di direktori utama projek untuk membukanya secara terus di pelayar web anda.
*   Atau jalankan pelayan statik ringan menggunakan Python jika mahu:
    ```bash
    python -m http.server 8000
    ```
    Kemudian layari `http://localhost:8000`.

### 2. Log Masuk Contoh (Data Seeded Automatik)
Sistem secara automatik akan menyediakan akaun ujian di dalam storan lokal apabila anda memuatkan halaman buat kali pertama:
*   **Akaun Pengguna Biasa (User):**
    *   **Username:** `user`
    *   **Password:** `user123`
    *   *(Mengandungi draf contoh resume sedia ada untuk tujuan ujian)*
*   **Akaun Pentadbir (Admin):**
    *   **Username:** `admin`
    *   **Password:** `admin123`

---

## 📂 Struktur Fail Projek
*   `index.html` - Halaman utama / pendaratan (Landing Page).
*   `login.html` & `register.html` - Sistem pengurusan akaun statik.
*   `dashboard.html` - Halaman penyuntingan resume & live preview dinamik.
*   `admin.html` - Halaman pemantauan pentadbir bagi storan lokal.
*   `static/auth.js` - Logik pangkalan data lokal, sesi aktif, dan bar navigasi dinamik.
*   `static/main.js` - Logik visual live preview, pengurusan senarai (drag-and-drop), dan penyimpanan draf.
*   `static/style.css` - Peraturan cetakan media CSS & reka bentuk visual.
