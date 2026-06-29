import { BrandHeader } from "@/components/brand-shell";
import { StudentLogin } from "@/components/student-login";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <BrandHeader eyebrow="Student Council Election" />
      <section className="mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-premium sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-maroon-600">Official Voting Portal</p>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#111844] sm:text-5xl">
            M.E.S. Student Council Election
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A secure, transparent, and touch-friendly voting experience designed for trusted school election operations.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Anonymous ballot", "One vote only", "All posts required"].map((item) => (
              <div key={item} className="rounded-2xl border border-gold-600/40 bg-gold-50 px-4 py-4 text-sm font-semibold text-maroon-600 shadow-sm">
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
