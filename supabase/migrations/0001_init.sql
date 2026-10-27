-- Schéma initial (Supabase / Postgres)

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  level text not null default 'intermediaire'
    check (level in ('debutant', 'intermediaire', 'avance', 'expert')),
  daily_goal int not null default 10,
  streak int not null default 0,
  xp int not null default 0,
  lichess_username text,
  chesscom_username text,
  created_at timestamptz not null default now()
);

-- Lignes du répertoire choisies par l'utilisateur
create table repertoire_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  name text not null,
  eco text,
  side char(1) not null check (side in ('w', 'b')),
  moves text[] not null,
  created_at timestamptz not null default now()
);

-- État de répétition espacée (FSRS) par carte = (position, camp)
create table card_reviews (
  user_id uuid not null references profiles on delete cascade,
  card_id text not null,
  due timestamptz not null,
  stability double precision not null,
  difficulty double precision not null,
  reps int not null default 0,
  lapses int not null default 0,
  state smallint not null,
  last_review timestamptz,
  primary key (user_id, card_id)
);
create index card_reviews_due on card_reviews (user_id, due);

-- Historique des réponses (statistiques, ajustement du niveau)
create table review_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles on delete cascade,
  card_id text not null,
  correct boolean not null,
  time_ms int not null,
  answered_at timestamptz not null default now()
);

-- Parties importées et positions à retravailler
create table imported_games (
  id text primary key,                 -- ex. "lichess:abcd1234"
  user_id uuid not null references profiles on delete cascade,
  source text not null check (source in ('lichess', 'chesscom')),
  pgn text not null,
  user_side char(1) not null,
  played_at timestamptz,
  analyzed_at timestamptz
);

create table game_mistakes (
  id bigint generated always as identity primary key,
  game_id text not null references imported_games on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  fen text not null,
  played text not null,
  best text[] not null,
  kind text not null check (kind in ('repertoire_deviation', 'engine_mistake')),
  eval_loss int                         -- en centipions, null pour un simple écart
);

alter table profiles enable row level security;
alter table repertoire_lines enable row level security;
alter table card_reviews enable row level security;
alter table review_log enable row level security;
alter table imported_games enable row level security;
alter table game_mistakes enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own lines" on repertoire_lines for all using (auth.uid() = user_id);
create policy "own reviews" on card_reviews for all using (auth.uid() = user_id);
create policy "own log" on review_log for all using (auth.uid() = user_id);
create policy "own games" on imported_games for all using (auth.uid() = user_id);
create policy "own mistakes" on game_mistakes for all using (auth.uid() = user_id);
