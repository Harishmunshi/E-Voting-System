import { BrandHeader } from "@/components/brand-shell";
import { Card } from "@/components/ui/card";
import { getAdminDashboard } from "@/lib/data";
import { percentage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const dashboard = await getAdminDashboard();

  if (!dashboard.settings.results_published || dashboard.settings.results_locked) {
    return (
      <main className="min-h-screen">
        <BrandHeader eyebrow="Election Results" />
        <Card className="mx-auto mt-16 max-w-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Results are not published yet</h2>
          <p className="mt-3 text-slate-600">Final results will appear here only after principal approval.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <BrandHeader eyebrow="Published Results" />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Student Council Election Results</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {dashboard.positions.map((position) => {
            const candidates = dashboard.candidates.filter((candidate) => candidate.position_id === position.id);
            const total = candidates.reduce((sum, candidate) => sum + (candidate.vote_count ?? 0), 0);
            const winner = [...candidates].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))[0];
            return (
              <Card key={position.id} className="p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-maroon-600">{position.title}</p>
                <h3 className="mt-2 text-2xl font-bold text-maroon-900">{winner?.name ?? "No winner"}</h3>
                <div className="mt-4 space-y-3">
                  {candidates.map((candidate) => (
                    <div key={candidate.id}>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>{candidate.name}</span>
                        <span>{candidate.vote_count ?? 0} votes · {percentage(candidate.vote_count ?? 0, total)}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-maroon-600" style={{ width: `${percentage(candidate.vote_count ?? 0, total)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
