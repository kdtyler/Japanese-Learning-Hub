# Copilot Instructions for Japanese Learning Hub

## Purpose

This project is a personal Japanese learning dashboard that aggregates progress from language apps, tracks vocabulary, estimates completion timelines, and generates Anki cards.

## Primary Stack

- Backend: Java (Spring Boot preferred)
- Frontend: Next.js (React-based)
- Database: SQLite for local development, with PostgreSQL migration possible later

## Current Project Scope

- Start with Duolingo integration first, then add WaniKani.
- Support a single user initially, but keep the data model and backend architecture ready for multi-user support later.
- Persist imported app progress and vocabulary in a database.
- Track historical snapshots over time to show trends.
- Provide a timeline dashboard showing current apps and future planned apps on a 0–10 year view.
- Provide an Anki generation workflow that creates cards only for new vocabulary that has not yet been generated.

## Key Features

- App API data import and normalization
- Manual refresh/update operations in the UI
- Estimated time-to-completion per app using app-specific metrics
- Vocabulary overlap and source analysis
- Anki card generation and duplicate prevention
- Timeline planning with current and future app milestones
- Historical progress snapshots and trend visualization

## Architecture Guidance

- Use a RESTful Java backend with clear separation of concerns:
  - API integration layer
  - business/service logic
  - persistence layer
  - web/API controllers
- Use Next.js for frontend routing, pages, and dashboard UI.
- Keep the backend database-agnostic enough to switch between SQLite and PostgreSQL.
- Store `user_id` in relevant tables from the start, even for a single-user version.

## Recommendations for AI Agents

- Reference `ProjectOverview.md` as the authoritative project description.
- Prioritize Duolingo integration first, then WaniKani.
- Keep early implementation lightweight and local-first.
- Do not diverge from the agreed stack without checking first.
- Ask for clarification only if a task cannot be completed based on the available project description.

## Useful Files

- `ProjectOverview.md` — high-level project definition and architecture
- `BasicProjectDescription.txt` — original user-written requirements

## Notes

- The user prefers Java for backend development.
- The frontend should be built with Next.js rather than plain React for easier routing and page structure.
- The database should begin as SQLite for free local persistence.
- Future multi-user and cloud deployment are desired but not required for the first version.
- Keep the project scope controlled: build a polished MVP before adding extra integrations.
- Include a strong `README.md`, architecture documentation, and a simple local startup path.
- Add tests for backend and frontend components to show code quality.
- Use environment variables for configuration and do not store secrets in source control.
