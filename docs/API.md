# Che, Speak! — API design

Base URL: `/api/v1`. All routes except `/health` and `/auth/*` require a
Supabase JWT (`Authorization: Bearer <token>`), verified by
`core/auth` middleware; RLS in Postgres is the actual authorization
boundary, this middleware just resolves `req.user`.

Response envelope:

```ts
// success
{ data: T }
// error
{ error: { code: string; message: string; details?: unknown } }
```

## health

- `GET /health` — liveness, no auth.

## profile

- `GET /profile` — profile + learner_profile + preferences, merged
- `PATCH /profile` — update display name/avatar
- `GET /profile/learner` — learner profile (topics, goals, level, streaks)
- `PATCH /profile/learner` — update learner profile fields
- `GET /profile/preferences`
- `PATCH /profile/preferences` — voice speed, accent region, dark mode, notifications

## dashboard

- `GET /dashboard` — aggregated: streak, XP, today's lesson pointer, accent
  score trend, weekly goal progress. Composed server-side from
  learner_profiles + daily_progress + generated_content, so the client
  makes one call.

## lessons (AI-generated, cached)

- `GET /lessons/today` — today's personalized lesson; generates via
  LLMProvider on cache miss (see ARCHITECTURE.md §2.3), else cached
- `POST /lessons/:id/complete` — marks complete, awards XP, updates streak

## practice

- `POST /practice/sessions` — create session: reference text/audio prompt
- `POST /practice/sessions/:id/audio` — upload recorded audio (multipart)
- `POST /practice/sessions/:id/score` — run STT + PronunciationScorer,
  persist and return `{ rhythm, intonation, authenticity, phonemeNotes,
  coaching }`
- `GET /practice/sessions/:id`
- `GET /practice/sessions` — history, paginated

## shadowing

- `GET /shadowing/clips` — native audio clips (filterable by level/topic)
- `POST /shadowing/clips/:id/attempts` — same scoring pipeline as practice,
  tagged `session_type = shadowing`

## conversation

- `POST /conversation/sessions` — start a session
- `GET /conversation/sessions` — list, most recent first
- `GET /conversation/sessions/:id/messages`
- `POST /conversation/sessions/:id/messages` — send user message (text or
  transcribed audio); returns assistant reply with `corrections[]` and
  `culturalNotes` without breaking conversational flow (corrections are
  structured alongside the reply, not interleaved as interruptions).
  Server builds the LLM prompt from: learner profile + recent message
  window + relevant long-term memory summary.

## vocabulary

- `GET /vocabulary` — filter by level/category/region, paginated
- `GET /vocabulary/:id`
- `GET /vocabulary/recommended` — derived from learner_profile + mistakes +
  spaced-repetition due items (`user_vocabulary_progress.next_review_at`)
- `POST /vocabulary/:id/review` — record a review outcome, updates mastery
  and schedules next review

## culture

- `GET /culture/topics` — filter by category (food, football, history,
  music, current events, ...)
- `GET /culture/topics/:id` — generates via AI on cache miss like lessons

## progress

- `GET /progress/summary` — charts data: XP over time, accent score trend
- `GET /progress/weak-sounds` — aggregated from practice_sessions scores
- `GET /progress/heatmap` — daily_progress as a calendar heatmap
- `GET /progress/achievements`

## Error codes

`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`,
`AI_PROVIDER_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR` — mapped from the
`AppError` hierarchy in `core/errors`.
