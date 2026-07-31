# Che, Speak! — Architecture

## 1. Product analysis

Che, Speak! teaches Rioplatense (Argentine) Spanish through immersion rather
than static curricula: conversation with an AI that has memory, pronunciation
coaching with real feedback, and content (slang, culture, current events)
that stays current instead of going stale.

Two properties drive every architecture decision below:

- **Personalization is structural, not cosmetic.** Every learner's lesson
  plan, vocabulary set, and conversation history diverges from day one. The
  data model and lesson pipeline must be built around a per-user learner
  profile, not a shared curriculum tree.
- **Content must never be purely static.** Slang and current events go stale
  in months. Lessons are generated on demand by AI and cached, not authored
  once and shipped forever. The cache is a performance/cost optimization
  layer sitting in front of generation, not a replacement for it.

## 2. High-level architecture

Monorepo, feature-based, npm workspaces:

```
apps/
  web/      React + Vite + TS + Tailwind + shadcn/ui + Framer Motion
  api/      Node + Express + TS
packages/
  shared-types/   Domain types shared by web and api (single source of truth)
supabase/
  migrations/     SQL schema, versioned
docs/               Architecture, database, API design
```

**Why a monorepo:** the domain types (Lesson, ConversationMessage,
PronunciationScore, VocabularyItem, ...) are consumed by both the API
(producing them) and the web app (rendering them). A shared-types package
with npm workspaces gives compile-time guarantees across the boundary
without publishing a package to a registry.

**Why feature-based, not layer-based, internally:** `apps/api/src/features/lessons`,
`.../conversation`, `.../vocabulary` etc. each own their routes, service,
repository, and types. This keeps a module's blast radius contained — the
conversation module can evolve its memory strategy without touching
pronunciation scoring — and matches how the product will actually grow
(feature by feature, per the project workflow).

### 2.1 API layering (per feature)

```
routes/       HTTP contract only (validation, status codes)
controller    Orchestrates services, no business logic
services/     Business logic, framework-agnostic
repositories/ Supabase queries, isolated so the DB can be swapped/mocked
```

Cross-cutting concerns (`auth`, `logger`, `errors`, `config`) live in
`apps/api/src/core` and are injected into features, not imported ad hoc,
so services stay unit-testable without a live DB.

### 2.2 AI layer — provider-agnostic by design

AI is not sprinkled through features as raw SDK calls. Every feature that
needs AI talks to an interface in `apps/api/src/core/ai`:

- `LLMProvider` — `complete()`, `stream()`, `completeStructured<T>()` for
  JSON-schema-constrained generation (lesson plans, pronunciation feedback,
  slang metadata). Default adapter: Claude (Anthropic). Swapping or mixing
  providers (e.g. a cheap model for slang-freshness tagging, a stronger one
  for conversation) is a new adapter, not a rewrite.
- `SpeechToTextProvider` — `transcribe()`, returning text + word-level
  timing where available. Default adapter: Whisper.
- `PronunciationScorer` — `score(audio, referenceText)` → rhythm,
  intonation, phoneme-level notes, authenticity score. Kept separate from
  raw STT because today's plan is "transcribe + heuristic scoring on top";
  if we later adopt a provider with native pronunciation assessment
  (e.g. Azure), only this adapter changes.
- `TextToSpeechProvider` — `synthesize(text, voiceProfile)`. Default
  adapter: ElevenLabs, for es-AR voice quality.

Every provider call in these adapters is logged with cost/latency metadata
from day one — AI spend is a first-class operational metric for this
product, not an afterthought.

### 2.3 Dynamic content with caching (never fully hardcoded)

Requirement: the app must never rely entirely on hardcoded lessons, but
also can't call an LLM on every request. Pipeline:

```
request → cache lookup (content hash of: topic + level + learner profile
           signature + content "freshness window")
         → hit  → return cached content, log cache hit
         → miss → generate via LLMProvider.completeStructured()
                → validate against schema
                → persist to generated_content (Supabase)
                → return
```

`generated_content` rows carry a `freshness_expires_at` (short for slang/
current-events content, long for grammar fundamentals) so stale content is
regenerated automatically instead of living forever. This is the same
mechanism for lessons, slang explanations, and culture/current-events
content — one pipeline, three content types.

### 2.4 Personalization ("learner profile")

A single `learner_profile` aggregate (Supabase table + derived view) holds:
favorite topics, hobbies, profession, goals, recent mistakes, vocabulary
level, pronunciation weak sounds, learning pace, confidence trend. Lesson
generation, vocabulary recommendation, and conversation system prompts all
read from this one profile — so "the AI remembers you" is one data source,
not duplicated state per feature.

### 2.5 Frontend

- `src/app` — routing, providers (auth, theme, query client)
- `src/features/<name>` — one folder per product area (dashboard, practice,
  shadowing, conversation, vocabulary, culture, progress, settings), each
  with its own components/hooks/api-client
- `src/components/ui` — shadcn/ui primitives, unmodified except for theme
  tokens
- `src/lib` — cross-feature utilities (supabase client, api client, cn())

State: TanStack Query for server state (caching, refetch, optimistic
updates fit this app's "always fresh but don't refetch constantly" needs
better than hand-rolled fetch+useState); minimal local/UI state via React
state or Zustand only where genuinely needed (e.g. audio recorder state).

### 2.6 Auth

Supabase Auth (email + Google + Apple providers) on both sides: the web
app uses `@supabase/supabase-js` directly for sign-in flows; the API
verifies the Supabase JWT on every request via middleware in
`core/auth`, and uses the authenticated `user.id` as the tenant key for
all Row Level Security policies. RLS is the primary authorization
boundary, not application-level checks — a learner's data is only ever
reachable through Supabase policies scoped to `auth.uid()`.

## 3. Non-functional commitments

- **Testing**: services and AI adapters are unit-tested with providers
  mocked; repositories tested against a local Supabase instance or
  Testcontainers-style setup (added when the first feature lands).
- **Error handling**: typed `AppError` hierarchy in `core/errors`, a single
  Express error middleware maps them to HTTP responses; the client never
  sees raw provider/DB errors.
- **Logging**: structured JSON logs (`core/logger`), request-scoped
  correlation IDs.
- **Accessibility & dark mode**: shadcn/ui + Tailwind CSS variables for
  theme tokens from the first component; keyboard navigation and ARIA are
  a review checklist item per feature, not a retrofit.

## 4. Build order (this workflow)

Module 0 (this change): repo scaffold, shared types, DB schema, API design
docs, empty-but-wired app shells, health checks. Every module after this
follows: implement → test → confirm with product owner → next module.

Planned module order: 1) Auth  2) Learner profile & Settings  3) Dashboard
(read-only, real data)  4) Vocabulary  5) Culture/current-events  6)
Practice + pronunciation scoring  7) Shadowing  8) Conversation AI (memory)
9) Progress analytics  10) Personalization engine tying lesson generation
to the learner profile end-to-end.
