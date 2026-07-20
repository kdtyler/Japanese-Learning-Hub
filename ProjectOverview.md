# Japanese Learning Hub

## Purpose

Japanese Learning Hub is a personal learning dashboard designed to aggregate progress data from multiple Japanese study apps, normalize that data, and present a unified view of my progress, vocabulary knowledge, timeline estimates, and Anki card generation.

This project is intended as a Java-backed, full-stack personal tool that can be extended later into a multi-user application if desired.

## Key Goals

- Consolidate progress from multiple Japanese learning apps into one central dashboard
- Calculate progress metrics and estimated time-to-completion for each app
- Track vocabulary learned across apps and visualize overlaps
- Generate Anki cards automatically from learned vocabulary
- Save historical snapshots to show trends over time
- Make the architecture future-proof for eventual multi-user support

## Target Features

1. **App Data Aggregation**
   - Start with Duolingo as the first app integration, then add WaniKani.
   - Import progress from app APIs and normalize it into a common model.
   - Store the imported data in a persistent database.
   - Allow manual refresh/update buttons in the UI to pull the latest data.

2. **Estimated Time-to-Completion**
   - Compute an estimated completion timeline for each connected app.
   - Use available user-progress data from each app’s API.
   - Present the estimate in a clear way, acknowledging that each app has unique metrics.

3. **Vocabulary Tracking and Visualization**
   - Collect learned vocabulary items from each connected app.
   - Track which words are learned in which apps.
   - Visualize overlaps, unique words per app, and overall vocabulary coverage.

4. **Anki Card Generation**
   - Use collected vocabulary data to generate Anki card content.
   - Provide a UI action such as a "Generate new Anki Cards" button that creates cards only for vocabulary that has not yet been generated.
   - Support either direct integration with Anki or export-ready output for manual import.
   - Maintain a mapping between learned words and generated cards to avoid duplicates.

5. **Progress Hub and Timeline**

   - Display a central dashboard with progress metrics, app speed, and timeline projections.
   - Show app timelines as bars on a multi-year view, where current apps appear first and future planned tools appear later.
   - Use time-to-completion estimates from app API data for current apps, and support preset estimates for planned future apps.
   - Include both current progress and planned future learning phases, with the ability to see where each app falls on a 0–10 year timeline.

6. **Historical Progress Tracking**
   - Persist snapshots of imported progress with timestamps.
   - Capture trends such as weekly lesson completion rates and change over time.
   - Enable trend visualization over time for vocabulary growth, app progress, and completion speed.
   - Use history data to improve estimates and display long-term progress.

## Recommended Architecture

### Backend

- Java backend using a framework such as **Spring Boot**.
- REST API endpoints for:
  - importing app data
  - retrieving dashboard metrics
  - retrieving vocabulary overview
  - generating or exporting Anki cards
  - managing refresh/update operations
- A service layer that separates:
  - API integration logic
  - data normalization
  - persistence logic
  - business rules

### Frontend

- Web UI built with **Next.js**.
- Dashboard pages for:
  - overall progress
  - app-specific details
  - vocabulary visualization
  - Anki card generation
  - historical trend charts
- UI controls for manual refresh/update and integration management.

### Database

- Start with a local database for persistence.
- Suggested options:
  - **SQLite** for the simplest local setup (going with this for now)
  - **PostgreSQL** if you want a production-like stack from the start
- Key persistence principles:
  - don’t rely on in-memory storage
  - store imported app data in structured tables
  - include timestamped snapshots for history
  - include a `user_id` field even for a single-user prototype

## Project Quality and Best Practices

- Keep scope focused on a working MVP before adding extra app integrations or features.
- Add a strong `README.md` with project purpose, tech stack, setup instructions, and current status.
- Include automated tests for core backend service logic and frontend components.
- Use `.gitignore` and environment-based configuration; do not check API tokens or secrets into source control.
- Keep the codebase clean and modular with separate controllers, services, and persistence layers.
- Make local setup easy to run, with clear startup and database initialization instructions.
- Document architecture decisions and current progress so the project is easy to understand by others.

## Data Design Principles

- Normalize data from each app into a common model.
- Keep source-specific raw data available for debugging and future adaptation.
- Track vocabulary as discrete items with app membership information.
- Save progress snapshots over time to support trend analysis.
- Keep the user reference flexible so multi-user support can be added later.

## Suggested Data Entities

- `User` (optional for now but recommended)
  - `id`
  - `name`
  - `created_at`

- `AppIntegration`
  - `id`
  - `user_id`
  - `app_name`
  - `account_identifier`
  - `api_token_or_credentials`
  - `last_synced_at`

- `AppProgressSnapshot`
  - `id`
  - `user_id`
  - `app_integration_id`
  - `app_name`
  - `raw_data`
  - `metric_values`
  - `snapshot_time`

- `VocabularyItem`
  - `id`
  - `user_id`
  - `word`
  - `reading`
  - `meaning`

- `VocabularySource`
  - `id`
  - `vocabulary_item_id`
  - `app_name`
  - `app_specific_id`
  - `learned_at`

- `AnkiCard`
  - `id`
  - `user_id`
  - `vocabulary_item_id`
  - `card_front`
  - `card_back`
  - `generated_at`
  - `anki_status`

- `TimelinePlan`
  - `id`
  - `user_id`
  - `app_name`
  - `start_date`
  - `end_date`
  - `preset_duration_months`
  - `is_planned`
  - `estimated_completion_source`

## Future-proofing for multi-user support

- Include `user_id` in tables from the beginning.
- Avoid hard-coding a single app account or a single storage location.
- Build the backend as a REST service rather than a one-off script.
- Keep business logic separate from web and persistence layers.
- Store credentials securely, and add authentication later if needed.

## Deployment and persistence strategy

### Start locally

- Use **SQLite** for a simple local database file.
- Run the Java backend locally with Spring Boot.
- Run the React/Next.js frontend locally and connect it to the backend.

### Move to hosted deployment later

- Move the database from SQLite to **PostgreSQL** or another managed service.
- Add authentication and per-user data separation.
- Host the backend on a cloud VM or platform-as-a-service.
- Host the frontend on a static hosting provider or the same service.

## Questions to refine later

- Should the Anki integration write directly to an AnkiConnect-enabled local client, or should it generate export files for manual import?
- Should the dashboard include a custom planned roadmap for future apps beyond just imported progress?
- Do you want to track review schedule data, lesson completion, vocabulary only, or both?

## Summary

This project is a personal Japanese learning hub that aggregates progress from multiple apps, estimates completion timelines, tracks vocabulary overlaps, generates Anki cards, and stores historical progress. With a Java backend and a React/Next.js frontend, it can be built first as a local tool and later transitioned cleanly to a multi-user service.
