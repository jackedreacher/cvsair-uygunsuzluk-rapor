"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Plus, Filter, AlertCircle } from "lucide-react";

interface Nonconformity {
  id: string;
  code: string;
  title: string;
  department_name: string;
  status: string;
  due_date: string;
  assignee_name: string;
}

export default function DashboardPage() {
  const [items, setItems] = useState<Nonconformity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/nc");
      setItems(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      yeni: "bg-blue-100 text-blue-800",
      triyaj: "bg-yellow-100 text-yellow-800",
      bolum_acik: "bg-purple-100 text-purple-800",
      aksiyon_tamamlandi: "bg-green-100 text-green-800",
      kapatildi: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100"}`}>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Uygunsuzluk Takibi</h1>
            <p className="text-gray-500">Açık görevler ve durum raporları</p>
          </div>
          <Link href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Yeni Kayıt
          </Link>
        </div>

        {/* Filters (Mock) */}
        <div className="bg-white p-4 rounded-md shadow-sm mb-6 flex gap-4">
          <button className="flex items-center text-gray-600 hover:text-blue-600">
            <Filter className="w-4 h-4 mr-2" /> Filtrele
          </button>
          <select className="border-gray-300 rounded-md text-sm">
            <option>Tüm Bölümler</option>
            <option>Üretim</option>
            <option>Kalite</option>
          </select>
          <select className="border-gray-300 rounded-md text-sm">
            <option>Tüm Durumlar</option>
            <option>Açık</option>
            <option>Tamamlandı</option>
          </select>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölüm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sorumlu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hedef Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Yükleniyor...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Henüz kayıt bulunmuyor.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.department_name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.assignee_name || "Atanmamış"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.due_date ? new Date(item.due_date).toLocaleDateString("tr-TR") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/nc/${item.id}`} className="text-blue-600 hover:text-blue-900">Detay</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
