import { getDonationStats } from "@/lib/stats";

export default async function DonationStats() {
  const stats = await getDonationStats();

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📊 Impacto de la Comunidad
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD TOTAL */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-1 rounded-2xl shadow-lg">
          <div className="bg-white p-6 rounded-[14px] h-full flex flex-col justify-center">
            <span className="text-green-600 font-bold text-sm uppercase tracking-wider">Recaudación Total</span>
            <p className="text-4xl font-black text-gray-900 mt-1">{stats.overallTotal}€</p>
          </div>
        </div>

        {/* CARD REGISTRADOS */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1 rounded-2xl shadow-lg">
          <div className="bg-white p-6 rounded-[14px] h-full flex flex-col justify-center">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Usuarios con Karma</span>
            <p className="text-4xl font-black text-gray-900 mt-1">{stats.registeredTotal}€</p>
          </div>
        </div>

        {/* CARD ANÓNIMOS */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-1 rounded-2xl shadow-lg">
          <div className="bg-white p-6 rounded-[14px] h-full flex flex-col justify-center">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">Donantes Anónimos</span>
            <p className="text-4xl font-black text-gray-900 mt-1">{stats.anonymousTotal}€</p>
          </div>
        </div>
      </div>
    </div>
  );
}