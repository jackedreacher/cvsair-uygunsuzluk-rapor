# Cvsair Uygunsuzluk Raporu Sistemi

Bu proje, Cvsair için uygunsuzluk raporlarının takibi, görev ataması ve kalite kontrol süreçlerini yönetmek amacıyla tasarlanmıştır.

## 📂 Proje Yapısı

```
.
├── backend/          # Node.js/Express API ve Veritabanı Şemaları
│   ├── server.js     # API Endpoint'leri
│   ├── db.js         # Veritabanı Bağlantısı
│   └── schema.sql    # PostgreSQL Tablo Yapıları
├── frontend/         # Next.js Kullanıcı Arayüzü
│   ├── src/          # Sayfalar ve Bileşenler
│   └── public/       # Statik Dosyalar
└── render.yaml       # Render.com Dağıtım Konfigürasyonu
```

## 🚀 Yerel Geliştirme (Local Development)

### 1. Backend'i Çalıştırma

1.  `backend` klasörüne gidin:
    ```bash
    cd backend
    ```
2.  Bağımlılıkları yükleyin (Eğer yüklenmediyse):
    ```bash
    npm install
    ```
3.  `.env` dosyası oluşturun ve veritabanı bilgilerinizi girin:
    ```env
    DATABASE_URL=postgres://user:password@localhost:5432/cvsair_db
    SMTP_HOST=smtp.example.com
    SMTP_USER=email@example.com
    SMTP_PASS=password
    ```
4.  Sunucuyu başlatın:
    ```bash
    npm start
    ```
    API `http://localhost:3001` adresinde çalışacaktır.

### 2. Frontend'i Çalıştırma

1.  `frontend` klasörüne gidin:
    ```bash
    cd frontend
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```
    Uygulama `http://localhost:3000` adresinde çalışacaktır.




## 🛠 Özellikler
-   **Uygunsuzluk Formu:** Detaylı veri girişi ve dosya yükleme (S3 entegrasyonu gerekir).
-   **Otomatik Atama:** Bölüme göre sorumlu ataması.
-   **Durum Takibi:** Yeni -> Triyaj -> Aksiyon -> Kapatıldı döngüsü.
-   **Bildirimler:** E-posta ile görev atama bildirimleri.
