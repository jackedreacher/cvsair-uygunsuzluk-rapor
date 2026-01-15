"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, User, FileText, History, AlertTriangle } from "lucide-react";

interface HistoryItem {
  id: string;
  from_status: string | null;
  to_status: string;
  actor_name: string;
  note: string;
  created_at: string;
}

interface NonconformityDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  status: string;
  department_name: string;
  assignee_name: string;
  reported_date: string;
  due_date: string;
  origin: string;
  root_cause: string;
  corrective_action: string;
  history: HistoryItem[];
}

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<NonconformityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/api/nc/${id}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
      alert("Kayıt bulunamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (toStatus: string, note: string = "") => {
    if (!confirm("Durumu değiştirmek istediğinize emin misiniz?")) return;
    
    setActionLoading(true);
    try {
      await axios.post(`/api/nc/${id}/transition`, {
        to_status: toStatus,
        actor_id: 1, // Demo user
        note: note
      });
      alert("Durum güncellendi!");
      fetchDetail(); // Refresh data
    } catch (error) {
      console.error(error);
      alert("İşlem başarısız. Geçiş kuralına uygun olmayabilir.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (!data) return <div className="p-8 text-center">Veri bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-600 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{data.code}</h1>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                {data.status.toUpperCase().replace("_", " ")}
              </span>
            </div>
            <h2 className="text-xl text-gray-700">{data.title}</h2>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Rapor Tarihi: {new Date(data.reported_date).toLocaleDateString("tr-TR")}</p>
            <p className="font-semibold text-red-600">Hedef: {new Date(data.due_date).toLocaleDateString("tr-TR")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" /> Detaylar
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Açıklama</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded">{data.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Kaynak</label>
                    <p className="font-medium">{data.origin.replace("_", " ").toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">İlgili Bölüm</label>
                    <p className="font-medium">{data.department_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Plan Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
                <AlertTriangle className="w-5 h-5 mr-2" /> Aksiyon Planı
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Kök Neden</label>
                  <p className="text-gray-800">{data.root_cause || "-"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Düzeltici Faaliyet</label>
                  <p className="text-gray-800">{data.corrective_action || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Panel */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">İşlemler</h3>
              <div className="space-y-3">
                {data.status === "yeni" && (
                  <button
                    onClick={() => handleTransition("triyaj")}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Triyajı Başlat
                  </button>
                )}
                {data.status === "triyaj" && (
                  <button
                    onClick={() => handleTransition("bolum_acik")}
                    disabled={actionLoading}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Bölüme Ata
                  </button>
                )}
                {data.status === "bolum_acik" && (
                  <button
                    onClick={() => handleTransition("aksiyon_planlandi")}
                    disabled={actionLoading}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    Aksiyonu Başlat
                  </button>
                )}
                {data.status === "aksiyon_planlandi" && (
                  <button
                    onClick={() => handleTransition("aksiyon_tamamlandi")}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Aksiyonu Tamamla
                  </button>
                )}
                {data.status === "kalite_incelemesi" && (
                  <>
                    <button
                      onClick={() => handleTransition("dogrulandi")}
                      disabled={actionLoading}
                      className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:opacity-50 mb-2"
                    >
                      Onayla (Doğrulandı)
                    </button>
                    <button
                      onClick={() => handleTransition("iade", "Yetersiz aksiyon")}
                      disabled={actionLoading}
                      className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Reddet (İade Et)
                    </button>
                  </>
                )}
                {data.status === "dogrulandi" && (
                  <button
                    onClick={() => handleTransition("kapatildi")}
                    disabled={actionLoading}
                    className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-50"
                  >
                    Dosyayı Kapat
                  </button>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4 mr-2" /> Sorumlu:
                  </div>
                  <div className="font-medium">{data.assignee_name || "Atanmamış"}</div>
                  <button className="text-blue-600 text-xs mt-1 hover:underline">Değiştir</button>
                </div>
              </div>
            </div>

            {/* History Feed */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-gray-500" /> Tarihçe
              </h3>
              <div className="space-y-4">
                {data.history.map((h) => (
                  <div key={h.id} className="border-l-2 border-gray-200 pl-4 pb-2 relative">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-400"></div>
                    <p className="text-sm font-medium text-gray-800">
                      {h.from_status ? `${h.from_status} → ` : ""}{h.to_status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {h.actor_name || "Sistem"} • {new Date(h.created_at).toLocaleString("tr-TR")}
                    </p>
                    {h.note && <p className="text-xs text-gray-600 mt-1 italic">"{h.note}"</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
