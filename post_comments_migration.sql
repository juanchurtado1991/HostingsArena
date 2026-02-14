-- Create table for news comments
create table if not exists public.post_comments (
    id uuid default gen_random_uuid() primary key,
    post_slug text not null,
    author_name text not null,
    author_email text,
    content text not null,
    status text default 'approved',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.post_comments enable row level security;

-- Allow public to read approved comments
create policy "Allow public read-only access to approved comments"
on public.post_comments for select
using (status = 'approved');

-- Allow public to insert comments (will be pending or approved depending on policy)
create policy "Allow public to post comments"
on public.post_comments for insert
with check (true);
