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

---

## 📸 Dokumentasi (Screenshot)

### 1. Halaman Login dan Registrasi
![Halaman Login WebGIS](assets/1_login.png)
*Keterangan: Antarmuka login dengan validasi email dan password, serta fitur registrasi akun baru.*

### 2. Tampilan Utama Peta (Read)
![Tampilan Utama Peta](assets/2_peta_utama.png)
*Keterangan: Tampilan keseluruhan peta fasilitas publik setelah pengguna berhasil masuk.*

### 3. Tambah Fasilitas (Create)
![Form Tambah Fasilitas](assets/3_tambah_fasilitas.png)
*Keterangan: Interaksi penambahan data spasial baru langsung melalui klik pada peta.*

### 4. Tambah, Edit, & Hapus Fasilitas (Update & Delete)
![Form Edit dan Hapus](assets/4_edit_hapus.png)
*Keterangan: Popup interaktif pada marker untuk melakukan penambahan, pembaruan, atau penghapusan data secara permanen.*

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

## 🤖 Fitur Terbaru (Praktikum 10 - Spatial AI)
Sistem WebGIS ini telah diintegrasikan dengan *pipeline Computer Vision* untuk otomatisasi deteksi objek spasial.
* **Integrasi YOLOv8:** Menggunakan model Deep Learning canggih (Ultralytics) untuk mendeteksi objek dari citra satelit/foto udara.
* **Image Tiling & Georeferencing:** Mendukung pemrosesan citra beresolusi masif dengan teknik pemotongan (*tiling*), serta konversi otomatis dari koordinat piksel spasial ke koordinat geografis absolut (Lintang/Bujur) menggunakan library `rasterio`.
* **Dynamic AI Layer:** *Output* deteksi otomatis diekspor sebagai GeoJSON dan divisualisasikan secara dinamis sebagai layer khusus (*AI Marker*) dengan skor kepercayaan (*confidence score*) di atas peta React-Leaflet.

---

## 📸 Dokumentasi (Screenshot Praktikum 10)

### 1. Eksekusi Script Pipeline Spatial AI (Python)
<img width="784" height="79" alt="Screenshot 2026-05-10 215441" src="https://github.com/user-attachments/assets/6b13eb92-b84d-4d69-86bd-6bc871527f32" />
*Keterangan: Proses tiling citra satelit berformat GeoTIFF dan inferensi YOLOv8 untuk mengekspor objek menjadi format GeoJSON.*

### 2. Render Hasil Deteksi AI pada Peta WebGIS
<img width="959" height="449" alt="Screenshot 2026-05-10 202415" src="https://github.com/user-attachments/assets/cde46891-f394-49c1-b3c4-ebbd13b2c253" />
*Keterangan: Markah berwarna ungu menunjukkan lokasi fasilitas yang berhasil diidentifikasi secara otomatis oleh sistem Kecerdasan Buatan (AI), lengkap dengan popup detail klasifikasi.*
