-- Private bucket for practice/shadowing recordings, one folder per user
-- (object path: "<user_id>/<session_id>.<ext>") so RLS can scope access.

insert into storage.buckets (id, name, public)
values ('practice-audio', 'practice-audio', false)
on conflict (id) do nothing;

create policy "practice-audio: owner rw"
  on storage.objects for all
  using (bucket_id = 'practice-audio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'practice-audio' and (storage.foldername(name))[1] = auth.uid()::text);
