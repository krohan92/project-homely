# Homely — PRD

## Original problem statement
"Build a really elite app called Homely for taking care of everything at home: appointments for kids, homework for school, dog appointments, vaccines, taking them out / poop schedule, grocery to-do list, budgets, and everything else — like doing dishes between partners, laundry, cleaning, mop etc. All in one spot."

User choices: all modules, no login (single household, testing), AI enabled for catch-up + insights, warm & cozy modern family-friendly dashboard.

## Architecture
- FastAPI backend (`/app/backend/server.py`): generic CRUD over 10 MongoDB collections (members, events, chores, homework, pets, petlogs, groceries, transactions, todos, maintenance) + `/api/insights/catchup` (Claude Sonnet 4.6 via EMERGENT_LLM_KEY) + `/api/seed`.
- React frontend: `Shell` sidebar layout, `useResource` optimistic CRUD hook, pages Dashboard / Calendar / Chores / Kids / Pets / Groceries / Budget / Upkeep.
- Theme system: 3 CSS-variable themes (dawn, dusk, meadow) persisted in localStorage.

## Personas
- Partner running the household day to day (primary).
- Second partner sharing chores fairly.
- Kids' homework and school life tracked by parents.

## Core requirements (static)
Shared appointments, chore split with fairness scoring, kids homework, pet care logging + vaccines, groceries by aisle, budget tracking, home upkeep/to-dos, AI daily catch-up.

## Implemented (2026-06)
- All 8 modules with full CRUD, demo household auto-seeded.
- AI daily catch-up with refresh.
- Dashboard hero with illustrated home art, time-of-day greeting, generated family avatars.
- 3 themes, paper texture, staggered/float animations, mobile responsive.
- QA iteration 1 fixes: seed route ordering, sage pill contrast, grid stretch, form resets.

## Backlog
- P0: multi-user login + real household sharing; push/email reminders for appointments and vaccines.
- P1: recurring chore auto-rotation between partners; meal planner feeding the grocery list; monthly budget limits with alerts.
- P2: shadcn date-picker replacing native date inputs; photo attachments; calendar month grid view.
