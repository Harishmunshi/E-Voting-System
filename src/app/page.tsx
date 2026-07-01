import { BrandHeader } from "@/components/brand-shell";
import { StudentLogin } from "@/components/student-login";

export default function Home() {
  return (
    <main className="min-h-screen bg-maroon-900 text-maroon-50">
      <BrandHeader eyebrow="Student Council Election" />
      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="rounded-xl border border-gold-500/25 bg-maroon-600/80 p-7 shadow-premium sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold-500">Official Voting Portal</p>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-maroon-50 sm:text-5xl">
            M.E.S. Student Council Election
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-maroon-100/80">
            A secure, transparent, and touch-friendly voting experience designed for trusted school election operations.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Anonymous ballot", "One vote only", "All posts required"].map((item) => (
              <div key={item} className="rounded-lg border border-gold-500/40 bg-maroon-900/45 px-4 py-4 text-sm font-semibold text-gold-100 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <StudentLogin />
        </div>
      </section>
    </main>
  );
}
