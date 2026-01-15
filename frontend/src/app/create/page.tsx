"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload } from "lucide-react";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reported_date: new Date().toISOString().split("T")[0],
    department_id: "1", // Varsayılan Kalite
    origin: "ic_tetkik",
    title: "",
    description: "",
    affected_department: "",
    root_cause: "",
    corrective_action: "",
    responsible_id: "", // Bu demo için boş veya manuel ID
    due_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Demo için responsible_id'yi 1 (Admin/Test User) olarak gönderiyoruz
      // Gerçek uygulamada kullanıcı seçimi yapılmalı
      const payload = { ...formData, reporter_id: 1, responsible_id: 1 };
      await axios.post("/api/nc", payload);
      alert("Kayıt başarıyla oluşturuldu!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Uygunsuzluk Raporu</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Genel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rapor Tarihi</label>
              <input
                type="date"
                name="reported_date"
                value={formData.reported_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanımlayan Bölüm</label>
              <select
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ic_tetkik">İç Tetkik</option>
                <option value="musteri">Müşteri Şikayeti</option>
                <option value="uretim">Üretim</option>
                <option value="tedarikci">Tedarikçi</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uygunsuzluk Başlığı (Kısa Tanım)</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Örn: Hatalı Montaj"
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uygunsuzluk Detayı</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etkilenen Bölüm</label>
              <input
                type="text"
                name="affected_department"
                value={formData.affected_department}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlgili Departman (Atanacak)</label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="1">Kalite</option>
                <option value="2">Üretim</option>
                <option value="3">Satın Alma</option>
                <option value="4">Servis</option>
              </select>
            </div>
          </div>

          {/* Kök Neden & Aksiyon */}
          <div className="bg-blue-50 p-4 rounded-md space-y-4">
            <h3 className="font-semibold text-blue-800">Kök Neden & Aksiyon Planı</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kök Neden Analizi</label>
              <textarea
                name="root_cause"
                value={formData.root_cause}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Düzeltici Faaliyet</label>
              <textarea
                name="corrective_action"
                value={formData.corrective_action}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Tamamlama Tarihi</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* Dosya Yükleme (Demo) */}
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">Dosya sürükleyin veya tıklayın (Demo)</span>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Kaydediliyor..." : "Kaydet ve Ata"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
