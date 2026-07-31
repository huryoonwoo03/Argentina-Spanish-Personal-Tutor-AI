-- Che, Speak! — initial schema
-- Conventions: uuid PKs, snake_case, RLS enabled on every user-scoped table
-- with a single "owner can read/write own rows" policy keyed on auth.uid().

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

create type vocabulary_level as enum ('beginner', 'intermediate', 'advanced');
create type vocabulary_category as enum ('slang', 'idiom', 'expression', 'formal', 'internet');
create type content_type as enum ('lesson', 'slang_explanation', 'culture_topic', 'current_event');
create type practice_session_type as enum ('practice', 'shadowing');
create type message_role as enum ('user', 'assistant');
create type learning_pace as enum ('relaxed', 'steady', 'intense');

-- ---------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "profiles: owner rw" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- Learner profile — the single source of truth for personalization
-- ---------------------------------------------------------------------

create table learner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  favorite_topics text[] not null default '{}',
  hobbies text[] not null default '{}',
  profession text,
  goals text[] not null default '{}',
  vocabulary_level vocabulary_level not null default 'beginner',
  learning_pace learning_pace not null default 'steady',
  confidence_level smallint not null default 50 check (confidence_level between 0 and 100),
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_xp integer not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

alter table learner_profiles enable row level security;
create policy "learner_profiles: owner rw" on learner_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- User preferences
-- ---------------------------------------------------------------------

create table user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  voice_speed numeric(3, 2) not null default 1.0,
  accent_region text not null default 'rioplatense',
  dark_mode boolean not null default true,
  notifications_enabled boolean not null default true,
  ui_language text not null default 'en',
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;
create policy "user_preferences: owner rw" on user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Vocabulary — shared catalog, not per-user
-- ---------------------------------------------------------------------

create table vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  definition text not null,
  category vocabulary_category not null,
  level vocabulary_level not null,
  region text not null default 'rioplatense',
  audio_url text,
  examples jsonb not null default '[]',
  is_current boolean not null default true,
  superseded_by uuid references vocabulary_items (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vocabulary_items_level_category_idx on vocabulary_items (level, category);

-- Public read (catalog content), no RLS write policy for end users.
alter table vocabulary_items enable row level security;
create policy "vocabulary_items: public read" on vocabulary_items
  for select using (true);

create table user_vocabulary_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  vocabulary_item_id uuid not null references vocabulary_items (id) on delete cascade,
  mastery_level smallint not null default 0 check (mastery_level between 0 and 100),
  times_reviewed integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  primary key (user_id, vocabulary_item_id)
);

alter table user_vocabulary_progress enable row level security;
create policy "user_vocabulary_progress: owner rw" on user_vocabulary_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Generated content cache (lessons, slang explanations, culture topics)
-- ---------------------------------------------------------------------

create table generated_content (
  id uuid primary key default gen_random_uuid(),
  content_type content_type not null,
  -- null user_id = shareable/cacheable across learners with the same signature
  user_id uuid references auth.users (id) on delete cascade,
  topic text not null,
  level vocabulary_level,
  content_hash text not null,
  content jsonb not null,
  model text not null,
  freshness_expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index generated_content_hash_idx on generated_content (content_hash);
create index generated_content_lookup_idx on generated_content (content_type, topic, level);

alter table generated_content enable row level security;
create policy "generated_content: owner or shared read" on generated_content
  for select using (user_id is null or auth.uid() = user_id);
create policy "generated_content: owner write" on generated_content
  for insert with check (user_id is null or auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Practice & shadowing sessions
-- ---------------------------------------------------------------------

create table practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_type practice_session_type not null,
  reference_text text not null,
  audio_url text,
  transcript text,
  pronunciation_score jsonb, -- { rhythm, intonation, authenticity, phonemeNotes[] }
  created_at timestamptz not null default now()
);

create index practice_sessions_user_idx on practice_sessions (user_id, created_at desc);

alter table practice_sessions enable row level security;
create policy "practice_sessions: owner rw" on practice_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Conversation AI — sessions + messages (memory)
-- ---------------------------------------------------------------------

create table conversation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table conversation_sessions enable row level security;
create policy "conversation_sessions: owner rw" on conversation_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversation_sessions (id) on delete cascade,
  role message_role not null,
  content text not null,
  corrections jsonb not null default '[]',
  cultural_notes text,
  created_at timestamptz not null default now()
);

create index conversation_messages_conv_idx on conversation_messages (conversation_id, created_at);

alter table conversation_messages enable row level security;
create policy "conversation_messages: owner rw" on conversation_messages
  for all using (
    auth.uid() = (select user_id from conversation_sessions cs where cs.id = conversation_id)
  ) with check (
    auth.uid() = (select user_id from conversation_sessions cs where cs.id = conversation_id)
  );

-- ---------------------------------------------------------------------
-- Mistakes — feeds personalization / review recommendations
-- ---------------------------------------------------------------------

create table mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null, -- e.g. 'pronunciation:rr', 'grammar:subjunctive'
  description text not null,
  related_vocabulary_id uuid references vocabulary_items (id),
  source text, -- 'practice_session:<id>' | 'conversation_message:<id>'
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index mistakes_user_unresolved_idx on mistakes (user_id, resolved);

alter table mistakes enable row level security;
create policy "mistakes: owner rw" on mistakes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Achievements
-- ---------------------------------------------------------------------

create table achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text,
  criteria jsonb not null default '{}'
);

alter table achievements enable row level security;
create policy "achievements: public read" on achievements
  for select using (true);

create table user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table user_achievements enable row level security;
create policy "user_achievements: owner rw" on user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Daily progress — backs charts, heatmaps, streaks
-- ---------------------------------------------------------------------

create table daily_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null,
  xp_earned integer not null default 0,
  minutes_practiced integer not null default 0,
  accent_score smallint check (accent_score between 0 and 100),
  lessons_completed integer not null default 0,
  primary key (user_id, activity_date)
);

alter table daily_progress enable row level security;
create policy "daily_progress: owner rw" on daily_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger vocabulary_items_set_updated_at before update on vocabulary_items
  for each row execute function set_updated_at();
create trigger conversation_sessions_set_updated_at before update on conversation_sessions
  for each row execute function set_updated_at();
