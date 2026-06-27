import { getSupabaseAdmin } from "./supabase";
import type { BallotPosition, Candidate, ElectionSettings, Position } from "./types";

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
  const { data: positions, error: positionsError } = await getSupabaseAdmin()
    .from("positions")
    .select("id, title, slug, priority, gender")
    .order("priority", { ascending: true });

  if (positionsError) throw positionsError;

  const { data: candidates, error: candidatesError } = await getSupabaseAdmin()
    .from("candidates")
    .select("id, position_id, name, standard, division, photo_url, manifesto, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (candidatesError) throw candidatesError;

  return (positions as Position[]).map((position) => ({
    ...position,
    candidates: (candidates as Candidate[]).filter((candidate) => candidate.position_id === position.id),
  }));
}

export async function getAdminDashboard() {
  const supabase = getSupabaseAdmin();
  const [settings, students, voted, positions, candidates] = await Promise.all([
    getElectionSettings(),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("has_voted", true),
    supabase.from("positions").select("id, title, slug, priority, gender").order("priority", { ascending: true }),
    supabase
      .from("candidates")
      .select("id, position_id, name, standard, division, photo_url, manifesto, is_active, vote_count")
      .order("name", { ascending: true }),
  ]);

  if (students.error) throw students.error;
  if (voted.error) throw voted.error;
  if (positions.error) throw positions.error;
  if (candidates.error) throw candidates.error;

  return {
    settings,
    totalStudents: students.count ?? 0,
    votesCast: voted.count ?? 0,
    positions: positions.data as Position[],
    candidates: candidates.data as Candidate[],
  };
}
