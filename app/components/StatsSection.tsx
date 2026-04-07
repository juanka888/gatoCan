import { prisma } from "@/lib/prisma";
import { Heart, Users, Globe } from "lucide-react";

export default async function StatsSection() {
  // 1. SACAMOS LOS DATOS DIRECTAMENTE (La lógica que pedías)
  const userDonations = await prisma.donation.aggregate({
    where: { userId: { not: null } },
    _sum: { amount: true },
  });

  const anonymousDonations = await prisma.donation.aggregate({
    where: { userId: null },
    _sum: { amount: true },
  });

  const registeredTotal = Number(userDonations._sum.amount) || 0;
  const anonymousTotal = Number(anonymousDonations._sum.amount) || 0;
  const overallTotal = registeredTotal + anonymousTotal;

  // 2. EL DISEÑO (La sección para tu Home)
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">
            Impacto GatoCan 🐾
          </h2>
          <p className="text-gray-500 font-medium">Cada donación salva una vida. ¡Mira lo que estamos logrando!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CARD GLOBAL */}
          <div className="bg-green-500 p-8 rounded-3xl text-white shadow-xl transform hover:scale-105 transition-transform">
            <Heart className="mb-4 opacity-80" size={32} />
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-90">Recaudación Global</h3>
            <p className="text-5xl font-black mt-2">{overallTotal}€</p>
            <p className="text-sm mt-4 opacity-80 font-medium">Total recaudado para refugios</p>
          </div>

          {/* CARD REGISTRADOS */}
          <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl transform hover:scale-105 transition-transform">
            <Users className="mb-4 text-blue-400" size={32} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Comunidad con Karma</h3>
            <p className="text-5xl font-black mt-2">{registeredTotal}€</p>
            <p className="text-sm mt-4 opacity-60 font-medium">Donado por usuarios registrados</p>
          </div>

          {/* CARD ANÓNIMOS */}
          <div className="bg-gray-100 p-8 rounded-3xl text-gray-900 border-2 border-dashed border-gray-300 transform hover:scale-105 transition-transform">
            <Globe className="mb-4 text-purple-600" size={32} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-purple-600">Héroes Anónimos</h3>
            <p className="text-5xl font-black mt-2">{anonymousTotal}€</p>
            <p className="text-sm mt-4 text-gray-500 font-medium">Donaciones de visitantes</p>
          </div>
        </div>
      </div>
    </section>
  );
}