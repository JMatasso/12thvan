import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { LIABILITY_WAIVER, SITE_NAME } from "@/lib/constants";

export default function WaiverPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-foreground">
            Liability Waiver & Disclaimer
          </h1>
          <p className="mt-2 text-muted-foreground">
            Please read carefully before booking a ride with {SITE_NAME}.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {LIABILITY_WAIVER}
            </pre>
          </div>

          <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/5 p-6">
            <h2 className="font-bold text-foreground">Important Notice</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {SITE_NAME} is a peer-to-peer, informal cost-sharing transportation
              arrangement organized by private individuals. We are{" "}
              <strong>not</strong> a licensed Transportation Network Company
              (TNC), taxi service, or commercial carrier under Texas law. The
              fees collected are intended to offset fuel, vehicle maintenance,
              and operational costs associated with providing rides.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
