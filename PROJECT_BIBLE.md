# thecoolnerd: Project Bible

Last updated: 2026-11-15. This is the single reference for what the app is, how it works, what was decided, and what is next.

---

## 1. Vision

A Duolingo-style study app for kids. Maths comes first. Kids learn through short, fun practice sets.

- **Levels:** Pre-Nursery to Class 12, following Indian boards (CBSE/NCERT flavour).
- **Platforms:** web, Android and iOS from one codebase (Capacitor).
- **Launch subjects:** Maths, Science, English, Computer Science. World Geography comes later. The UI is English only for now.
- **Backend:** Supabase and Vercel later. Dummy local data for now.
- **Core idea:** the user never chooses a subject. Each day there are small mixed practice sets that revise past and current chapters, like Duolingo's constant revision. The class is chosen in Profile, and the path is built from it.

## 2. Tabs

Home, Library, Friends, Profile (icon-only in the bar, with aria-labels).

- **Home:** the daily practice card, then the chapter path with sticky chapter banners.
- **Library:** subject chips (only Maths is active) and the chapter list with progress.
- **Friends:** dummy leaderboard (Aarav, Diya, Kabir plus you).
- **Profile:** class picker, streak, total XP, lessons done, reset progress.

## 3. Game rules

### Lessons
- 10 questions per lesson. Wrong answers are requeued to the end.
- 5 lessons per chapter. The last lesson (step 4) is a **review** that mixes in earlier chapters, with a +4 boost on the current one.
- Chapters unlock in order. A chapter opens when the previous one has 5 lessons done.
- 5 hearts per lesson. They are local to the lesson for now, and running out ends the lesson.
- Count-up timer (wall-clock). A combo label ("COMBO xN") shows from 3 first-try answers in a row.

### Stars
Based on first-try correct answers out of 10:
- 10 correct = 3 stars
- 6 or more = 2 stars
- 1 or more = 1 star

### XP
- **Time XP** = `max(0, 100 − floor(seconds/60))`. It is paid **once** per lesson, on the first completion.
- **Star XP** = 10 per star.
- On a repeat, time XP stays unchanged. Only a star upgrade pays the difference.
- Each lesson stores `{xp, stars}`. **Total XP is derived:** `Σ(xp + 10·stars)`.

### Daily practice
- 3 sets per day, ids `daily:YYYY-MM-DD:n`. Each set has its own stars.
- Star XP only, no time XP.
- After all 3 are perfect, a bonus set is offered that pays 0 XP.
- Questions come from chapters the user has started.

### Revision weighting
`makeMix` weights each chapter by days since last practiced: `1 + min(7, days)`. A chapter never practiced counts as 8.

### Streak
- Increments on the first finished lesson or set each day.
- Displays 0 if the last day was neither today nor yesterday.
- A streak celebration screen shows after the day's first lesson.

## 4. Difficulty and content

- Class indices: 0 Pre-Nursery, 1 Nursery, 2 LKG, 3 UKG, 4 to 15 = Class 1 to 12.
- Difficulty scale: `s = 1 + cls*0.8 + step*0.4`.
- 3 to 5 chapters per age band (class index ≤1, ≤3, ≤5, ≤8, ≤11, ≤13, higher).
- Questions are **procedural generators** (no hand-written data): count, compare, shapes, pattern, add, sub, mul, div, fraction, percent, area, roots, linear, quadratic, ap, pythagoras, trig, derivative, probability.
- Every question is `{prompt, visual?, options?, answer}`. A test asserts for every generator, at s = 1, 3, …, 15 and 50 runs each: the options contain the answer, there are no duplicates, and nothing is NaN, undefined or Infinity.

## 5. Visual design

- **Direction:** the default Duolingo look. The user tried papercut and comic themes, then preferred the default. Both were reverted.
- **Themes:** light default, plus a dark theme that follows the phone setting (`prefers-color-scheme`). Tokens are CSS custom properties.
- **Animations:** pop, slideUp, shake, bob, ring, flicker. `prefers-reduced-motion` disables all of them.
- **Details copied from the Duolingo recording:** sticky chapter banners, a START bubble that bobs over the current node with a pulsing ring, a glossy progress bar, a feedback sheet that slides up, an end screen with XP, STARS and TIME boxes, and the streak flame screen.
- **Font:** Nunito from Google Fonts.

## 6. Tech stack

- Vite, React, TypeScript, Vitest.
- Capacitor (`@capacitor/core`, `android`, `ios`, `cli`), appId `com.thecoolnerd.app`, name "The Cool Nerd", webDir `dist`.
- State in `localStorage` (key `thecoolnerd-v1`). `src/store.ts` is the swap point for Supabase.
- Scripts: `npm run sync` (build plus `cap sync`), `npm run android`, `npm run ios`. iOS builds need a Mac with Xcode.

