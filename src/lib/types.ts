export type ElectionSettings = {
  election_enabled: boolean;
  results_locked: boolean;
  results_published: boolean;
  principal_approved_at: string | null;
};

export type Position = {
  id: string;
  title: string;
  slug: string;
  priority: number;
  gender: "boy" | "girl";
};

export type Candidate = {
  id: string;
  position_id: string;
  name: string;
  standard: string;
  division: string | null;
  photo_url: string | null;
  manifesto: string | null;
  is_active: boolean;
  vote_count?: number;
};

export type BallotPosition = Position & {
  candidates: Candidate[];
};

export type StudentSession = {
  studentId: string;
  standard: string;
  division: string;
  rollNumber: number;
  issuedAt: number;
};

export type AdminSession = {
  email: string;
  issuedAt: number;
};
