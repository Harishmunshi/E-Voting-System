"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Loader2, Send, X } from "lucide-react";
import type { BallotPosition } from "@/lib/types";
import { readApiJson } from "@/lib/client-api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

type ElectionPayload = {
  ballot: BallotPosition[];
  student: { standard: string; division: string; rollNumber: number };
};

export function VotingClient({ initialPayload }: { initialPayload: ElectionPayload }) {
  const router = useRouter();
  const [payload] = useState<ElectionPayload>(initialPayload);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const selections = payload.ballot.map((position) => ({
    position,
    candidate: position.candidates.find((candidate) => candidate.id === selected[position.id]),
  }));

  return (
    <div className="mx-auto max-w-5xl px-3 py-5 sm:px-5 lg:px-6">
      <div className="mb-5 rounded-xl border border-gold-500/25 bg-maroon-600 px-4 py-3 shadow-soft">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">Authenticated Voter</p>
            <h2 className="mt-1 text-lg font-bold text-maroon-50 sm:text-xl">
              {payload.student.standard} {payload.student.division} - Roll {payload.student.rollNumber}
            </h2>
          </div>
          <div className="text-sm font-semibold text-gold-100">
            {Object.keys(selected).length}/{payload.ballot.length} selected
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-maroon-900/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-100 transition-all duration-300"
            style={{ width: `${(Object.keys(selected).length / payload.ballot.length) * 100}%` }}
          />
        </div>
      </div>

      {!review ? (
        <div className="space-y-4">
          {payload.ballot.map((position) => (
            <section key={position.id} className="rounded-xl border border-gold-500/25 bg-maroon-600 p-3 shadow-soft sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-gold-500/20 pb-3">
                <h3 className="text-base font-bold text-maroon-50 sm:text-lg">{position.priority}. {position.title}</h3>
                {selected[position.id] ? (
                  <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-3 py-1 text-xs font-bold text-gold-100">Selected</span>
                ) : null}
              </div>
              <div className="space-y-2">
                {position.candidates.map((candidate) => {
                  const active = selected[position.id] === candidate.id;
                  const initials = candidate.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelected((current) => ({ ...current, [position.id]: candidate.id }))}
                      className={cn(
                        "group focus-ring flex min-h-[72px] w-full items-center gap-3 rounded-lg border p-3 text-left transition duration-200 hover:border-gold-500 hover:bg-maroon-700",
                        active ? "border-gold-500 bg-gold-500/14 shadow-glow" : "border-gold-500/20 bg-maroon-900/35",
                      )}
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gold-500/25 bg-maroon-900 text-sm font-bold text-gold-100">
                        {candidate.photo_url ? (
                          <Image src={candidate.photo_url} alt={candidate.name} fill className="object-cover" sizes="48px" />
                        ) : initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-bold text-maroon-50">{candidate.name}</p>
                          {candidate.name === "NOTA" ? (
                            <span className="rounded-full border border-gold-500/30 px-2 py-0.5 text-[11px] font-bold uppercase text-gold-100/80">Last option</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-maroon-100/70">
                          {candidate.standard}{candidate.division ? ` ${candidate.division}` : ""}
                        </p>
                      </div>
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
                        active ? "border-gold-500 bg-gold-500 text-maroon-900" : "border-gold-500/30 bg-maroon-900/50 text-gold-100/50 group-hover:text-gold-500",
                      )}>
                        {active ? <CheckCircle2 size={20} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {error ? <p className="rounded-lg bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200">{error}</p> : null}
          <div className="sticky bottom-0 -mx-3 border-t border-gold-500/25 bg-maroon-900/95 px-3 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
            <Button className="h-11 w-full sm:w-auto" disabled={!complete} onClick={() => setReview(true)}>
              Review Ballot
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-5 sm:p-6">
          <h3 className="text-2xl font-black text-maroon-50">Review your selections</h3>
          <div className="mt-4 divide-y divide-gold-500/15">
            {selections.map(({ position, candidate }) => (
              <div key={position.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold text-maroon-50">{position.title}</p>
                  <p className="text-sm text-maroon-100/70">{candidate?.name}</p>
                </div>
                <CheckCircle2 className="shrink-0 text-gold-500" aria-hidden="true" />
              </div>
            ))}
          </div>
          {error ? <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200">{error}</p> : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setReview(false)} disabled={submitting}>Edit selections</Button>
            <Button onClick={() => setConfirmOpen(true)} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Submit Final Ballot
            </Button>
          </div>
        </Card>
      )}
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-gold-500/25 bg-maroon-600 p-5 shadow-premium sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">Final Confirmation</p>
                <h3 className="mt-2 text-2xl font-black text-maroon-50">Cast your vote?</h3>
              </div>
              <button className="rounded-full p-2 text-maroon-100/70 hover:bg-maroon-700" onClick={() => setConfirmOpen(false)} aria-label="Close confirmation">
                <X size={22} />
              </button>
            </div>
            <p className="mt-3 text-sm text-maroon-100/70">Are you sure you want to cast your vote? Once submitted, your ballot cannot be edited or submitted again.</p>
            <div className="mt-5 max-h-72 space-y-2 overflow-auto pr-2">
              {selections.map(({ position, candidate }) => (
                <div key={position.id} className="rounded-lg border border-gold-500/20 bg-maroon-900/45 p-3">
                  <p className="text-xs font-semibold text-maroon-100/60">{position.title}</p>
                  <p className="text-base font-bold text-maroon-50">{candidate?.name}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
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
