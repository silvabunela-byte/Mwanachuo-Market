-- =====================================================================
-- MWANACHUO MARKET - Supabase setup
-- Endesha faili hili lote kwenye Supabase Dashboard > SQL Editor.
-- Linaweza kuendeshwa tena bila madhara (idempotent).
-- =====================================================================

-- ---------- 1. TABLES ----------
create table if not exists listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  price integer not null,
  category text not null,
  condition text default 'Imetumika',
  campus_location text,
  seller_name text not null,
  whatsapp_number text not null,
  image_urls text[] default '{}',
  is_sponsored boolean default false,
  is_verified boolean default false,
  status text default 'pending'
);

create table if not exists local_ads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  business_name text not null,
  banner_url text not null,
  target_url text not null,
  placement text default 'top_banner',
  is_active boolean default true,
  clicks_count integer default 0
);

create table if not exists blogs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text default 'Maisha ya Chuo'
);

-- ---------- 2. ROW LEVEL SECURITY ----------
alter table listings enable row level security;
alter table local_ads enable row level security;
alter table blogs enable row level security;

-- Kusoma: kila mtu
drop policy if exists "listings_select" on listings;
create policy "listings_select" on listings for select using (true);
drop policy if exists "local_ads_select" on local_ads;
create policy "local_ads_select" on local_ads for select using (true);
drop policy if exists "blogs_select" on blogs;
create policy "blogs_select" on blogs for select using (true);

-- Wanachuo kutuma tangazo: wanaweza tu kuingiza tangazo la 'pending'
drop policy if exists "listings_insert_pending" on listings;
create policy "listings_insert_pending" on listings for insert
  with check (status = 'pending' and is_sponsored = false and is_verified = false);

-- ---------- 3. ADMIN (MVP) ----------
-- ONYO: Admin Panel ya PIN '2026' inalindwa ndani ya browser tu. Ili ifanye kazi
-- kwa kutumia anon key, policies zifuatazo zinaruhusu mtu yeyote mwenye anon key
-- kubadilisha/kufuta data. Hii inakubalika kwa majaribio (MVP), lakini kabla ya
-- kuzindua rasmi, hamia Supabase Auth na ubadilishe policies hizi ziruhusu admin
-- mmoja tu (mfano: auth.jwt() ->> 'email' = 'wewe@email.com').
drop policy if exists "listings_admin_update" on listings;
create policy "listings_admin_update" on listings for update using (true) with check (true);
drop policy if exists "listings_admin_delete" on listings;
create policy "listings_admin_delete" on listings for delete using (true);

drop policy if exists "local_ads_admin_insert" on local_ads;
create policy "local_ads_admin_insert" on local_ads for insert with check (true);
drop policy if exists "local_ads_admin_update" on local_ads;
create policy "local_ads_admin_update" on local_ads for update using (true) with check (true);
drop policy if exists "local_ads_admin_delete" on local_ads;
create policy "local_ads_admin_delete" on local_ads for delete using (true);

drop policy if exists "blogs_admin_insert" on blogs;
create policy "blogs_admin_insert" on blogs for insert with check (true);
drop policy if exists "blogs_admin_delete" on blogs;
create policy "blogs_admin_delete" on blogs for delete using (true);

-- ---------- 4. KUHESABU MABONYEZO YA MATANGAZO ----------
create or replace function increment_ad_clicks(ad_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update local_ads set clicks_count = coalesce(clicks_count, 0) + 1 where id = ad_id;
$$;

grant execute on function increment_ad_clicks(uuid) to anon, authenticated;

-- ---------- 5. STORAGE BUCKET: product-images ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_public_upload" on storage.objects;
create policy "product_images_public_upload" on storage.objects
  for insert with check (bucket_id = 'product-images');
