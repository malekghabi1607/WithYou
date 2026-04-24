create table if not exists public.regie_action_history (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salon(id_salon) on delete cascade,
  type text not null,
  label text not null,
  details text null,
  by_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists regie_action_history_salon_created_idx
  on public.regie_action_history (salon_id, created_at desc);

alter table public.regie_action_history enable row level security;

drop policy if exists "regie history read" on public.regie_action_history;
create policy "regie history read"
on public.regie_action_history
for select
to anon, authenticated
using (true);

drop policy if exists "regie history insert" on public.regie_action_history;
create policy "regie history insert"
on public.regie_action_history
for insert
to anon, authenticated
with check (true);
