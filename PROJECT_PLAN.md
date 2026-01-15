# Cvsair Uygunsuzluk Raporu Sistemi (Nonconformity Reporting System)

Bu proje, Cvsair için uygunsuzluk raporlarının takibi, görev ataması ve kalite kontrol süreçlerini yönetmek amacıyla tasarlanmıştır.

## 🏗 Mimari

Proje iki ana parçadan oluşur:
1.  **Frontend (Vercel):** Next.js ile geliştirilen kullanıcı arayüzü.
2.  **Backend (Render):** Node.js/Express ile geliştirilen API ve PostgreSQL veritabanı.

### Teknoloji Yığını
-   **Frontend:** Next.js, Tailwind CSS, Axios
-   **Backend:** Node.js, Express, pg (PostgreSQL client), Nodemailer
-   **Veritabanı:** PostgreSQL
-   **Dosya Depolama:** (Opsiyonel) S3 uyumlu depolama (AWS S3, Cloudflare R2 vb.)

---

## 📅 Veritabanı Şeması

### Tablolar
-   `departments`: Bölümler (Satın Alma, Üretim, Kalite vb.)
-   `users`: Kullanıcılar ve rolleri
-   `nonconformities`: Ana uygunsuzluk kayıtları
-   `nc_assignments`: Görev atamaları
-   `nc_transitions`: Durum geçiş tarihçesi (Audit logs)

### Durum Akışı (State Machine)
`yeni` -> `triyaj` -> `bolum_acik` -> `aksiyon_planlandi` -> `aksiyon_tamamlandi` -> `kalite_incelemesi` -> `dogrulandi` -> `kapatildi`

---

## 🚀 Kurulum Adımları

### 1. Backend Kurulumu
-   `backend/` klasörü oluşturulacak.
-   `package.json` ve bağımlılıklar eklenecek.
-   `server.js` (API endpointleri) yazılacak.
-   `db.js` (Veritabanı bağlantısı) yazılacak.
-   `schema.sql` (Veritabanı tabloları) hazırlanacak.

### 2. Frontend Kurulumu
-   `frontend/` klasörü (Next.js) oluşturulacak.
-   `next.config.js` (API proxy ayarları) yapılandırılacak.
-   Temel sayfalar (`/`, `/create`, `/dashboard`) oluşturulacak.

### 3. Dağıtım (Deployment)
-   **Backend:** Render.com üzerinde Web Service olarak deploy edilecek. `render.yaml` hazırlanacak.
-   **Frontend:** Vercel üzerinde deploy edilecek.

---

## 📝 API Endpointleri

-   `POST /api/nc`: Yeni uygunsuzluk oluştur.
-   `POST /api/nc/:id/transition`: Durum değiştir (örn. kapat, onayla).
-   `POST /api/nc/:id/assign`: Sorumlu ata.
-   `GET /api/nc`: Listeleme ve filtreleme.

---
