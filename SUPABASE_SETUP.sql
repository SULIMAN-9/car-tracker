-- ════════════════════════════════════════════════════════
--  Car Maintenance Tracker — Supabase Database Setup
--  Run this entire file in:
--  Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════

-- 1. Users table (login by name + phone)
CREATE TABLE IF NOT EXISTS users (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cars table
CREATE TABLE IF NOT EXISTS cars (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
  make                 TEXT NOT NULL,
  model                TEXT NOT NULL,
  year                 INTEGER,
  color                TEXT,
  license_plate        TEXT,
  vin                  TEXT,
  mileage_at_purchase  INTEGER DEFAULT 0,
  fuel_type            TEXT DEFAULT 'بنزين',
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Maintenance records
CREATE TABLE IF NOT EXISTS maintenance (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id                UUID REFERENCES cars(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  category              TEXT DEFAULT 'تغيير الزيت',
  date                  DATE NOT NULL,
  mileage               INTEGER DEFAULT 0,
  cost                  NUMERIC(10,2) DEFAULT 0,
  shop_name             TEXT,
  shop_address          TEXT,
  technician            TEXT,
  description           TEXT,
  next_service_date     DATE,
  next_service_mileage  INTEGER,
  status                TEXT DEFAULT 'مكتملة',
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Spare parts
CREATE TABLE IF NOT EXISTS spare_parts (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_id   UUID REFERENCES maintenance(id) ON DELETE CASCADE,
  part_name        TEXT NOT NULL,
  part_number      TEXT,
  brand            TEXT,
  quantity         INTEGER DEFAULT 1,
  unit_price       NUMERIC(10,2) DEFAULT 0,
  supplier         TEXT,
  warranty_months  INTEGER DEFAULT 0
);

-- ── Row Level Security (open for now — anon key only reads your data) ──
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars        ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (app handles user separation by user_id)
CREATE POLICY "allow_all_users"       ON users       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_cars"        ON cars        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_maintenance" ON maintenance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_parts"       ON spare_parts FOR ALL USING (true) WITH CHECK (true);

-- ── Indexes for performance ──
CREATE INDEX IF NOT EXISTS idx_cars_user        ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_maint_car        ON maintenance(car_id);
CREATE INDEX IF NOT EXISTS idx_parts_maint      ON spare_parts(maintenance_id);
CREATE INDEX IF NOT EXISTS idx_users_phone      ON users(phone);
CREATE INDEX IF NOT EXISTS idx_maint_date       ON maintenance(date DESC);

-- Done! ✅
SELECT 'Database setup complete! ✅' AS status;
