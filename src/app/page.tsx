import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SchedulePreview } from "@/components/landing/schedule-preview";
import { Pricing } from "@/components/landing/pricing";
import { Trust } from "@/components/landing/trust";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SchedulePreview />
        <Pricing />
        <Trust />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
