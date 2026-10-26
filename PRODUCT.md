# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js 14 App Router + TypeScript — chosen for full-stack capability in a single deployment unit, strong PWA support, and Vercel/VPS compatibility. Tailwind CSS + shadcn/ui for UI. PostgreSQL + Prisma ORM for data. NextAuth.js v5 (Google OAuth) for auth. Recharts for charts. web-push (VAPID) for push notifications. next-pwa + Service Worker for offline support. Docker + Nginx for VPS deployment.

## Users

General adults who want to manage their daily life in one place: their task queue, household or personal spending, and personal goals. They carry a phone, open the app at the start of a day or week to plan, and return throughout the day to log transactions and update task status. No technical background required. They are currently scattered across at least three separate apps and feel the friction of switching contexts.

## Product Purpose

Pebble is a personal management web app that unifies task queue, financial recording, and goal setting in a single interface. It exists because managing daily actions, money, and long-term goals in separate tools creates context-switching friction and breaks the feedback loop between intent and outcome. Success means a user can open one tab, see where their time and money went, and understand whether it moved them toward their goals.

## Positioning

Pebble is the only personal productivity tool that connects what you do (queue), what you spend (finance), and what you are working toward (goals) — so every small daily action visibly moves you forward. Todoist, Money Manager, and habit-tracking apps each do one thing; Pebble makes the three visible as one system.

The "pebble" metaphor: small, consistent daily actions that create lasting ripples.

## Operating Context

- Opened daily: morning to plan tasks and review goals; evening to log spending and mark tasks done.
- Used on mobile browser (primary) and desktop browser (secondary).
- Installable as a PWA on Android and iOS home screen.
- Service worker caches only public Next.js static assets. Offline page reading, offline drafts, and automatic draft sync are not implemented yet.
- Multi-user: each user has an isolated data space (no shared workspaces in v1).
- Authenticated via Google OAuth — no password management.
- Push notifications used for task deadline reminders (browser permission required).
- Language: Bahasa Indonesia (UI, copy, error messages).

## Capabilities and Constraints

**Queue Kegiatan (Task Queue)**
- CRUD tasks with status: To Do / In Progress / Done
- Priority levels: Tinggi / Sedang / Rendah (High / Medium / Low)
- Deadline field + push notification reminder
- Sub-tasks (checklist within a task)

**Pencatatan Keuangan (Finance)**
- Record income and expense transactions with category and date
- User-defined income and expense categories per account; categories are ordinary items and can use a selected emoji
- Search and filter transactions by note, month, type, category, and wallet
- Monthly budgets with historical month navigation and over-budget alerts; previously recorded rollover amounts remain part of historical budget data
- Reconcile wallet transactions against a dated statement balance; reconciled transactions are locked against edits and deletion
- Finance summary period filter applies to the balance, income/expense totals, trend, expense-by-category chart, and transaction list: one date or an unrestricted date range, a Monday–Sunday week, a month, or a year
- Dashboard: running balance, expense-by-category chart, financial trend chart (Recharts)

**Penetapan Goal (Goal Setting)**
- Four goal types: numeric target (e.g., save Rp 5 million), daily habit, milestone with sub-deadlines, open-ended progress log
- Progress tracker: update numeric value, check habit, mark milestones
- Free-form progress notes per goal

**Constraints**
- v1 is single-user workspace only (no collaboration or sharing)
- No PDF/Excel export in v1
- No email notifications in v1 (push browser only)
- No dark mode in v1
- No payment gateway
- Domain not yet decided

## Brand Commitments

- **Name:** Pebble
- **Voice:** calm, clear, encouraging — never anxious or corporate. Indonesian. Speaks to the user like a thoughtful planner, not a task-master.
- **Visual direction:** clean and minimalist; white and grey base. Not yet detailed — visual world is established in new-work, not here.
- No existing logo, color palette, or typography committed yet.

## Evidence on Hand

- No existing visual implementation.
- No real user data, testimonials, or case studies yet.
- Product requirements captured from founder interview in this session.
- All copy and content must be created; nothing may be fabricated as real evidence.

## Product Principles

1. **One context, not three.** Tasks, money, and goals live together because they inform each other; splitting them is the problem Pebble solves.
2. **Small steps, visible progress.** Every micro-action (checking a task, logging Rp 15.000, updating a goal) should feel meaningful and immediately reflected.
3. **Calm by default.** The interface never nags, overwhelms, or shames. It presents information neutrally and lets the user lead.
4. **Mobile-first, device-agnostic.** The primary use scene is a phone; the desktop experience enhances but does not require a large screen.
5. **Data belongs to the user.** Each user's data is fully isolated. No algorithmic nudges, no data selling.

## Accessibility & Inclusion

No specific accessibility requirement stated beyond standard web best practices (keyboard navigation, sufficient color contrast, screen-reader compatible markup). WCAG 2.1 AA is the working target.
