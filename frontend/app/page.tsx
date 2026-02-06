import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      <HeroSection />
      
      {/* Placeholder for future sections */}
      <section className="container mx-auto px-6 text-center">
         {/* More content will come here in Phase 2.2 */}
      </section>
    </div>
  );
}
