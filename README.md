# M.E.S. English Medium School E-Voting

Production-oriented Student Council e-voting platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase PostgreSQL.

## Core Guarantees

- Students log in with standard, division, and roll number.
- Each student can vote exactly once.
- Every position must be selected before submission.
- Vote submission is transaction-safe through a PostgreSQL RPC.
- The database never stores `student -> candidate` selections.
- Admin users can manage students, candidates, election state, turnout, and result publication.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create a public Supabase Storage bucket named `candidate-photos`.
4. Copy `.env.example` to `.env.local` and fill in the values.
5. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Deployment

Deploy to Vercel and add the same environment variables in Project Settings. Keep `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `ADMIN_PASSWORD`, and `PRINCIPAL_UNLOCK_CODE` server-only.

## Default Routes

- `/` - Student login
- `/vote` - Student ballot
- `/success` - Post-vote countdown
- `/admin` - Admin portal
- `/results` - Public results page after principal approval

## Security Notes

The application uses secure HTTP-only cookies, server-side validation, route-level admin checks, input validation, basic rate limiting, and a transaction-safe Supabase function for anonymous ballot submission. For production, place the app behind Vercel HTTPS, use strong secrets, and rotate admin credentials after setup.
