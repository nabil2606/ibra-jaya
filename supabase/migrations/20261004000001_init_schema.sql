-- Ibra Jaya — skema awal (PRD bagian 10 & 11)
-- Semua tabel: id uuid, created_at, updated_at. RLS aktif di semua tabel.

-- ============ Util ============
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============ profiles ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- Buat profil otomatis saat user mendaftar (role selalu 'user')
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- User tidak boleh mengubah role / status aktifnya sendiri.
-- auth.uid() null = service role / SQL editor (diizinkan).
create or replace function public.protect_profile_privileged() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.role is distinct from old.role or new.is_active is distinct from old.is_active) then
    raise exception 'Tidak diizinkan mengubah role atau status akun';
  end if;
  return new;
end $$;

create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_privileged();
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============ Katalog ============
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (category in ('mobil', 'microbus')),
  name text not null,
  type text not null,
  capacity int not null check (capacity > 0),
  transmission text not null check (transmission in ('manual', 'matic')),
  fuel text not null,
  price_per_day_self_drive numeric(12,0) not null default 0,
  deposit numeric(12,0) not null default 0,
  km_limit int,
  allow_self_drive boolean not null default true,
  allow_with_driver boolean not null default true,
  description text,
  features jsonb not null default '[]',
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.driver_packages (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  package_type text not null check (package_type in ('harian', 'setengah_hari', 'antar_jemput', 'luar_kota')),
  price numeric(12,0) not null,
  overtime_per_hour numeric(12,0) not null default 0,
  fuel_included boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vehicle_id, package_type)
);

create table public.vehicle_blocks (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  photo text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shuttle_routes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  origin text not null,
  destination text not null,
  pickup_points jsonb not null default '[]',
  dropoff_points jsonb not null default '[]',
  estimated_duration int not null, -- menit
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shuttle_departures (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.shuttle_routes(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id),
  driver_id uuid references public.drivers(id),
  depart_at timestamptz not null,
  price_per_seat numeric(12,0) not null,
  seat_count int not null check (seat_count > 0),
  seats_booked int not null default 0 check (seats_booked >= 0 and seats_booked <= seat_count),
  status text not null default 'buka' check (status in ('buka', 'penuh', 'ditutup', 'dibatalkan')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.shuttle_departures (route_id, depart_at);

-- ============ Pesanan ============
create sequence public.booking_code_seq;

create or replace function public.next_booking_code() returns text
language sql as $$
  select 'IJ-' || to_char(now() at time zone 'Asia/Jakarta', 'YYYYMMDD') || '-'
         || lpad(nextval('public.booking_code_seq')::text, 4, '0');
$$;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default public.next_booking_code(),
  user_id uuid not null references public.profiles(id),
  service_type text not null check (service_type in ('lepas_kunci', 'dengan_pengemudi', 'shuttle')),
  status text not null default 'menunggu_pembayaran' check (status in
    ('menunggu_pembayaran', 'menunggu_verifikasi', 'dikonfirmasi', 'selesai', 'dibatalkan', 'ditolak')),
  total_price numeric(12,0) not null,
  promo_code text,
  payment_deadline timestamptz not null,
  notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.bookings (user_id, created_at desc);
create index on public.bookings (status);

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id),
  departure_id uuid references public.shuttle_departures(id),
  driver_id uuid references public.drivers(id),
  start_at timestamptz,
  end_at timestamptz,
  pickup_location text,
  dropoff_location text,
  qty int not null default 1,
  unit_price numeric(12,0) not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.booking_items (vehicle_id, start_at, end_at);

create table public.booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  departure_id uuid not null references public.shuttle_departures(id),
  name text not null,
  phone text,
  seat_number int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Kursi tidak boleh terjual ganda (lapisan terakhir di level database)
create unique index booking_passengers_seat_unique
  on public.booking_passengers (departure_id, seat_number) where seat_number is not null;

create table public.rental_documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  doc_type text not null check (doc_type in ('ktp', 'sim')),
  file_url text not null, -- path di bucket privat rental-documents
  status text not null default 'menunggu' check (status in ('menunggu', 'disetujui', 'ditolak')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  method text not null,
  amount numeric(12,0) not null,
  proof_url text, -- path di bucket privat payment-proofs
  status text not null default 'menunggu' check (status in ('menunggu', 'terverifikasi', 'ditolak')),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  session_id text not null,
  question text not null,
  answer text,
  provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger updated_at untuk semua tabel lain
do $$
declare t text;
begin
  foreach t in array array['vehicles','driver_packages','vehicle_blocks','drivers','shuttle_routes',
    'shuttle_departures','bookings','booking_items','booking_passengers','rental_documents',
    'payments','ai_chat_logs','site_settings']
  loop
    execute format('create trigger %I_updated before update on public.%I
      for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ============ RLS ============
do $$
declare t text;
begin
  foreach t in array array['profiles','vehicles','driver_packages','vehicle_blocks','drivers',
    'shuttle_routes','shuttle_departures','bookings','booking_items','booking_passengers',
    'rental_documents','payments','ai_chat_logs','site_settings']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- profiles
create policy "profil: baca sendiri atau admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profil: ubah sendiri atau admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- katalog: publik baca jika aktif, tulis hanya admin
create policy "vehicles: baca publik aktif" on public.vehicles
  for select using (is_active or public.is_admin());
create policy "vehicles: admin tulis" on public.vehicles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "driver_packages: baca publik" on public.driver_packages
  for select using (
    public.is_admin() or exists (select 1 from public.vehicles v where v.id = vehicle_id and v.is_active)
  );
create policy "driver_packages: admin tulis" on public.driver_packages
  for all using (public.is_admin()) with check (public.is_admin());

create policy "vehicle_blocks: baca publik" on public.vehicle_blocks
  for select using (true);
create policy "vehicle_blocks: admin tulis" on public.vehicle_blocks
  for all using (public.is_admin()) with check (public.is_admin());

create policy "drivers: admin saja" on public.drivers
  for all using (public.is_admin()) with check (public.is_admin());

create policy "shuttle_routes: baca publik aktif" on public.shuttle_routes
  for select using (is_active or public.is_admin());
create policy "shuttle_routes: admin tulis" on public.shuttle_routes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "shuttle_departures: baca publik" on public.shuttle_departures
  for select using (
    public.is_admin() or exists (select 1 from public.shuttle_routes r where r.id = route_id and r.is_active)
  );
create policy "shuttle_departures: admin tulis" on public.shuttle_departures
  for all using (public.is_admin()) with check (public.is_admin());

-- pesanan: user hanya miliknya; penulisan sensitif lewat server (service role)
create policy "bookings: milik sendiri atau admin" on public.bookings
  for select using (user_id = auth.uid() or public.is_admin());
create policy "bookings: admin ubah" on public.bookings
  for update using (public.is_admin()) with check (public.is_admin());

create policy "booking_items: lewat pesanan" on public.booking_items
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin())));
create policy "booking_items: admin tulis" on public.booking_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "booking_passengers: lewat pesanan" on public.booking_passengers
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin())));
create policy "booking_passengers: admin tulis" on public.booking_passengers
  for all using (public.is_admin()) with check (public.is_admin());

