# UI Plan — Crowdsourced MCQ Aptitude Platform

---

## Page Structure Overview

```
/                        → Landing Page
/auth/login              → Login
/auth/register           → Register
/dashboard               → Dashboard (home after login)
/questions/contribute    → Contribute a Question
/questions/my            → My Contributed Questions
/tests                   → Browse Tests
/tests/create            → Create a Test
/tests/:id               → Test Detail
/tests/:id/attempt       → Attempt Test (live)
/tests/:id/result/:aid   → Result & Review
/leaderboard/:testId     → Leaderboard
/admin                   → Admin Dashboard
/profile                 → User Profile
```

---

## 1. Landing Page `/`

**Purpose:** Introduce the platform to new visitors, drive signups.

| Section | UI Elements |
|---|---|
| Hero | Headline, subheadline, CTA buttons (Get Started, Login) |
| Features | 3-column icon cards (Contribute, Practice, Free) |
| Stats | Counter badges (Total Questions, Tests, Students) |
| Footer | Links (About, Contact, Privacy) |

---

## 2. Login `/auth/login`

**Purpose:** Authenticate existing users.

| Element | Details |
|---|---|
| Email input | Text field with validation |
| Password input | Password field with show/hide toggle |
| Submit button | "Login" primary button |
| Redirect link | "Don't have an account? Register" |
| Error state | Inline error message below form |

---

## 3. Register `/auth/register`

**Purpose:** Sign up new students.

| Element | Details |
|---|---|
| Name input | Text field |
| Email input | Text field with validation |
| Password input | Password with strength indicator |
| Confirm password | Match validation |
| Submit button | "Create Account" primary button |
| Redirect link | "Already have an account? Login" |

---

## 4. Dashboard `/dashboard`

**Purpose:** Central hub after login — quick access to everything.

| Section | UI Elements |
|---|---|
| Welcome banner | Greeting with user name, avatar |
| Stats row | Cards — Questions Contributed, Tests Taken, Avg Score |
| Quick actions | Buttons — Contribute Question, Browse Tests, Create Test |
| Recent attempts | Table — Test Name, Score, Date, Review button |
| Trending tests | Horizontal scroll cards — Test name, attempts count, category tag |

---

## 5. Contribute a Question `/questions/contribute`

**Purpose:** Let any student submit an MCQ question.

| Element | Details |
|---|---|
| Category dropdown | Select from AptitudeCategories |
| Difficulty select | Easy / Medium / Hard (radio or segmented control) |
| Tags input | Multi-tag input (chip-style) |
| Question textarea | Plain textarea |
| Option A–D inputs | 4 text inputs labeled A, B, C, D |
| Correct answer select | Radio group — pick A, B, C, or D |
| Explanation textarea | Optional explanation for the answer |
| Submit button | "Submit Question" |
| Success state | Toast notification + redirect to My Questions |

---

## 6. My Contributed Questions `/questions/my`

**Purpose:** View all questions the user has submitted.

| Element | Details |
|---|---|
| Questions list | Card per question — question preview, category tag, difficulty badge |
| Edit button | Edit any of their own questions |
| Delete button | Delete their own question |
| Empty state | Illustration + "Contribute your first question" CTA |

---

## 7. Browse Tests `/tests`

**Purpose:** Discover and join available tests.

| Element | Details |
|---|---|
| Search bar | Filter by test title |
| Category filter | Dropdown or pill filters by AptitudeCategories |
| Sort by | Newest / Most Attempted |
| Test cards grid | Title, category tag, question count, time limit, attempt count, Start button |
| Create test button | Floating action button or top-right button |
| Empty state | Message when no tests match filter |

---

## 8. Create a Test `/tests/create`

**Purpose:** Let any student compose a test from available questions.

| Element | Details |
|---|---|
| Test title input | Text field |
| Time limit input | Number input (minutes) |
| Category filter | Filter question bank by category |
| Question search | Search questions by keyword or tag |
| Question bank list | Paginated list — checkbox to add to test |
| Selected questions panel | Sidebar showing added questions with remove option and drag to reorder |
| Question count badge | Live count of selected questions |
| Submit button | "Create Test" — disabled until at least 1 question selected |

---

## 9. Test Detail `/tests/:id`

**Purpose:** Show test info before the student starts attempting.

| Element | Details |
|---|---|
| Test title | Heading + metadata |
| Info row | Question count, time limit, total attempts, category |
| Leaderboard snippet | Top 3 scorers with scores |
| Start button | "Start Test" CTA — prominent |
| Past attempt banner | If already attempted — show last score + Review / Reattempt buttons |

---

## 10. Attempt Test `/tests/:id/attempt`

**Purpose:** The live test-taking interface.

| Element | Details |
|---|---|
| Header | Test title, countdown timer (red when < 2 min), question progress (3/10) |
| Question card | Question number, question text, 4 option radio buttons (A–D) |
| Navigation | Previous / Next buttons, question number grid (jump to any question) |
| Question status indicators | In grid — unanswered (grey), answered (blue), flagged (yellow) |
| Flag button | Mark question for review |
| Submit button | Confirm modal before final submission |
| Auto-submit | Triggers when timer hits zero |

> ⚠️ No back navigation once test is submitted. Disable browser back button behavior.

---

## 11. Result & Review `/tests/:id/result/:attemptId`

**Purpose:** Show score and let the student review answers.

| Element | Details |
|---|---|
| Score card | Big score display, percentage, pass/fail indicator |
| Stats row | Correct count, wrong count, unanswered count |
| Time taken | How long the student took vs. time limit |
| Review list | Each question — student's answer (green if correct, red if wrong), correct answer highlighted, explanation shown |
| CTA buttons | Reattempt Test, Back to Tests |

---

## 12. Leaderboard `/leaderboard/:testId`

**Purpose:** Show rankings for a specific test.

| Element | Details |
|---|---|
| Test title header | With category and attempt count |
| Rank table | Rank, Avatar, Name, Score, Time Taken, Date |
| Current user row | Highlighted row for logged-in user |
| Podium (top 3) | Visual podium for 1st, 2nd, 3rd place |
| Pagination | Load more or paginated |

---

## 13. Admin Dashboard `/admin`

**Purpose:** Overview for admin to manage the platform.

| Section | UI Elements |
|---|---|
| Stats cards | Total questions, total tests, total users, total attempts |
| Recent activity feed | Latest question submissions, new registrations |
| Manage categories button | Link to add/edit/delete AptitudeCategories |
| User list | Table of users with role badge, option to promote to admin |

---

## 14. User Profile `/profile`

**Purpose:** View and edit personal info and activity summary.

| Element | Details |
|---|---|
| Avatar | Upload/change profile picture |
| Name & email | Editable fields with Save button |
| Stats summary | Questions contributed, tests taken, best score |
| Contribution history | Table of submitted questions |
| Attempt history | Table of test attempts with score and date |

---

## Shared / Global UI Elements

| Component | Used On |
|---|---|
| Navbar | All authenticated pages — logo, nav links, avatar dropdown (Profile, Logout) |
| Toast notifications | Success/error feedback across all forms |
| Loading skeleton | Cards and lists while data fetches |
| Empty state | Any list/grid with no data |
| Confirm modal | Destructive actions (submit test, delete question) |
| Category pill/tag | Questions and test cards throughout |

---

## Role-Based UI Differences

| Element | User | Admin |
|---|---|---|
| Admin dashboard link | Hidden | Visible in navbar |
| Delete any question/test | Hidden | Visible |
| Manage categories | Hidden | Visible |
| Promote user role | Hidden | Visible in admin dashboard |