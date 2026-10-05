-- Sprint 3: tambah kolom shuttle_schedule_id & driver_package_id ke booking_items
-- Sesuaikan dengan struktur yang sudah ada (shuttle_departures, bukan shuttle_schedules)

-- Tambah kolom driver_package_id jika belum ada
ALTER TABLE public.booking_items
  ADD COLUMN IF NOT EXISTS driver_package_id uuid REFERENCES public.driver_packages(id);

-- Tambah kolom shuttle_schedule_id sebagai alias ke departure_id
ALTER TABLE public.booking_items
  ADD COLUMN IF NOT EXISTS shuttle_schedule_id uuid REFERENCES public.shuttle_departures(id);

-- Tambah price_per_seat dan duration_minutes ke shuttle_routes
ALTER TABLE public.shuttle_routes
  ADD COLUMN IF NOT EXISTS price_per_seat numeric(12,0) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_minutes int NOT NULL DEFAULT 120;

-- View shuttle_schedules sebagai alias shuttle_departures (untuk kompatibilitas kode frontend)
CREATE OR REPLACE VIEW public.shuttle_schedules AS
SELECT
  id,
  route_id,
  vehicle_id,
  driver_id,
  depart_at AS departure_at,
  price_per_seat,
  seat_count AS capacity,
  seats_booked,
  (seat_count - seats_booked) AS seats_available,
  status,
  created_at
FROM public.shuttle_departures;

-- Update seed: isi price_per_seat dari shuttle_routes
UPDATE public.shuttle_routes SET
  price_per_seat = CASE
    WHEN origin = 'Jakarta' AND destination = 'Bandung' THEN 85000
    WHEN origin = 'Bandung' AND destination = 'Jakarta' THEN 85000
    WHEN origin = 'Jakarta' AND destination = 'Cirebon' THEN 110000
    WHEN origin = 'Jakarta' AND destination = 'Bandara Soekarno-Hatta' THEN 65000
    ELSE 75000
  END,
  duration_minutes = CASE
    WHEN origin = 'Jakarta' AND destination = 'Bandung' THEN 180
    WHEN origin = 'Bandung' AND destination = 'Jakarta' THEN 180
    WHEN origin = 'Jakarta' AND destination = 'Cirebon' THEN 240
    WHEN origin = 'Jakarta' AND destination = 'Bandara Soekarno-Hatta' THEN 90
    ELSE 120
  END;
