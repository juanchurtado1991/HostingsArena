import { HeroSection } from "@/components/HeroSection";
import { TopProviders } from "@/components/TopProviders";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      <div className="relative">
        <HeroSection />
        {/* Money Maker Section: High Conversion Top 3 */}
        <TopProviders />
      </div>

      {/* Search & Compare Section (Coming Soon) */}
      <section className="container mx-auto px-6 text-center py-20">
        <h2 className="text-3xl font-bold mb-6">¿No te convence ninguno?</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Compara más de 50 proveedores con datos reales de rendimiento.
        </p>
        {/* Button will lead to full comparison */}
      </section>
    </div>
  );
}