create policy "rental_documents: milik sendiri atau admin" on public.rental_documents
  for select using (user_id = auth.uid() or public.is_admin());
create policy "rental_documents: admin tulis" on public.rental_documents
  for all using (public.is_admin()) with check (public.is_admin());

create policy "payments: lewat pesanan" on public.payments
  for select using (exists (
    select 1 from public.bookings b where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin())));
create policy "payments: admin tulis" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "ai_chat_logs: admin baca" on public.ai_chat_logs
  for select using (public.is_admin());

create policy "site_settings: baca publik" on public.site_settings
  for select using (key not like 'private_%' or public.is_admin());
create policy "site_settings: admin tulis" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ============ Storage ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('armada-images', 'armada-images', true, 3145728, array['image/jpeg','image/png','image/webp']),
  ('rental-documents', 'rental-documents', false, 3145728, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('payment-proofs', 'payment-proofs', false, 3145728, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "armada-images: baca publik" on storage.objects
  for select using (bucket_id = 'armada-images');
create policy "armada-images: admin tulis" on storage.objects
  for all using (bucket_id = 'armada-images' and public.is_admin())
  with check (bucket_id = 'armada-images' and public.is_admin());

-- Berkas privat: folder pertama = id user pemilik
create policy "privat: pemilik atau admin baca" on storage.objects
  for select using (
    bucket_id in ('rental-documents', 'payment-proofs')
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
create policy "privat: pemilik unggah" on storage.objects
  for insert with check (
    bucket_id in ('rental-documents', 'payment-proofs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "privat: admin kelola" on storage.objects
  for all using (bucket_id in ('rental-documents', 'payment-proofs') and public.is_admin())
  with check (bucket_id in ('rental-documents', 'payment-proofs') and public.is_admin());
