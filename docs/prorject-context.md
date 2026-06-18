> ## Project Context — Crowdsourced MCQ Aptitude Platform
>
> I am building a web application for my college where students can contribute MCQ-based aptitude questions and take mock tests for free without relying on any third-party paid platforms.
>
> ---
>
> ### What the app does
>
> - Any logged-in student can submit MCQ aptitude questions (4 options, 1 correct answer, optional explanation, category, difficulty, tags)
> - Any logged-in student can create a test by picking questions from the question bank
> - Any logged-in student can attempt any available test under a time limit
> - After submitting a test, students see their score, correct/wrong breakdown, and a full answer review
> - A leaderboard shows rankings per test
> - An admin can manage categories and promote users
>
> ---
>
> ### Tech Stack
>
> - **Frontend:** (your framework here — e.g. Next.js / React / Vue)
> - **Backend/Database:** Supabase (PostgreSQL + Auth + RLS)
> - **Auth:** Supabase Auth (email/password)
>
> ---
>
> ### Database Tables
>
> - `user` — id (uuid, mirrors auth.users), name, email, role (enum: `user` | `admin`)
> - `questions` — id, question (text), options (jsonb), answer (text), tags (text[]), category_id, contributer (uuid → user), difficulty
> - `AptitudeCategories` — id, name, slug
> - `tests` — id, title, time_limit (minutes), total_attempts, created_by (uuid → user)
> - `test_questions` — test_id, question_id, order_index
> - `attempts` — id, userId (uuid → user), test_id, score, started_at, submitted_at
> - `test_attempt_questions` — attempt_id, question_id, selected_answer, is_correct
>
> ---
>
> ### Roles & Permissions
>
> - **user (default):** Can contribute questions, create tests, attempt tests, view own attempts and contributed questions
> - **admin:** Everything a user can do + manage categories, delete any question or test, promote users to admin
> - No moderator role in this phase. All submitted questions are immediately available in the question bank.
>
> ---
>
> ### Pages
>
> | Route | Purpose |
> |---|---|
> | `/` | Landing page — hero, features, stats, CTA |
> | `/auth/login` | Login form |
> | `/auth/register` | Register form |
> | `/dashboard` | Post-login home — stats, quick actions, recent attempts, trending tests |
> | `/questions/contribute` | Form to submit a new MCQ question |
> | `/questions/my` | List of questions the user has contributed |
> | `/tests` | Browse and search all available tests |
> | `/tests/create` | Create a test by selecting questions from the bank |
> | `/tests/:id` | Test detail — info, leaderboard snippet, start button |
> | `/tests/:id/attempt` | Live test-taking interface with timer |
> | `/tests/:id/result/:attemptId` | Score, stats, full answer review |
> | `/leaderboard/:testId` | Full leaderboard for a test |
> | `/admin` | Admin panel — stats, category management, user management |
> | `/profile` | View and edit personal profile, contribution and attempt history |
>
> ---
>
> ### Design Expectations
>
> - Clean, modern, student-friendly UI — think academic but not boring
> - Mobile responsive — students will use this on phones
> - Use a consistent color palette — suggest a primary accent color (blue or indigo works well for academic tools)
> - The test-taking page (`/tests/:id/attempt`) must feel focused and distraction-free — minimal navbar, prominent timer, clear question layout
> - The result page should feel rewarding — big score display, clear correct/wrong indicators
> - Dashboard should give a quick visual summary — use cards and minimal charts if needed
> - Empty states should be friendly with an illustration or icon and a CTA
> - Use toast notifications for all form feedback (success and errors)
> - Confirm modals for destructive or irreversible actions (test submission, question deletion)
>
> ---
>
> ### Key UX Constraints
>
> - Once a test is submitted, answers cannot be changed — enforce this at the UI level (disable back navigation on attempt page)
> - Timer auto-submits the test when it reaches zero
> - A student can attempt the same test multiple times — always show their last score on the test detail page
> - Questions in the bank are immediately usable after submission (no approval queue in this phase)