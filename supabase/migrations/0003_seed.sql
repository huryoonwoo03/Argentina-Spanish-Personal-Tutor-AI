-- Seed data so the app is usable before the AI content pipeline has run.

insert into vocabulary_items (term, definition, category, level, examples) values
  ('che', 'Hey / dude — used to get someone''s attention or as a filler, the single most Argentine word there is.', 'slang', 'beginner', '[{"spanish": "Che, ¿vamos al kiosco?", "english": "Hey, wanna go to the corner store?"}]'),
  ('boludo/a', 'Dude / idiot, depending entirely on tone — among friends it''s affectionate, said with an edge it''s an insult.', 'slang', 'beginner', '[{"spanish": "No seas boludo.", "english": "Don''t be an idiot."}, {"spanish": "Boludo, ¡qué alegría verte!", "english": "Dude, so good to see you!"}]'),
  ('re', 'Intensifier meaning "really/super", used before adjectives constantly in spoken Rioplatense Spanish.', 'slang', 'beginner', '[{"spanish": "Está re bueno.", "english": "It''s really good."}]'),
  ('laburo', 'Job / work — the everyday Rioplatense word for "trabajo".', 'slang', 'beginner', '[{"spanish": "Tengo mucho laburo hoy.", "english": "I have a lot of work today."}]'),
  ('quilombo', 'A mess / chaotic situation.', 'slang', 'intermediate', '[{"spanish": "Esto es un quilombo.", "english": "This is a mess."}]'),
  ('bondi', 'Bus (colectivo), Buenos Aires slang.', 'slang', 'beginner', '[{"spanish": "Perdí el bondi.", "english": "I missed the bus."}]'),
  ('estar al pedo', 'To be doing nothing / have nothing to do.', 'idiom', 'intermediate', '[{"spanish": "Estoy al pedo, ¿nos juntamos?", "english": "I''ve got nothing going on, want to hang out?"}]'),
  ('ni en pedo', 'No way / not a chance.', 'idiom', 'intermediate', '[{"spanish": "¿Yo, cantar en público? Ni en pedo.", "english": "Me, sing in public? No way."}]'),
  ('tomar mate', 'To drink mate — the shared herbal-tea ritual central to Argentine social life.', 'expression', 'beginner', '[{"spanish": "¿Tomamos unos mates?", "english": "Shall we drink some mate?"}]'),
  ('posta', 'For real / seriously — used to confirm truth or ask if something is true.', 'internet', 'beginner', '[{"spanish": "¿Posta que ganaron?", "english": "Did they really win?"}]');

insert into achievements (code, title, description, icon, criteria) values
  ('first_lesson', 'First Steps', 'Complete your first lesson.', 'sparkles', '{"lessonsCompleted": 1}'),
  ('week_streak', 'Che, constancia', 'Reach a 7-day streak.', 'flame', '{"streak": 7}'),
  ('vocab_25', 'Slang Starter', 'Learn 25 vocabulary items.', 'book-open', '{"vocabularyMastered": 25}'),
  ('accent_80', 'Sounding Porteño', 'Reach an 80% accent score in a practice session.', 'trending-up', '{"accentScore": 80}');
