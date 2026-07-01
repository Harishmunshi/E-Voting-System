"use client";

import { FormEvent, useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Check, DatabaseZap, Loader2, Plus, Power, RotateCcw, Trash2, Upload } from "lucide-react";
import type { Candidate, ElectionSettings, Position } from "@/lib/types";
import { readApiJson } from "@/lib/client-api";
import { percentage } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input, Select } from "./ui/input";

type Dashboard = {
  settings: ElectionSettings;
  totalStudents: number;
  votesCast: number;
  positions: Position[];
  candidates: Candidate[];
};

export function AdminDashboard({ initial }: { initial: Dashboard }) {
  const [dashboard, setDashboard] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const remaining = dashboard.totalStudents - dashboard.votesCast;
  const turnout = percentage(dashboard.votesCast, dashboard.totalStudents);

  async function refresh() {
    const response = await fetch("/api/admin/dashboard");
    if (response.ok) setDashboard((await readApiJson(response)) as Dashboard);
  }

  async function electionAction(action: string) {
    const principalCode = action === "publish_results" ? window.prompt("Enter principal approval code") : undefined;
    if (action === "publish_results" && !principalCode) return;
    if (["reset_election", "reset_voting_status"].includes(action) && !window.confirm("This action changes election records. Continue?")) return;
    setBusy(true);
    const response = await fetch("/api/admin/election", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, principalCode }),
    });
    const body = await readApiJson(response);
    setBusy(false);
    setMessage(response.ok ? "Election updated." : body.error ?? "Action failed.");
    await refresh();
  }

  async function cleanupAction(action: string, label: string) {
    if (!window.confirm(`${label}? This cannot be undone.`)) return;
    setBusy(true);
    const response = await fetch("/api/admin/election", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const body = await readApiJson(response);
    setBusy(false);
    setMessage(response.ok ? `${label} completed.` : body.error ?? "Cleanup failed.");
    await refresh();
  }

  async function deleteCandidate(candidate: Candidate) {
    if (candidate.name === "NOTA") {
      setMessage("NOTA is a system option and cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete ${candidate.name} from the ballot?`)) return;
    setBusy(true);
    const response = await fetch(`/api/admin/candidates?id=${candidate.id}`, { method: "DELETE" });
    const body = await readApiJson(response);
    setBusy(false);
    setMessage(response.ok ? "Candidate removed from ballot." : body.error ?? "Could not delete candidate.");
    await refresh();
  }

  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.get("full_name"),
        standard: form.get("standard"),
        division: form.get("division"),
        roll_number: Number(form.get("roll_number")),
      }),
    });
    setMessage(response.ok ? "Student added." : (await readApiJson(response)).error ?? "Could not add student.");
    if (response.ok) event.currentTarget.reset();
    await refresh();
  }

  async function addCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        position_id: form.get("position_id"),
        name: form.get("name"),
        standard: form.get("standard"),
        division: form.get("division"),
        photo_url: photoUrl || form.get("photo_url"),
        manifesto: form.get("manifesto"),
        is_active: true,
      }),
    });
    setMessage(response.ok ? "Candidate added." : (await readApiJson(response)).error ?? "Could not add candidate.");
    if (response.ok) {
      event.currentTarget.reset();
      setPhotoUrl("");
    }
    await refresh();
  }

  async function importStudents(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/students/import", { method: "POST", body: form });
    const body = await readApiJson(response);
    setMessage(response.ok ? `${body.imported ?? 0} students imported.` : body.error ?? "Could not import students.");
    if (response.ok) event.currentTarget.reset();
    await refresh();
  }

  async function uploadPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/candidates/photo", { method: "POST", body: form });
    const body = await readApiJson(response);
    if (response.ok) {
      setPhotoUrl(String(body.url ?? ""));
      setMessage("Candidate photo uploaded.");
    } else {
      setMessage(body.error ?? "Could not upload photo.");
    }
  }

  const chartData = useMemo(() => dashboard.positions.map((position) => {
    const candidates = dashboard.candidates.filter((candidate) => candidate.position_id === position.id && candidate.is_active);
    const winner = [...candidates].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))[0];
    return { position: position.title.replace(" (", "\n("), leader: winner?.vote_count ?? 0 };
  }), [dashboard]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-maroon-50 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">Election Control Center</p>
          <h2 className="mt-1 text-3xl font-black text-maroon-50">Admin Dashboard</h2>
        </div>
        <form action="/api/admin/logout" method="post">
          <Button variant="secondary">Sign out</Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total Students" value={dashboard.totalStudents} />
        <Metric label="Votes Cast" value={dashboard.votesCast} />
        <Metric label="Remaining" value={remaining} />
        <Metric label="Turnout" value={`${turnout}%`} />
      </div>

      <Card className="mt-6 p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-xl font-bold text-maroon-50">Election Management</h3>
            <p className="mt-1 text-sm text-maroon-100/70">
              Voting is {dashboard.settings.election_enabled ? "enabled" : "disabled"} - Results are {dashboard.settings.results_published ? "published" : "hidden"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => electionAction("enable")}><Power size={16} />Enable</Button>
            <Button variant="secondary" disabled={busy} onClick={() => electionAction("disable")}>Disable</Button>
            <Button variant="secondary" disabled={busy} onClick={() => electionAction("lock_results")}>Lock Results</Button>
            <Button disabled={busy} onClick={() => electionAction("publish_results")}><Check size={16} />Publish</Button>
            <Button variant="danger" disabled={busy} onClick={() => electionAction("reset_election")}><RotateCcw size={16} />Reset</Button>
          </div>
        </div>
        {message ? <p className="mt-4 rounded-lg border border-gold-500/30 bg-gold-500/15 px-4 py-3 text-sm font-semibold text-gold-100">{message}</p> : null}
      </Card>

      <Card className="mt-6 p-5">
        <div className="mb-4 flex items-center gap-2">
          <DatabaseZap className="text-gold-500" size={20} />
          <h3 className="text-xl font-bold text-maroon-50">Data Cleanup</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Button variant="secondary" disabled={busy} onClick={() => cleanupAction("reset_voting_status", "Reset voting status")}>Reset Voting Status</Button>
          <Button variant="secondary" disabled={busy} onClick={() => cleanupAction("restore_candidate_entries", "Restore candidate entries")}>Restore Candidate List</Button>
          <Button variant="danger" disabled={busy} onClick={() => cleanupAction("clear_students", "Delete all student entries")}><Trash2 size={16} />Delete Student Entries</Button>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <h3 className="text-xl font-bold text-maroon-50">Add Student</h3>
          <form className="mt-4 grid gap-3" onSubmit={addStudent}>
            <Input name="full_name" placeholder="Student name optional" />
            <div className="grid grid-cols-3 gap-3">
              <Input name="standard" placeholder="Std 10" required />
              <Input name="division" placeholder="A" required />
              <Input name="roll_number" type="number" min={1} placeholder="27" required />
            </div>
            <Button><Plus size={16} />Add Student</Button>
          </form>
          <form className="mt-5 rounded-lg border border-dashed border-gold-500/50 bg-maroon-900/45 p-4 text-sm text-maroon-100/70" onSubmit={importStudents}>
            <Upload className="mb-2 text-gold-500" size={20} />
            <p className="mb-3 font-semibold text-maroon-50">Bulk CSV import</p>
            <Input name="file" type="file" accept=".csv,text/csv" required />
            <p className="mt-2 text-xs">Headers: standard, division, roll_number, full_name</p>
            <Button className="mt-3" variant="secondary">Import CSV</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="text-xl font-bold text-maroon-50">Add Candidate</h3>
          <form className="mt-4 grid gap-3" onSubmit={addCandidate}>
            <Select name="position_id" required defaultValue="">
              <option value="" disabled>Position</option>
              {dashboard.positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}
            </Select>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" placeholder="Candidate name" required />
              <Input name="standard" placeholder="Std 10" required />
            </div>
            <Input name="division" placeholder="Division optional" />
            <Input
              name="photo_url"
              placeholder="Candidate photo URL from Supabase Storage"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
            />
            <Input name="manifesto" placeholder="Manifesto or tagline optional" />
            <Button><Plus size={16} />Add Candidate</Button>
          </form>
          <form className="mt-4 rounded-lg border border-dashed border-gold-500/50 bg-maroon-900/45 p-4" onSubmit={uploadPhoto}>
            <p className="mb-3 text-sm font-semibold text-maroon-50">Upload candidate photo</p>
            <Input name="file" type="file" accept="image/*" required />
            <Button className="mt-3" variant="secondary"><Upload size={16} />Upload Photo</Button>
          </form>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="text-gold-500" size={20} />
          <h3 className="text-xl font-bold text-maroon-50">Result Monitor</h3>
        </div>
        {busy ? <Loader2 className="animate-spin text-gold-500" /> : null}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 241, 232, 0.18)" />
              <XAxis dataKey="position" tick={{ fontSize: 11, fill: "#f4f1e8" }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fill: "#f4f1e8" }} />
              <Tooltip contentStyle={{ background: "#12264f", border: "1px solid rgba(212,175,55,.35)", color: "#f4f1e8" }} />
              <Bar dataKey="leader" fill="#d4af37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-gold-500/20 p-5">
          <h3 className="text-xl font-bold text-maroon-50">Candidates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-maroon-900/55 text-maroon-100/70">
              <tr>
                <th className="px-5 py-3">Position</th>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Votes</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/15">
              {dashboard.candidates.map((candidate) => (
                <tr key={candidate.id} className={candidate.is_active ? "" : "opacity-50"}>
                  <td className="px-5 py-3 text-maroon-100/80">{dashboard.positions.find((position) => position.id === candidate.position_id)?.title}</td>
                  <td className="px-5 py-3 font-semibold text-maroon-50">{candidate.name}</td>
                  <td className="px-5 py-3 text-maroon-100/80">{candidate.standard} {candidate.division}</td>
                  <td className="px-5 py-3 text-maroon-100/80">{candidate.vote_count ?? 0}</td>
                  <td className="px-5 py-3 text-maroon-100/80">{candidate.is_active ? "Active" : "Deleted"}</td>
                  <td className="px-5 py-3">
                    <Button
                      variant="danger"
                      className="min-h-9 px-3 py-1 text-xs"
                      disabled={busy || candidate.name === "NOTA" || !candidate.is_active}
                      onClick={() => deleteCandidate(candidate)}
                    >
                      <Trash2 size={14} />Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-maroon-100/65">{label}</p>
      <p className="mt-2 text-3xl font-black text-gold-500">{value}</p>
    </Card>
  );
}
