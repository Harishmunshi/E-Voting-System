import { BrandHeader } from "@/components/brand-shell";
import { StudentLogin } from "@/components/student-login";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef5ff,transparent_35%),linear-gradient(180deg,#ffffff,#f7f9fd)]">
      <BrandHeader eyebrow="Student Council Election" />
      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-700">Official Voting Portal</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            M.E.S. Student Council Election
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            A secure, anonymous, and touch-friendly voting system designed for a smooth election day across school computers.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Anonymous ballot", "One vote only", "All posts required"].map((item) => (
              <div key={item} className="rounded-lg border border-royal-100 bg-white px-4 py-3 text-sm font-semibold text-royal-900 shadow-sm">
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
