-- Bootstraps profiles/learner_profiles/user_preferences the moment a user
-- signs up, so every feature can assume these rows exist rather than
-- checking for their absence on every request.

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.learner_profiles (user_id) values (new.id);
  insert into public.user_preferences (user_id) values (new.id);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
