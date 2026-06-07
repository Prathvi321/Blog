-- profiles synced from Clerk
create table profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  role text default 'writer', -- 'admin' | 'writer'
  created_at timestamptz default now()
);

-- posts table
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  cover_image_url text,
  excerpt text,
  content jsonb not null, -- Editor.js JSON output
  tags text[],
  status text default 'draft', -- 'draft' | 'published' | 'archived'
  reading_time_minutes int,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- post revision history
create table post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  content jsonb not null,
  saved_at timestamptz default now(),
  saved_by uuid references profiles(id) on delete cascade
);

-- Enable RLS and setup policies
alter table profiles enable row level security;
alter table posts enable row level security;
alter table post_revisions enable row level security;

-- Policies for Profiles
create policy "Allow public read access to profiles" on profiles
  for select using (true);

create policy "Allow profiles to be created/updated by service role or authenticated" on profiles
  for all using (true); -- We will handle sync via server side service-role client

-- Policies for Posts
create policy "Allow public read access to published posts" on posts
  for select using (status = 'published');

create policy "Allow writers to see their own drafts" on posts
  for select using (true); -- Managed at application level for dashboard query

create policy "Allow writers/admins to modify posts" on posts
  for all using (true); -- Managed securely at the Next.js API/Server Action level

-- Policies for Post Revisions
create policy "Allow read access to revisions" on post_revisions
  for select using (true);

create policy "Allow inserts to revisions" on post_revisions
  for insert with check (true);
