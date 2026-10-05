-- Seed data contoh (armada, rute shuttle, jadwal, paket pengemudi, pengemudi, pengaturan)

insert into public.vehicles
  (slug, category, name, type, capacity, transmission, fuel, price_per_day_self_drive, deposit, km_limit,
   allow_self_drive, allow_with_driver, description, features, images)
values
  ('toyota-hiace-commuter', 'microbus', 'Toyota Hiace Commuter', 'Microbus', 14, 'manual', 'Solar',
   1800000, 2000000, 300, false, true,
   'Microbus lega untuk rombongan keluarga, kantor, dan wisata. Kabin tinggi, AC dingin, bagasi luas.',
   '["AC","Audio","Bagasi luas","Kursi reclining","Charger USB"]', array['/assets/hiace.webp']),
  ('isuzu-elf-tosca', 'microbus', 'Isuzu Elf Executive (Tosca)', 'Microbus', 19, 'manual', 'Solar',
   1500000, 2000000, 300, false, true,
   'Isuzu Elf warna tosca dengan kabin eksekutif untuk perjalanan jauh bersama rombongan.',
   '["AC","Audio","Jok berlogo Ibra Jaya","Bagasi belakang"]', array['/assets/armada-garasi.webp']),
  ('isuzu-elf-putih', 'microbus', 'Isuzu Elf Long', 'Microbus', 19, 'manual', 'Solar',
   1400000, 2000000, 300, false, true,
   'Isuzu Elf Long putih, nyaman untuk wisata dan antar-jemput rombongan.',
   '["AC","Audio","Bagasi belakang"]', array['/assets/armada-garasi.webp']),
  ('toyota-avanza', 'mobil', 'Toyota Avanza', 'MPV', 7, 'manual', 'Bensin',
   350000, 500000, 150, true, true, 'MPV irit dan populer untuk keluarga kecil.',
   '["AC","Audio","Bagasi"]', '{}'),
  ('toyota-innova-reborn', 'mobil', 'Toyota Innova Reborn', 'MPV', 7, 'matic', 'Solar',
   650000, 1000000, 150, true, true, 'MPV premium dengan kenyamanan kabin dan performa stabil.',
   '["AC double blower","Audio","Captain seat"]', '{}'),
  ('mitsubishi-xpander', 'mobil', 'Mitsubishi Xpander', 'MPV', 7, 'matic', 'Bensin',
   450000, 700000, 150, true, true, 'MPV modern dengan kabin lega dan fitur keselamatan lengkap.',
   '["AC","Audio","Kamera mundur"]', '{}'),
  ('honda-brio', 'mobil', 'Honda Brio', 'Hatchback', 5, 'matic', 'Bensin',
   300000, 500000, 150, true, false, 'City car lincah untuk keperluan dalam kota.',
   '["AC","Audio"]', '{}');

-- Paket dengan pengemudi (tarif sudah termasuk pengemudi)
insert into public.driver_packages (vehicle_id, package_type, price, overtime_per_hour, fuel_included, notes)
select v.id, p.package_type, round(p.factor * v.base / 10000) * 10000, p.overtime, p.fuel, p.notes
from (select id, case category when 'microbus' then 1500000 else 600000 end as base
      from public.vehicles where allow_with_driver) v
cross join (values
  ('setengah_hari', 0.6, 75000, false, '6 jam, BBM tidak termasuk'),
  ('harian', 1.0, 100000, false, '12 jam, BBM, tol, dan parkir ditanggung penyewa'),
  ('antar_jemput', 0.7, 75000, true, 'Titik ke titik (bandara, stasiun, hotel)'),
  ('luar_kota', 1.4, 100000, false, 'Per hari; makan dan penginapan pengemudi ditanggung penyewa')
) as p(package_type, factor, overtime, fuel, notes);

insert into public.drivers (name, phone) values
  ('Pak Budi', '081200000001'),
  ('Pak Andi', '081200000002'),
  ('Pak Rahmat', '081200000003');

insert into public.shuttle_routes (slug, origin, destination, pickup_points, dropoff_points, estimated_duration)
values
  ('jakarta-bandung', 'Jakarta', 'Bandung',
   '["Pool Ibra Jaya Cawang","Blok M","Kampung Rambutan"]', '["Pasteur","Dipatiukur","Terminal Leuwipanjang"]', 180),
  ('jakarta-bandara-soekarno-hatta', 'Jakarta', 'Bandara Soekarno-Hatta',
   '["Pool Ibra Jaya Cawang","Blok M","Kelapa Gading"]', '["Terminal 1","Terminal 2","Terminal 3"]', 75),
  ('bandung-jakarta', 'Bandung', 'Jakarta',
   '["Pasteur","Dipatiukur","Terminal Leuwipanjang"]', '["Cawang","Blok M","Kampung Rambutan"]', 180),
  ('jakarta-cirebon', 'Jakarta', 'Cirebon',
   '["Pool Ibra Jaya Cawang","Kampung Rambutan"]', '["Terminal Harjamukti","Stasiun Cirebon"]', 240);

-- Jadwal 7 hari ke depan (WIB): 3 keberangkatan per rute per hari
insert into public.shuttle_departures (route_id, vehicle_id, driver_id, depart_at, price_per_seat, seat_count)
select r.id, v.id, d.id,
       (date_trunc('day', now() at time zone 'Asia/Jakarta') + (g.day || ' day')::interval
         + (t.hour || ' hour')::interval) at time zone 'Asia/Jakarta',
       case r.slug when 'jakarta-bandara-soekarno-hatta' then 120000
                   when 'jakarta-cirebon' then 190000 else 150000 end,
       v.capacity - 1
from public.shuttle_routes r
cross join generate_series(0, 6) as g(day)
cross join (values (6), (11), (17)) as t(hour)
join lateral (select id, capacity from public.vehicles where slug = 'toyota-hiace-commuter') v on true
join lateral (select id from public.drivers order by name limit 1) d on true
where (date_trunc('day', now() at time zone 'Asia/Jakarta') + (g.day || ' day')::interval
        + (t.hour || ' hour')::interval) at time zone 'Asia/Jakarta' > now();

insert into public.site_settings (key, value) values
  ('contact', '{"whatsapp":"6281200000000","phone":"081200000000","email":"halo@ibrajaya.id","address":"Jakarta, Indonesia"}'),
  ('payment_accounts', '[{"bank":"BCA","number":"0000000000","holder":"Ibra Jaya"}]'),
  ('booking_rules', '{"payment_deadline_hours":24,"shuttle_payment_deadline_hours":2,"shuttle_close_hours_before":2}'),
  ('ai_config', '{"provider":"gemini","enabled":true,"log_chats":true,"system_prompt":""}');
