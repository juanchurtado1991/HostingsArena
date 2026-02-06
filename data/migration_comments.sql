-- Create comments table
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  provider_type text not null check (provider_type in ('vpn', 'hosting')),
  provider_slug text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table comments enable row level security;

-- Policies
create policy "Public comments are viewable by everyone" on comments for select using (true);
create policy "Users can insert their own comments" on comments for insert with check (auth.uid() = user_id);
