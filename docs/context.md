# MockTest Platform — UI/UX Context for Frontend Development

---

## Project Overview

A free, open-source mock test platform where students can practice aptitude questions
from a curated question bank. Users create custom tests, attempt them in a timed
environment, and review detailed performance analytics.

---

## Pages & Routes

| Route | Page |
|---|---|
| `/` | Landing Page |
| `/signin` | Sign In |
| `/signup` | Sign Up |
| `/dashboard` | Dashboard |
| `/tests` | All Tests (past attempts) |
| `/tests/:attemptId` | Attempt Detail |
| `/tests/:attemptId/questions` | Questions Review |
| `/create-test` | Create Test Form |
| `/test/:testId/session` | Test Environment (live) |
| `/test/:testId/submitting` | Submission Loading Screen |
| `/test/:testId/report` | Test Report |

---

## 1. Navbar

**Present on:** all pages except the active test session and submission loader.

### Logged-Out State
- Logo / brand name on the left.
- `Sign In` and `Sign Up` buttons on the right.

### Logged-In State
- Logo on the left.
- Navigation links: `Dashboard`, `Tests`, `Create Test`.
- Right side: user avatar with a dropdown containing `Profile` and `Sign Out`.

### Behavior
- Sticky at the top.
- On mobile: hamburger menu that slides open a drawer with the same links.

---

## 2. Landing Page (`/`)

### Navbar
Logged-out state by default; switches to logged-in state if session exists.

### Hero Section
- Large headline describing what the platform does.
- One-line subheadline with the value proposition (free, open-source, aptitude-focused).
- Two CTAs side by side: a primary **Get Started** button (goes to `/signup`) and a
  secondary **Browse Questions** or **Learn More** button that scrolls down.
- A visual element to the right — an illustration or a mock screenshot of the test UI.

### Features Section
Three or four feature cards in a row:
- Question Bank — large collection across categories and subcategories.
- Custom Tests — pick duration, sections, and question count.
- Instant Analytics — score, accuracy, time analysis after every test.
- Completely Free — open-source, no paywalls.

### How It Works Section
Three steps shown horizontally with icons and short descriptions:
1. Sign up.
2. Create a custom test.
3. Attempt and review.

### Footer
- Links: GitHub, About, Contact.
- Short copyright line.

---

## 3. Sign In Page (`/signin`)

Single centered card, vertically centered on the page.

### Card Contents
- App logo at the top.
- Page title: **Welcome back**.
- Google OAuth button — full-width, with Google icon.
- A divider line with the word **or**.
- Email input field.
- Password input field with a show/hide toggle.
- **Sign In** button — full-width, primary.
- Forgot password link below the button.
- Footer line: *Don't have an account?* → link to `/signup`.

### Behavior
- Inline validation errors below each field.
- Button shows a spinner while the request is in flight.
- On success, redirect to `/dashboard`.

---

## 4. Sign Up Page (`/signup`)

Same layout as Sign In.

### Card Contents
- App logo.
- Page title: **Create your account**.
- Google OAuth button — full-width.
- Divider.
- Name input.
- Email input.
- Password input with strength indicator (weak / medium / strong).
- Confirm password input.
- **Sign Up** button — full-width, primary.
- Footer line: *Already have an account?* → link to `/signin`.

### Behavior
- Same inline validation pattern as Sign In.
- On success, redirect to `/dashboard`.

---

## 5. Dashboard (`/dashboard`)

### Layout
Two-column layout on desktop (sidebar left, content right). Single column on mobile.

### Left Sidebar (or top section on mobile)
- User avatar and name.
- Quick nav links: Overview, Tests, Create Test.

### Main Content

#### Stats Row
Four metric cards in a row:
- Total Tests Attempted.
- Average Score (percentage).
- Best Score.
- Total Questions Answered.

Each card shows a number, a label, and a small trend indicator (up/down arrow with
percentage change vs last week or last 5 tests).

#### Score Over Time Chart
A line chart showing score percentage across the last N attempts in chronological order.
X-axis: attempt date. Y-axis: score percentage. A horizontal dashed line showing the
average.

