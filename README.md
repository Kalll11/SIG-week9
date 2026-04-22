# WebGIS Fasilitas Publik Bandar Lampung 🗺️

Aplikasi WebGIS Full-Stack interaktif untuk pemetaan fasilitas publik di wilayah Bandar Lampung. Proyek ini dibangun untuk memenuhi Tugas Praktikum Sistem Informasi Geografis.

**Dibuat Oleh:** Cikal Galih Nur Arifin 
**NIM:** 123140109  
**Mata Kuliah:** Sistem Informasi Geografis

---

## ✨ Fitur Utama
* **Autentikasi Aman:** Sistem Login dan Registrasi menggunakan JSON Web Token (JWT) yang dienkripsi dengan `bcrypt`.
* **Proteksi Rute (Frontend):** Antarmuka peta hanya dapat diakses oleh pengguna yang telah memiliki sesi (Token) valid.
* **Operasi CRUD Spasial:**
  * **Create:** Menambahkan titik fasilitas baru langsung dengan mengklik peta.
  * **Read:** Menampilkan sebaran data spasial fasilitas publik berdasarkan kategori warna.
  * **Update:** Memperbarui detail (Nama, Jenis, Alamat) melalui *popup* marker.
  * **Delete:** Menghapus data fasilitas dari *database* secara permanen melalui interaksi peta.

---

## 🛠️ Teknologi yang Digunakan
* **Database:** PostgreSQL + PostGIS Extension
* **Backend:** Python, FastAPI, Pydantic, Passlib (Bcrypt), Python-Jose (JWT)
* **Frontend:** ReactJS, Vite, Leaflet, React-Leaflet, Axios, React-Router-DOM

---

## 🚀 Cara Setup dan Instalasi Lokal

### 1. Persiapan Database
1. Buka pgAdmin 4 dan buat database baru (misal: `webgis_db`).
2. Buka *Query Tool* dan jalankan perintah: `CREATE EXTENSION postgis;`
3. Buat tabel `users` untuk autentikasi dan tabel `fasilitas` untuk data spasial.

### 2. Menjalankan Backend (FastAPI)
1. Buka terminal dan arahkan ke direktori `webgis-api`.
2. Buat dan aktifkan *virtual environment*:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # (Untuk Windows)