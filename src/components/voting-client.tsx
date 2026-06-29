"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Send, X } from "lucide-react";
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
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    return <div className="flex min-h-[60vh] items-center justify-center text-maroon-600"><Loader2 className="animate-spin" /></div>;
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
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-premium">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-maroon-600">Authenticated Voter</p>
          <h2 className="mt-1 text-2xl font-bold text-[#1A1A1A]">
            {payload.student.standard} {payload.student.division} - Roll {payload.student.rollNumber}
          </h2>
        </div>
        <div className="text-sm font-semibold text-maroon-900">
          Step {Object.keys(selected).length} of {payload.ballot.length}
        </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gold-600 transition-all duration-300"
            style={{ width: `${(Object.keys(selected).length / payload.ballot.length) * 100}%` }}
          />
        </div>
      </div>

      {!review ? (
        <div className="space-y-6">
          {payload.ballot.map((position) => (
            <section key={position.id} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-premium">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold text-[#1A1A1A]">{position.priority}. {position.title}</h3>
                {selected[position.id] ? <span className="text-sm font-semibold text-emerald-700">Selected</span> : null}
              </div>
              <div className="grid justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-3">
                {position.candidates.map((candidate) => {
                  const active = selected[position.id] === candidate.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelected((current) => ({ ...current, [position.id]: candidate.id }))}
                      className={cn(
                        "group focus-ring relative h-[520px] w-full max-w-[400px] overflow-hidden rounded-[24px] border bg-white text-center shadow-soft transition duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-premium",
                        active ? "border-4 border-gold-600 shadow-glow" : "border-slate-200",
                      )}
                    >
                      {active ? (
                        <div className="absolute right-4 top-4 z-10 rounded-full bg-gold-600 p-2 text-white shadow-soft">
                          <CheckCircle2 size={22} aria-hidden="true" />
                        </div>
                      ) : null}
                      <div className="relative h-[220px] w-full overflow-hidden bg-maroon-50">
                          {candidate.photo_url ? (
                            <Image src={candidate.photo_url} alt={candidate.name} fill className="object-cover" sizes="400px" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-maroon-50 text-6xl font-bold text-maroon-600">
                              {candidate.name.charAt(0)}
                            </div>
                          )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                        <div className="flex h-[300px] flex-col px-6 py-6">
                          <p className="text-[26px] font-bold leading-tight text-[#1A1A1A]">{candidate.name}</p>
                          <p className="mt-2 text-base font-medium text-slate-500">{position.title}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{candidate.standard}{candidate.division ? ` ${candidate.division}` : ""}</p>
                          {candidate.manifesto ? <p className="mt-4 line-clamp-3 text-sm text-slate-600">{candidate.manifesto}</p> : null}
                          <div className="mt-auto">
                            <div className="mx-auto mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-gold-600 bg-gold-50 text-xl font-bold text-maroon-600">
                              {candidate.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex h-[54px] w-full items-center justify-center rounded-[14px] border border-maroon-600 bg-maroon-600 text-sm font-bold text-white transition duration-300 group-hover:border-gold-600 group-hover:bg-maroon-900">
                              {active ? "Selected" : "Vote"}
                            </div>
                          </div>
                        </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-[20px] sm:border">
            <Button className="h-[54px] w-full rounded-[14px] sm:w-auto" disabled={!complete} onClick={() => setReview(true)}>
              Review Ballot
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-8">
          <h3 className="text-3xl font-bold text-[#1A1A1A]">Review your selections</h3>
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
          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setReview(false)} disabled={submitting}>Edit selections</Button>
            <Button onClick={() => setConfirmOpen(true)} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Submit Final Ballot
            </Button>
          </div>
        </Card>
      )}
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-premium">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-maroon-600">Final Confirmation</p>
                <h3 className="mt-2 text-3xl font-bold text-[#1A1A1A]">Cast your vote?</h3>
              </div>
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => setConfirmOpen(false)} aria-label="Close confirmation">
                <X size={22} />
              </button>
            </div>
            <p className="mt-4 text-base text-slate-600">Are you sure you want to cast your vote? Once submitted, your ballot cannot be edited or submitted again.</p>
            <div className="mt-6 max-h-72 space-y-3 overflow-auto pr-2">
              {selections.map(({ position, candidate }) => (
                <div key={position.id} className="rounded-2xl border border-slate-200 bg-[#F8F7F4] p-4">
                  <p className="text-sm font-semibold text-slate-500">{position.title}</p>
                  <p className="text-lg font-bold text-[#1A1A1A]">{candidate?.name}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)} disabled={submitting}>Cancel</Button>
              <Button className="flex-1" onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Confirm Vote
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
