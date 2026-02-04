import { ComparisonTable } from "@/components/comparisons/ComparisonTable";
import { getProviderData } from "@/lib/data";

export default async function Home() {
  const data = await getProviderData();
  const hostingProviders = data.hosting_providers;
  const vpnProviders = data.vpn_providers; // We can build a separate table for VPNs later

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
            HostingArena Check
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 text-center max-w-2xl mx-auto mb-8">
            Stop overpaying. We compare 50+ providers daily to find the *actual* best deals.
          </p>
          <div className="flex justify-center gap-4">
             <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
               Compare Hosting
             </button>
             <button className="bg-transparent border border-white hover:bg-white/10 text-white font-bold py-3 px-8 rounded-lg transition">
               Compare VPNs
             </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Hosting Section */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
               <h2 className="text-3xl font-bold text-gray-900">Top Hosting Deals</h2>
               <p className="text-gray-600 mt-2">Real prices, hidden costs revealed.</p>
            </div>
          </div>
          
          <ComparisonTable data={hostingProviders.slice(0, 10)} />
        </div>

        {/* Features Grid (Placeholder) */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
           <div className="bg-white p-6 rounded-xl shadow-sm border">
             <div className="text-4xl mb-4">💰</div>
             <h3 className="text-xl font-bold mb-2">True Cost Analysis</h3>
             <p className="text-gray-600">We reveal the renewal prices that providers try to hide.</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border">
             <div className="text-4xl mb-4">⚡</div>
             <h3 className="text-xl font-bold mb-2">Real Performance</h3>
             <p className="text-gray-600">Speed tests and uptime monitoring from independent nodes.</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border">
             <div className="text-4xl mb-4">🛡️</div>
             <h3 className="text-xl font-bold mb-2">Privacy & Security</h3>
             <p className="text-gray-600">Deep dive into privacy policies and jurisdiction.</p>
           </div>
        </div>

      </div>
    </main>
  );
}
