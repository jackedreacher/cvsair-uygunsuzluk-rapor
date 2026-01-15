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

## ☁️ Dağıtım (Deployment)

### Backend (Render.com)
Bu proje `render.yaml` dosyası ile Render üzerinde "Blueprint" olarak deploy edilebilir.
1.  Bu projeyi GitHub/GitLab hesabınıza yükleyin.
2.  Render.com'da "Blueprints" sekmesinden "New Blueprint Instance" seçeneğine tıklayın.
3.  Reponuzu bağlayın ve deploy işlemini başlatın.

### Frontend (Vercel)
1.  Vercel.com'da "Add New Project" deyin.
2.  Reponuzu seçin.
3.  **ÖNEMLİ:** "Root Directory" (Kök Dizin) ayarını `frontend` olarak değiştirin. (Edit butonuna basıp `frontend` klasörünü seçin).
4.  "Environment Variables" kısmına `NEXT_PUBLIC_API_URL` değişkenini ekleyin ve Backend API URL'ini (Render'dan aldığınız) girin.
5.  Deploy butonuna basın.

> **Not:** Eğer 404 Hatası alıyorsanız, "Root Directory" ayarını yapmamış olabilirsiniz. Vercel ayarlarından "General > Root Directory" kısmını `frontend` olarak güncelleyin.


## 🛠 Özellikler
-   **Uygunsuzluk Formu:** Detaylı veri girişi ve dosya yükleme (S3 entegrasyonu gerekir).
-   **Otomatik Atama:** Bölüme göre sorumlu ataması.
-   **Durum Takibi:** Yeni -> Triyaj -> Aksiyon -> Kapatıldı döngüsü.
-   **Bildirimler:** E-posta ile görev atama bildirimleri.