#### Recent Tests Table
A table or card list showing the 5 most recent attempts.

Columns: Test Title, Date, Score, Total Questions, Time Taken, Status (Submitted /
Expired), and a **View** link.

Clicking a row or the View link navigates to `/tests/:attemptId`.

#### Category Breakdown (optional)
A bar chart or donut chart showing accuracy per category (e.g. Quantitative: 72%,
Logical: 58%, Verbal: 81%).

---

## 6. All Tests Page (`/tests`)

A searchable, filterable list of all past attempts.

### Controls (top bar)
- Search input by test title.
- Filter dropdown: All / Submitted / Expired.
- Sort: Newest first / Oldest first / Highest score / Lowest score.

### List
Each item is a card with:
- Test title.
- Date and time of attempt.
- Score badge (colored by performance: green ≥ 70%, yellow 40–69%, red < 40%).
- Total questions and time taken.
- **View Details** button.

Pagination or infinite scroll at the bottom.

---

## 7. Attempt Detail Page (`/tests/:attemptId`)

### Header
- Test title and subtitle (category / subcategory).
- Submitted at timestamp.
- Back button to `/tests`.

### Stats Row
Four cards:
- Score (raw: e.g. 34 / 50).
- Accuracy percentage.
- Correct / Incorrect / Skipped counts.
- Time taken.

### Score Breakdown Section
A horizontal bar or segmented bar showing the proportion of correct, incorrect, and
skipped answers visually.

### Section-wise Breakdown (if test had sections)
A small table: Section Name | Questions | Correct | Accuracy.

### Action Button
A prominent **View All Questions** button at the bottom. Navigates to
`/tests/:attemptId/questions`.

---

## 8. Questions Review Page (`/tests/:attemptId/questions`)

Shows every question from the attempt with the user's answer highlighted and the correct
answer indicated.

### Layout
Vertical list of question cards.

### Each Question Card
- Question number and the question text.
- Four option rows (A, B, C, D). Each row is styled:
  - Correct answer: green background.
  - User's wrong answer (if applicable): red background.
  - Unselected options: neutral.
- A status badge: Correct / Incorrect / Skipped.
- An expandable **Explanation** section (accordion) that reveals the explanation text
  when clicked, if an explanation exists.

### Top Bar
- Back button to `/tests/:attemptId`.
- A filter row: All / Correct / Incorrect / Skipped — filters the question list live.

---

## 9. Create Test Page (`/create-test`)

A single-page form (no multi-step wizard needed).

### Form Fields

**Test Title** — text input.

**Sections** — a tag/chip input. The user types a section name and presses Enter to add
it as a chip. Each chip has an × to remove it. (These map to the `sections TEXT[]` column.)

**Categories & Subcategories** — a multi-select grouped dropdown or a checkbox tree.
The user selects which subcategories to pull questions from.

**Total Questions** — number input.

**Duration** — number input in minutes.

**Marks per Correct Answer** — number input (decimal allowed).

**Negative Marks per Wrong Answer** — number input (decimal allowed, default 0).

**Total Score** — auto-calculated and displayed read-only as the user fills in the above
fields (`total_questions × correct_mark`).

### Bottom Actions
- **Create Test** — primary button. Submits the form. On success, redirects to
  `/test/:testId/session` to immediately begin the test, or optionally to a confirmation
  screen that lets the user start later.
- **Cancel** — secondary button. Goes back.

### Validation
- All fields except negative marks are required.
- Duration must be at least 1 minute.
- Total questions must be at least 1.

---

## 10. Test Environment (`/test/:testId/session`)

This is the most critical UX surface. Keep it distraction-free.

### Layout
No main navbar. A minimal top bar only.

### Top Bar
- Test title on the left.
- Countdown timer in the center — large, bold. Turns amber when ≤ 5 minutes remain,
  red when ≤ 1 minute. Pulses slightly when red.
- **Submit Test** button on the right — requires a confirmation dialog before submitting.

