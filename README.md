# Japanese Learning Hub

A personal Japanese learning dashboard that aggregates progress from multiple study apps, tracks vocabulary overlap, estimates completion timelines, and generates Anki cards.

## Why this project exists

This tool is designed to help a single user synthesize data from apps like Duolingo and WaniKani, visualize progress over time, and turn learned vocabulary into Anki cards. It is built as a local-first project with a clear path to future multi-user support.

## Current goals

- Import progress data from Duolingo first, then add WaniKani
- Store app progress and vocabulary in a persistent database
- Show estimated time-to-completion for each app
- Track vocabulary learned across apps and visualize overlaps
- Generate new Anki cards only for vocabulary that has not yet been generated
- Persist historical snapshots to show trends over time
- Keep the architecture clean and recruiter-friendly

## Tech stack

- Backend: Java with Spring Boot
- Frontend: Next.js
- Database: SQLite for local development, with PostgreSQL as a future upgrade path

## Prerequisites

- Java JDK 17 or later
- Maven
- Node.js 18+ and npm
- VS Code extensions (recommended):
  - Java Extension Pack
  - Spring Boot Extension Pack
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense (if using Tailwind later)

## Local startup

- Backend: `cd backend && mvn spring-boot:run`
- Frontend: `cd frontend && npm install && npm run dev`

## Project structure

- `ProjectOverview.md` — authoritative project definition and architecture guidance
- `.github/copilot-instructions.md` — AI assistant guidance for building the project
- `BasicProjectDescription.txt` — original user requirements notes

## What to expect

This repo is intended to remain a focused, polished personal project. The first version should include:

- basic Duolingo integration
- persistent import of app progress
- a timeline dashboard
- vocabulary tracking
- a button to generate Anki cards for new vocabulary

## Development principles

- Keep the scope controlled and build a working MVP first
- Use clear separation between controllers, services, and persistence
- Store config in environment variables, not in source control
- Add tests for core backend logic and frontend components
- Keep local setup easy to run

## Next steps

1. add Java backend scaffolding with Spring Boot
2. add SQLite persistence and a simple data model
3. add Duolingo import logic and snapshot persistence
4. add a Next.js frontend with dashboard pages
5. add vocabulary tracking and Anki generation support
6. add historical trend charts and timeline planning

## Notes

- The project is personal but should remain structured enough to look professional on GitHub.
- The current priority is working functionality rather than adding too many features.
- Future improvements may include PostgreSQL migration, multi-user support, and hosted deployment.
