-- ============================================================
-- Sprint 2 migration: rental_documents, vehicle_blocks
-- ============================================================

-- 1. Tabel dokumen identitas untuk sewa lepas kunci
CREATE TABLE IF NOT EXISTS public.rental_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id),
  doc_type      text NOT NULL CHECK (doc_type IN ('ktp','sim')),
  file_url      text NOT NULL,
  status        text NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu','diverifikasi','ditolak')),
  admin_note    text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (booking_id, doc_type)
);

ALTER TABLE public.rental_documents ENABLE ROW LEVEL SECURITY;

-- User bisa melihat dokumen milik sendiri
CREATE POLICY "rental_documents: user read own"
  ON public.rental_documents FOR SELECT
  USING (user_id = auth.uid());

-- User bisa menyisipkan dokumen untuk booking milik sendiri
CREATE POLICY "rental_documents: user insert own"
  ON public.rental_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- User bisa update (re-upload) dokumen milik sendiri
CREATE POLICY "rental_documents: user update own"
  ON public.rental_documents FOR UPDATE
  USING (user_id = auth.uid());

-- 2. Tabel blokir kendaraan (servis, dll)
CREATE TABLE IF NOT EXISTS public.vehicle_blocks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id    uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  start_date    date NOT NULL,
  end_date      date NOT NULL,
  reason        text,
  created_at    timestamptz DEFAULT now(),
  CHECK (end_date >= start_date)
);

ALTER TABLE public.vehicle_blocks ENABLE ROW LEVEL SECURITY;

-- Semua user autentikasi bisa melihat blokir (untuk kalender)
CREATE POLICY "vehicle_blocks: read all"
  ON public.vehicle_blocks FOR SELECT
  USING (true);

-- Hanya admin yang bisa insert/update/delete blokir
CREATE POLICY "vehicle_blocks: admin write"
  ON public.vehicle_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Tabel pembayaran (jika belum ada dari Sprint 1)
CREATE TABLE IF NOT EXISTS public.payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  method        text NOT NULL,
  amount        numeric(12,2) NOT NULL DEFAULT 0,
  proof_url     text,
  status        text NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu','dikonfirmasi','ditolak')),
  admin_note    text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (booking_id)
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments: user read own"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "payments: user insert own"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "payments: user update own"
  ON public.payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id AND user_id = auth.uid()
    )
  );
