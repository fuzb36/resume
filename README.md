# Web-Based ATS Resume Builder

Aplikasi pembina resume berasaskan web pintar yang dioptimumkan secara khusus untuk melepasi Sistem Penapisan Pemohon (ATS) serta mesra-bacaan bagi Pegawai Sumber Manusia (HR).

Aplikasi ini dibina menggunakan **Python, Flask, Peewee ORM, SQLite, dan Tailwind CSS** serta dioptimumkan dengan peraturan media cetak CSS untuk menjana PDF digital berasaskan teks vektor tulen.

---

## 🚀 Tech Stack & Reka Bentuk
*   **Backend:** Python 3.12 + Flask
*   **Database & ORM:** SQLite + Peewee ORM (Konfigurasi pangkalan data hubungan)
*   **Frontend:** HTML5, CSS3, Tailwind CSS (via CDN) & Google Fonts (Inter & Outfit)
*   **Validasi & Keselamatan:** Pematuhan format IC Malaysia (`XXXXXX-XX-XXXX`), pengasingan sesi log masuk berasaskan JWT/Session Cookie, dan sekatan peranan pengguna (Role-Based Access Control).

---

## ✨ Ciri-ciri Utama (ATS & Career Booster)
1.  **10 Maklumat Wajib ATS:** Merakam dan menyusun 10 medan maklumat dengan format yang dicadangkan oleh algoritma ATS global.
2.  **Foto Profil (Ukuran Pasport):** Keupayaan memuat naik foto profil secara terus di dashboard. Fail disimpan secara selamat sebagai rentetan Base64 dalam pangkalan data.
3.  **Reka Bentuk Premium & Kemas:** Menggunakan tipografi moden (*Outfit* untuk tajuk, *Inter* untuk teks) dan reka letak lajur tunggal (single-column layout) untuk mengekalkan kebolehbacaan bot parser.
4.  **Eksport PDF Digital Bersih:** Dengan menggunakan butang **Muat Turun PDF** (memanfaatkan CSS `@media print`), aplikasi menyembunyikan semua elemen UI web secara automatik dan mencetak resume dalam mod teks digital asli (searchable & selectable text).
5.  **Portal Pentadbir (Admin):** Mempunyai URL berasingan di mana pentadbir boleh menguruskan, melihat, menambah, dan menyunting semua data resume pengguna secara terus.

---

## 🛠️ Cara Pemasangan & Larian Lokal

### 1. Prasyarat
Pastikan komputer anda mempunyai **Python 3.x** dipasang.

### 2. Jalankan Aplikasi
Lakukan larian pelayan pembangunan Flask secara terus:
```bash
python app.py
```

Pelayan akan mula berjalan di:
*   `http://127.0.0.1:5000`

### 3. Log Masuk Contoh (Database Seeded)
Pangkalan data telah diisi secara automatik dengan data ujian untuk kemudahan pengujian:
*   **Akaun Pengguna Biasa (User):**
    *   **Username:** `user`
    *   **Password:** `user123`
*   **Akaun Pentadbir (Admin):**
    *   **Username:** `admin`
    *   **Password:** `admin123`

---

## 📂 Struktur Fail Projek
*   `app.py` - Logik perniagaan backend, model pangkalan data, dan API routes.
*   `templates/` - Halaman HTML (Jinja2): `base.html`, `landing.html`, `login.html`, `register.html`, `dashboard.html`, dan `admin.html`.
*   `static/` - Aset statik: `style.css` (gaya visual & peraturan cetak) dan `main.js` (live preview & interaksi borang).
*   `app.db` - Fail database SQLite lokal.
