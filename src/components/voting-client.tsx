"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import type { BallotPosition } from "@/lib/types";
import { readApiJson } from "@/lib/client-api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

type ElectionPayload = {
  ballot: BallotPosition[];
  student: { standard: string; division: string; rollNumber: number };
};

export function VotingClient() {
  const router = useRouter();
  const [payload, setPayload] = useState<ElectionPayload | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/election")
      .then(async (response) => {
        const body = await readApiJson(response);
        if (!response.ok) throw new Error(body.error ?? "Unable to load ballot.");
        setPayload(body as ElectionPayload);
      })
      .catch((issue: Error) => setError(issue.message))
      .finally(() => setLoading(false));
  }, []);

  const complete = useMemo(() => {
    if (!payload) return false;
    return payload.ballot.every((position) => selected[position.id]);
  }, [payload, selected]);

  async function submit() {
    if (!payload || !complete) return;
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes: payload.ballot.map((position) => ({
          position_id: position.id,
          candidate_id: selected[position.id],
        })),
      }),
    });
    const body = await readApiJson(response);
    setSubmitting(false);

    if (!response.ok) {
      setError(body.error ?? "Vote could not be submitted.");
      return;
    }

    router.push("/success");
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-royal-700"><Loader2 className="animate-spin" /></div>;
  }

  if (error && !payload) {
    return (
      <Card className="mx-auto mt-12 max-w-xl p-6 text-center">
        <p className="font-semibold text-red-700">{error}</p>
        <Button className="mt-5" onClick={() => router.push("/")}>Return to Login</Button>
      </Card>
    );
  }

  if (!payload) return null;

  const selections = payload.ballot.map((position) => ({
    position,
    candidate: position.candidates.find((candidate) => candidate.id === selected[position.id]),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-lg border border-royal-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">Authenticated Voter</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {payload.student.standard} {payload.student.division} · Roll {payload.student.rollNumber}
          </h2>
        </div>
        <div className="text-sm font-semibold text-royal-900">
          {Object.keys(selected).length} / {payload.ballot.length} positions selected
        </div>
      </div>

      {!review ? (
        <div className="space-y-6">
          {payload.ballot.map((position) => (
            <section key={position.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-950">{position.priority}. {position.title}</h3>
                {selected[position.id] ? <span className="text-sm font-semibold text-emerald-700">Selected</span> : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {position.candidates.map((candidate) => {
                  const active = selected[position.id] === candidate.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelected((current) => ({ ...current, [position.id]: candidate.id }))}
                      className={cn(
                        "focus-ring min-h-44 rounded-lg border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft",
                        active ? "border-royal-700 ring-4 ring-royal-100" : "border-slate-200",
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-royal-50">
                          {candidate.photo_url ? (
                            <Image src={candidate.photo_url} alt={candidate.name} fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl font-bold text-royal-700">
                              {candidate.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-950">{candidate.name}</p>
                          <p className="mt-1 text-sm font-medium text-slate-600">{candidate.standard}{candidate.division ? ` ${candidate.division}` : ""}</p>
                          {candidate.manifesto ? <p className="mt-3 text-sm text-slate-600">{candidate.manifesto}</p> : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
            <Button className="w-full sm:w-auto" disabled={!complete} onClick={() => setReview(true)}>
              Review Ballot
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-slate-950">Review your selections</h3>
          <div className="mt-6 divide-y divide-slate-100">
            {selections.map(({ position, candidate }) => (
              <div key={position.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold text-slate-950">{position.title}</p>
                  <p className="text-sm text-slate-600">{candidate?.name}</p>
                </div>
                <CheckCircle2 className="text-emerald-600" aria-hidden="true" />
              </div>
            ))}
          </div>
          {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setReview(false)} disabled={submitting}>Edit selections</Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Submit Final Ballot
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
