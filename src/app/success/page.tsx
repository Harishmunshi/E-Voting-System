import { BrandHeader } from "@/components/brand-shell";
import { SuccessCountdown } from "@/components/success-countdown";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff,#eef5ff)]">
      <BrandHeader eyebrow="Completed" />
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
        <SuccessCountdown />
      </section>
    </main>
  );
}
