# Deploy and Connect Supabase

Project folder:

```text
C:\Users\Harish\Documents\Codex\2026-06-22\m-e-s-english-medium-school
```

Open this folder in VS Code, push it to GitHub, then import that GitHub repository into Vercel.

## 1. Create Supabase Backend

1. Go to Supabase and create a new project.
2. Open SQL Editor.
3. Copy all SQL from:

```text
supabase/schema.sql
```

4. Run it once.
5. Go to Storage.
6. Create a public bucket named:

```text
candidate-photos
```

## 2. Get Supabase Keys

In Supabase, open Project Settings > API and copy:

```text
Project URL
anon public key
service_role key
```

Do not expose the `service_role` key in the browser.

## 3. Create Local Env File

Create this file in the project root:

```text
.env.local
```

Paste:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=make-this-a-long-random-secret-at-least-24-characters
ADMIN_EMAIL=admin@mes.school
ADMIN_PASSWORD=change-this-password
PRINCIPAL_UNLOCK_CODE=principal-only-code
```

Examples of valid student standards include:

```text
Std 5
Std 6
Std 7
Std 8
Std 9
Std 10
Std 11 Science
Std 11 Commerce
Std 12 Science
Std 12 Commerce
```

Then run:

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3001
```

If port 3001 is used, run:

```bash
npm run dev -- --port 3002
```

## 4. Add Vercel Environment Variables

In Vercel Project Settings > Environment Variables, add the same values:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
PRINCIPAL_UNLOCK_CODE
```

Redeploy after adding them.

## 5. First Admin Login

Go to:

```text
/admin
```

Use:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

Then add/import students, upload candidate photos, add candidates, enable election, and start voting.

## 6. GitHub to Vercel

From this project folder:

```bash
git init
git add .
git commit -m "Initial M.E.S. e-voting platform"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Then import the repo in Vercel.
