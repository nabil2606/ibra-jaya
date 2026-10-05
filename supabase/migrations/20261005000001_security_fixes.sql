-- ============================================================
-- Sprint 3/4 perbaikan keamanan & fungsi atomik
-- 5 Okt 2026
-- ============================================================

-- 1. HAPUS policy berbahaya: user tidak boleh UPDATE payments/rental_documents langsung
--    (semua penulisan lewat server action dengan service role)
DROP POLICY IF EXISTS "rental_documents: user update own" ON public.rental_documents;
DROP POLICY IF EXISTS "payments: user update own" ON public.payments;

-- 2. Drop duplikat vehicle_blocks dari sprint2 (tabel sudah ada di init)
--    Ini cukup drop policy duplikat saja karena IF NOT EXISTS skip tabel
DROP POLICY IF EXISTS "vehicle_blocks: read all" ON public.vehicle_blocks;

-- 3. Proteksi _migrations (jika ada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='_migrations') THEN
    EXECUTE 'ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY';
    -- Hanya service role yang bisa baca/tulis
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='_migrations' AND policyname='_migrations: deny all') THEN
      EXECUTE 'CREATE POLICY "_migrations: deny all" ON public._migrations FOR ALL USING (false)';
    END IF;
  END IF;
END $$;

-- 4. View shuttle_schedules dengan security_invoker
CREATE OR REPLACE VIEW public.shuttle_schedules
WITH (security_invoker = true)
AS
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

-- 5. Fungsi ATOMIK untuk penahanan kursi shuttle (mencegah race condition)
CREATE OR REPLACE FUNCTION public.reserve_shuttle_seats(
  p_departure_id uuid,
  p_num_seats int
)
RETURNS TABLE(success boolean, new_seats_booked int, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seat_count int;
  v_seats_booked int;
  v_status text;
  v_depart_at timestamptz;
  v_new_booked int;
BEGIN
  -- Lock baris secara eksklusif
  SELECT sd.seat_count, sd.seats_booked, sd.status, sd.depart_at
    INTO v_seat_count, v_seats_booked, v_status, v_depart_at
    FROM shuttle_departures sd
    WHERE sd.id = p_departure_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Jadwal tidak ditemukan.'::text;
    RETURN;
  END IF;

  IF v_status <> 'buka' THEN
    RETURN QUERY SELECT false, v_seats_booked, ('Jadwal berstatus ' || v_status)::text;
    RETURN;
  END IF;

  IF v_depart_at <= now() THEN
    RETURN QUERY SELECT false, v_seats_booked, 'Jadwal sudah berlalu.'::text;
    RETURN;
  END IF;

  v_new_booked := v_seats_booked + p_num_seats;
  IF v_new_booked > v_seat_count THEN
    RETURN QUERY SELECT false, v_seats_booked,
      ('Hanya tersisa ' || (v_seat_count - v_seats_booked) || ' kursi.')::text;
    RETURN;
  END IF;

  UPDATE shuttle_departures
    SET seats_booked = v_new_booked,
        status = CASE WHEN v_new_booked >= v_seat_count THEN 'penuh' ELSE 'buka' END
    WHERE id = p_departure_id;

  RETURN QUERY SELECT true, v_new_booked, null::text;
END;
$$;

-- 6. Fungsi untuk melepas kursi (cancel / auto-cancel)
CREATE OR REPLACE FUNCTION public.release_shuttle_seats(
  p_departure_id uuid,
  p_num_seats int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE shuttle_departures
    SET seats_booked = GREATEST(0, seats_booked - p_num_seats),
        status = CASE
          WHEN GREATEST(0, seats_booked - p_num_seats) < seat_count THEN 'buka'
          ELSE status
        END
    WHERE id = p_departure_id;
END;
$$;

-- 7. Fungsi auto-cancel pesanan kedaluwarsa
CREATE OR REPLACE FUNCTION public.auto_cancel_expired_bookings()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
  v_booking record;
BEGIN
  FOR v_booking IN
    SELECT b.id, bi.departure_id, bi.qty
    FROM bookings b
    LEFT JOIN booking_items bi ON bi.booking_id = b.id
    WHERE b.status = 'menunggu_pembayaran'
      AND b.payment_deadline < now()
  LOOP
    -- Update status pesanan
    UPDATE bookings SET status = 'dibatalkan' WHERE id = v_booking.id AND status = 'menunggu_pembayaran';
    IF FOUND THEN
      v_count := v_count + 1;
      -- Lepas kursi shuttle jika ada
      IF v_booking.departure_id IS NOT NULL THEN
        PERFORM release_shuttle_seats(v_booking.departure_id, v_booking.qty);
      END IF;
    END IF;
  END LOOP;
  RETURN v_count;
END;
$$;