### Main Area (two-column on desktop)

#### Left Panel — Question Palette
A grid of numbered buttons, one per question. Each button's color encodes status:
- Default (neutral): not visited.
- Outlined / accent: visited but not answered.
- Filled / primary: answered.
- Distinct color (e.g. amber): marked for review.

Clicking a button jumps to that question.

#### Right Panel — Active Question
- Question number and total (e.g. "Question 12 of 40").
- Question text (may be multi-line).
- Four option rows as radio button cards. Clicking selects the option and highlights that
  row.

**Below the options:**
- **Mark for Review** toggle button — marks the question in the palette without deselecting
  the answer.
- **Clear Response** link — deselects the current answer.

**Navigation buttons at the bottom right:**
- **Previous** — goes to previous question.
- **Next** — goes to next question. On the last question, Next becomes **Submit**.

### Auto-Submit
When the timer reaches zero, the test is automatically submitted without user interaction.
Show a brief "Time's up — submitting…" toast before redirecting to the submission loader.

### Persistence
Save the current answers to local storage on every answer change so that a page refresh
during the session does not lose progress (session recovery on reload).

---

## 11. Submission Loading Screen (`/test/:testId/submitting`)

A full-screen centered view. No navbar.

### Contents
- A loading spinner or animated progress bar.
- A heading: **Reviewing your answers…**
- A short supportive subline: *Hang tight while we calculate your results.*
- The screen stays for a minimum of 2 seconds (even if the API responds faster) to feel
  deliberate rather than instant.
- On completion, auto-redirect to `/test/:testId/report`.

---

## 12. Test Report Page (`/test/:testId/report`)

The results screen shown after submission.

### Header
- Test title.
- Submitted at timestamp.

### Score Hero
A large circular progress ring showing the score percentage in the center. Below it:
raw score (e.g. 34 / 50) and percentage.

### Stats Row (4 cards)
- Correct answers.
- Incorrect answers.
- Skipped questions.
- Time taken.

### Marks Breakdown
A small table:

| | Count | Marks |
|---|---|---|
| Correct | N | +X |
| Incorrect | N | −X |
| Skipped | N | 0 |
| **Total** | | **Score** |

### Performance Message
A short contextual message based on score:
- ≥ 80%: Great job! Strong performance.
- 60–79%: Good effort. Review the incorrect questions.
- < 60%: Keep practicing. Check the explanations.

### Actions (two buttons)
- **View Questions** — navigates to `/tests/:attemptId/questions`.
- **Go to Dashboard** — navigates to `/dashboard`.

---

## General UX Principles

**Loading states** — every data-fetching action (page load, form submit, test submit)
shows a skeleton loader or spinner. Never a blank screen.

**Empty states** — if there are no past tests, show an illustration and a prompt to
create the first test.

**Error states** — network errors show a retry button with a brief error message.

**Responsiveness** — all pages must work on mobile. The test environment collapses the
question palette into a collapsible bottom drawer on mobile.

**Accessibility** — sufficient color contrast on all interactive elements, keyboard
navigation for the test environment (arrow keys to move between options, N/P for
next/previous question).

**Transitions** — subtle fade or slide transitions between questions in the test
environment. Avoid heavy animations that slow interaction.

**Confirmation dialogs** — submitting a test and signing out both require a confirmation
dialog to prevent accidental actions.

---

## Component Checklist

- [ ] Navbar (logged-in / logged-out variants)
- [ ] Auth card (shared layout for Sign In and Sign Up)
- [ ] Metric card (stat + trend)
- [ ] Line chart (score over time)
- [ ] Bar / donut chart (category breakdown)
- [ ] Attempt list card
- [ ] Question card (with colored options and explanation accordion)
- [ ] Question palette grid (test environment)
- [ ] Option radio card (test environment)
- [ ] Countdown timer
- [ ] Circular progress ring (report)
- [ ] Tag/chip input (create test form)
- [ ] Confirmation dialog
- [ ] Skeleton loaders
- [ ] Empty state component
- [ ] Toast / snackbar notifications