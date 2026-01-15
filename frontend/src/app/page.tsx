import Link from "next/link";
import { ClipboardList, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Cvsair Uygunsuzluk Raporu Sistemi</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Kalite yönetim süreçlerini dijitalleştirin. Uygunsuzlukları raporlayın, görevleri atayın ve süreçleri anlık takip edin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link href="/create" className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Rapor Oluştur</h2>
          <p className="text-gray-500">Yeni bir uygunsuzluk, müşteri şikayeti veya iç tetkik bulgusu kaydedin.</p>
        </Link>

        <Link href="/dashboard" className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Yönetim Paneli</h2>
          <p className="text-gray-500">Açık kayıtları inceleyin, durumlarını güncelleyin ve raporları görüntüleyin.</p>
        </Link>
      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Cvsair Kalite Yönetimi
      </footer>
    </div>
  );
}