## 7. File map

| File | Role |
|---|---|
| `src/App.tsx` | Tabs, home path, daily card, streak screen, library, friends, profile |
| `src/Lesson.tsx` | Lesson player: timer, hearts, combo, feedback, end screens |
| `src/questions.ts` | Generators `GENS`, `makeLesson`, `makeMix` |
| `src/questions.test.ts` | Generator safety tests |
| `src/data.ts` | `CLASSES`, `SUBJECTS`, `chaptersFor`, `LESSONS_PER_CHAPTER`, `scale` |
| `src/xp.ts` / `xp.test.ts` | Stars and XP logic and its 5 tests |
| `src/store.ts` | State, `finish()`, streak, localStorage |
| `src/index.css` | All styles, tokens, dark theme, keyframes |
| `capacitor.config.ts`, `android/`, `ios/` | Native shells (generated) |
| `.claude/launch.json` | Dev server config for the preview |
| `.impeccable/config.json` | Design-hook suppressions for `src/index.css` |

## 8. Decisions log

- Procedural questions instead of hand-written ones, so every class has content.
- Per-lesson `{xp, stars}` with derived totals, so star upgrades never drift.
- Daily sets pay star XP only, so they can't be farmed for speed XP.
- Default Duolingo look kept. Papercut and comic themes dropped.
- Launch subjects: Maths, Science, English, Computer Science. Geography later.
- Language: English only for now.

## 9. Database design (advice, not yet built)

**Goal:** stay small as users, subjects and leagues grow.

- **Content** (chapters, lessons, questions): a read-only table shared by everyone.
- **Progress:** one row per `(user_id, chapter_id)` with `stars[5]`, `time_xp[5]` and `updated_at`. This is about 5 times fewer rows than per-lesson. `chapter_id` already implies the subject.
- **Per-subject totals:** one small row per `(user_id, subject_id)`.
- **Daily sets:** keep only the last 1 to 2 weeks. Roll each day's XP into totals and the weekly league score.
- **Leagues:** weekly `league_members` rows.
- **Friends:** a friends table.
- **Hearts:** lazy regeneration, computed on read. Rewarded-ad refills must be verified server-side.
- **XP:** compute on the server (a Supabase function), because client-side XP is cheatable once leagues exist.
- **Avoid:** one big JSON blob per user. It can't be queried for leagues.
- A user only touches their own class, so about 20 rows per user per year. Don't split across servers until there are tens of millions of users.

## 10. Risks and open issues

- **Kids' privacy and ads:** COPPA, Google Families and Apple Kids rules restrict ads. Friends and leagues need nicknames only, no chat, and parent approval.
- Hearts are per-lesson, not global.
- No real backend or ad integration exists.
- The timer uses wall-clock time, so a backgrounded app keeps counting.
- Animation timings were guessed from still frames of the recording.
- Fonts load from Google Fonts, so there is no offline font.
- Old localStorage keys `xp`, `daily` and `dailyXp` are ignored.
- Not yet run on a real Android or iOS device.
- **Git:** only the initial commit exists. Current work is uncommitted, and the GitHub remote has not been set up.
- The START bubble spacing (path gap 34px) was not re-checked visually.

## 11. Open offers (waiting on the user)

1. Make hearts global, with a simulated "watch ad" button so the logic is ready for a real ad network.
2. Reshape local data to the per-chapter row design, so the Supabase move is only a storage swap. This was my recommendation.

## 12. Roadmap

1. Commit the current work, then connect GitHub and Vercel.
2. Chapter-row data shape (offer 2).
3. Global hearts (offer 1).
4. Science, English and CS content, plus a curriculum tag on chapters.
5. Supabase: auth, progress, server-side XP.
6. Leagues and friends, with child-safety rules.
7. Rewarded ads, once the child-safety rules are settled.
8. Test on real Android and iOS devices.

## 13. Proposed product direction (not yet built)

Today a chapter is 5 lessons of 10 generated questions (`LESSONS_PER_CHAPTER` in `src/data.ts`), with no weak-topic tracking.

| Area | Decision |
|------|----------|
| Chapter size | Approximately 25-30 activities |
| New learning | 5-7 activities |
| Practice | 12-16 activities |
| Mixed revision | 3-4 activities |
| Chapter test | 1 final test |
| Daily revision | Every day |
| Previous chapters | Continue appearing in practice |
| Weak topics | Automatically prioritised |
| Syllabus completion | Target 8-9 months |
| Final months | Dedicated exam preparation |
