# Operation 15 — Deployment Guide

## Stack
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **Avatars**: Ready Player Me + React Three Fiber
- **3D Engine**: Three.js via @react-three/fiber

---

## Step 1 — Supabase Project Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to your users (e.g. `us-east-1`)
3. Save your **database password** — you'll need it for migrations

### 1.2 Run Migrations
In the Supabase Dashboard → SQL Editor, run each migration **in order**:

```
supabase/migrations/001_extensions_and_ranks.sql
supabase/migrations/002_profiles.sql
supabase/migrations/003_exercise_library.sql
supabase/migrations/004_session_logs.sql
supabase/migrations/005_xp_events.sql
supabase/migrations/006_achievements.sql
supabase/migrations/007_streaks.sql
supabase/migrations/008_nutrition_logs.sql
supabase/migrations/009_views.sql
```

Or using the Supabase CLI:
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### 1.3 Configure Auth Providers

**Google OAuth:**
1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → Authentication → Providers → Google → paste Client ID + Secret

**Apple OAuth:**
1. [developer.apple.com](https://developer.apple.com) → Certificates, IDs & Profiles → Keys
2. Create Sign in with Apple key
3. In Supabase Dashboard → Authentication → Providers → Apple → paste credentials

### 1.4 Configure Email Templates
In Supabase Dashboard → Authentication → Email Templates:
- **Confirm signup**: Update from address to your domain
- **Reset password**: Update redirect URL to `https://yourdomain.com/reset-password`

### 1.5 Get API Keys
In Supabase Dashboard → Project Settings → API:
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

### 1.6 Regenerate TypeScript Types
After running migrations, regenerate the type definitions:
```bash
export SUPABASE_PROJECT_ID=your-project-ref
npm run db:types
```

---

## Step 2 — Ready Player Me Setup

1. Go to [readyplayer.me/developers](https://readyplayer.me/developers)
2. Create a new application
3. Add your domain to the allowlist (e.g. `yourdomain.com`, `localhost`)
4. Copy your **subdomain** → `NEXT_PUBLIC_RPM_SUBDOMAIN`
5. Copy your **App ID** → `NEXT_PUBLIC_RPM_APP_ID`

---

## Step 3 — Vercel Deployment

### 3.1 Deploy
```bash
# Option A: Vercel CLI
npm install -g vercel
vercel --prod

# Option B: GitHub integration
# Push to main branch → Vercel auto-deploys
```

### 3.2 Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain-git-*.vercel.app` | Preview |
| `NEXT_PUBLIC_RPM_SUBDOMAIN` | `your-subdomain` | All |
| `NEXT_PUBLIC_RPM_APP_ID` | `your-app-id` | All |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | All |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Production, Preview |
| `APPLE_CLIENT_ID` | `com.yourdomain.app` | All |
| `APPLE_CLIENT_SECRET` | JWT token | Production, Preview |

### 3.3 Configure Supabase Auth Redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: 
  - `https://yourdomain.com/**`
  - `https://yourdomain-git-*.vercel.app/**` (for preview deployments)

---

## Step 4 — Post-Deploy Verification

### Health Check
```bash
curl https://yourdomain.com/api/health
# Expected: { "status": "ok", "checks": { "database": { "status": "ok" } } }
```

### Smoke Test Checklist
- [ ] `/login` loads correctly
- [ ] Google/Apple OAuth flow completes
- [ ] New user redirected to `/onboarding/1`
- [ ] Onboarding completes → redirects to `/dashboard`
- [ ] Dashboard shows ATLAS message, today's mission card
- [ ] Start Mission → Active workout timer runs
- [ ] Complete mission → XP award shows on completion screen
- [ ] `/nutrition` → calorie ring renders
- [ ] `/profile` → 3D avatar viewport loads
- [ ] `/ops` → rank ladder shows

---

## Step 5 — Add Exercise Data

The app ships with a mock workout (`OPERATION_THUNDER` in `src/lib/workout-engine.ts`). To use the real database:

### 5.1 Seed Exercise Library
Run the exercise seed SQL in Supabase SQL Editor:
```sql
INSERT INTO public.exercise_library (name, slug, category, muscle_groups, difficulty_tier, instructions)
VALUES
  ('Push-Up', 'push-up', 'push', ARRAY['Chest','Shoulders','Triceps'], 't2', 'Plank position, lower chest to floor, push up.'),
  ('Squat', 'squat', 'legs', ARRAY['Quads','Glutes','Hamstrings'], 't1', 'Feet shoulder-width, lower until thighs parallel.'),
  ('Plank', 'plank', 'core', ARRAY['Core','Shoulders'], 't1', 'Hold a push-up position, body in straight line.');
  -- Add more exercises...
```

### 5.2 Seed Workouts
```sql
INSERT INTO public.workouts (title, operation_name, week_number, day_number, difficulty, workout_type, xp_reward, estimated_calories)
VALUES ('Lower Body Power', 'Operation Thunder', 1, 1, 't1', 'legs', 100, 320);
```

### 5.3 Add Mixamo Animations (Avatar System)
1. Go to [mixamo.com](https://mixamo.com)
2. Search for each exercise animation (Squat, Push-up, Plank, Lunge, etc.)
3. Download as GLB, "In Place" checked, 30fps
4. Upload to Supabase Storage → `avatars/animations/` bucket
5. Update `src/lib/avatar-animations.ts` with the public URLs

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local
# Fill in .env.local with your Supabase keys

# Option A: Use remote Supabase project
npm run dev

# Option B: Use local Supabase (requires Docker)
npm run db:start   # Starts local Supabase
npm run dev        # Starts Next.js
npm run db:stop    # When done
```

---

## Architecture Notes

- **Auth guard**: `src/proxy.ts` — refreshes session and redirects on every request
- **App shell**: `src/app/(app)/layout.tsx` — fetches user profile, handles onboarding redirect
- **Database types**: `src/types/database.ts` — hand-written; regenerate with `npm run db:types` after schema changes
- **Workout engine**: `src/lib/workout-engine.ts` — Sacred Formula segment builder
- **Avatar**: Three.js + R3F loaded via `dynamic({ ssr: false })` — never runs on server
- **XP anti-cheat**: Server-side `award_session_xp()` PostgreSQL function validates session duration

---

*Operation 15 — Classified Reference · v0.1.0*
