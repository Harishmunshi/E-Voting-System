import { getSupabaseAdmin } from "./supabase";
import type { BallotPosition, Candidate, ElectionSettings, Position } from "./types";

const ELECTION_CANDIDATES = [
  { positionTitle: "Head Boy", name: "Malek Ayaan", standard: "Std 11" },
  { positionTitle: "Head Boy", name: "Arab Zenul", standard: "Std 11" },
  { positionTitle: "Head Boy", name: "Karbhari Aman", standard: "Std 11" },
  { positionTitle: "Head Girl", name: "Shaikh Aksa", standard: "Std 11" },
  { positionTitle: "Head Girl", name: "Shaikh Ayesha", standard: "Std 11" },
  { positionTitle: "Vice Head Boy", name: "Shaikh Vakid", standard: "Std 9" },
  { positionTitle: "Vice Head Boy", name: "Gabanwala Alkama", standard: "Std 9" },
  { positionTitle: "Vice Head Girl", name: "Pathan Tahura", standard: "Std 9" },
  { positionTitle: "Vice Head Girl", name: "Shaikh Aksa", standard: "Std 9" },
  { positionTitle: "Junior Head Boy", name: "Shaikh Atif", standard: "Std 8" },
  { positionTitle: "Junior Head Boy", name: "Karbhari Rehan", standard: "Std 6" },
  { positionTitle: "Junior Head Boy", name: "Shaikh Mohd Avesh", standard: "Std 6" },
  { positionTitle: "Junior Head Boy", name: "Kauvawala Musab", standard: "Std 6" },
  { positionTitle: "Junior Head Girl", name: "Shaikh Ayana", standard: "Std 6" },
  { positionTitle: "Junior Head Girl", name: "Vohra Safrin", standard: "Std 6" },
  { positionTitle: "Cultural Head (Boy)", name: "Patanwala Taha", standard: "Std 9" },
  { positionTitle: "Cultural Head (Girl)", name: "Pathan Roshni Fatema", standard: "Std 11" },
  { positionTitle: "Discipline Head (Boy)", name: "Malek Arman", standard: "Std 9" },
  { positionTitle: "Discipline Head (Boy)", name: "Karbhari Arhan", standard: "Std 9" },
  { positionTitle: "Discipline Head (Boy)", name: "Sethwala Hamdan", standard: "Std 6" },
  { positionTitle: "Discipline Head (Girl)", name: "Pathan Rehnuma", standard: "Std 9" },
  { positionTitle: "Discipline Head (Girl)", name: "Shaikh Fatema", standard: "Std 7" },
  { positionTitle: "Discipline Head (Girl)", name: "Shaikh Humaisa", standard: "Std 7" },
  { positionTitle: "Sports Captain (Boy)", name: "Kheruwala Hamza", standard: "Std 11" },
  { positionTitle: "Sports Captain (Boy)", name: "Vohra Mo. Zaid", standard: "Std 11" },
  { positionTitle: "Sports Captain (Boy)", name: "Shaikh Mo. Amis Aslam", standard: "Std 11" },
  { positionTitle: "Sports Captain (Girl)", name: "Maurya Sejal", standard: "Std 11" },
  { positionTitle: "Sports Captain (Girl)", name: "Shaikh Aksha", standard: "Std 9" },
] as const;

const REMOVED_CANDIDATES = [
  { positionTitle: "Head Boy", name: "Harish Munshi" },
] as const;

export async function getElectionSettings(): Promise<ElectionSettings> {
  const { data, error } = await getSupabaseAdmin()
    .from("election_settings")
    .select("election_enabled, results_locked, results_published, principal_approved_at")
    .eq("id", true)
    .single();

  if (error) throw error;
  return data;
}

export async function getBallot(): Promise<BallotPosition[]> {
  const supabase = getSupabaseAdmin();
  const { data: positions, error: positionsError } = await getSupabaseAdmin()
    .from("positions")
    .select("id, title, slug, priority, gender")
    .order("priority", { ascending: true });

  if (positionsError) throw positionsError;

  await ensureElectionCandidates(positions as Position[]);
  await deactivateRemovedCandidates(positions as Position[]);
  await ensureNotaCandidates(positions as Position[]);

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, position_id, name, standard, division, photo_url, manifesto, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (candidatesError) throw candidatesError;

  return (positions as Position[]).map((position) => ({
    ...position,
    candidates: sortCandidates((candidates as Candidate[]).filter((candidate) => candidate.position_id === position.id)),
  }));
}

function sortCandidates(candidates: Candidate[]) {
  return [...candidates].sort((a, b) => {
    if (a.name === "NOTA") return 1;
    if (b.name === "NOTA") return -1;
    return a.name.localeCompare(b.name);
  });
}

async function ensureElectionCandidates(positions: Position[]) {
  const supabase = getSupabaseAdmin();
  const positionIds = new Map(positions.map((position) => [position.title, position.id]));

  await Promise.all(ELECTION_CANDIDATES.map(async (candidate) => {
    const positionId = positionIds.get(candidate.positionTitle);
    if (!positionId) return;

    const { data: existing, error: lookupError } = await supabase
      .from("candidates")
      .select("id")
      .eq("position_id", positionId)
      .eq("name", candidate.name)
      .eq("standard", candidate.standard)
      .maybeSingle();

    if (lookupError || existing) return;

    await supabase.from("candidates").insert({
      position_id: positionId,
      name: candidate.name,
      standard: candidate.standard,
      division: null,
      photo_url: null,
      manifesto: `Candidate for ${candidate.positionTitle}.`,
      is_active: true,
    });
  }));
}

async function deactivateRemovedCandidates(positions: Position[]) {
  const supabase = getSupabaseAdmin();
  const positionIds = new Map(positions.map((position) => [position.title, position.id]));

  await Promise.all(REMOVED_CANDIDATES.map(async (candidate) => {
    const positionId = positionIds.get(candidate.positionTitle);
    if (!positionId) return;

    await supabase
      .from("candidates")
      .update({ is_active: false })
      .eq("position_id", positionId)
      .eq("name", candidate.name);
  }));
}

async function ensureNotaCandidates(positions: Position[]) {
  const supabase = getSupabaseAdmin();

  await Promise.all(positions.map(async (position) => {
    const { data: existing, error: lookupError } = await supabase
      .from("candidates")
      .select("id")
      .eq("position_id", position.id)
      .eq("name", "NOTA")
      .maybeSingle();

    if (lookupError || existing) return;

    await supabase.from("candidates").insert({
      position_id: position.id,
      name: "NOTA",
      standard: "All Classes",
      division: null,
      photo_url: "/nota.png",
      manifesto: "None of the above.",
      is_active: true,
    });
  }));
}

export async function getAdminDashboard() {
  const supabase = getSupabaseAdmin();
  const [settings, students, voted, positions] = await Promise.all([
    getElectionSettings(),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("has_voted", true),
    supabase.from("positions").select("id, title, slug, priority, gender").order("priority", { ascending: true }),
  ]);

  if (students.error) throw students.error;
  if (voted.error) throw voted.error;
  if (positions.error) throw positions.error;

  await ensureElectionCandidates(positions.data as Position[]);
  await deactivateRemovedCandidates(positions.data as Position[]);
  await ensureNotaCandidates(positions.data as Position[]);

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, position_id, name, standard, division, photo_url, manifesto, is_active, vote_count")
    .order("name", { ascending: true });

  if (candidatesError) throw candidatesError;

  return {
    settings,
    totalStudents: students.count ?? 0,
    votesCast: voted.count ?? 0,
    positions: positions.data as Position[],
    candidates: candidates as Candidate[],
  };
}
