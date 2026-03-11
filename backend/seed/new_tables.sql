-- ============================================================
-- ApghatDarshak — New Tables: zones, users, route_history
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── TABLE: zones ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zones (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    city        TEXT DEFAULT 'Pune',
    area_sq_km  FLOAT,
    population  INT
);

-- Link zone_id to nodes
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS zone_id INT REFERENCES zones(id);

-- ── TABLE: users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    phone       TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    last_seen   TIMESTAMP DEFAULT NOW(),
    is_active   BOOLEAN DEFAULT TRUE
);

-- ── TABLE: route_history ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_history (
    id              SERIAL PRIMARY KEY,
    user_id         INT REFERENCES users(id) ON DELETE CASCADE,
    source_name     TEXT,
    dest_name       TEXT,
    source_lat      FLOAT,
    source_lng      FLOAT,
    dest_lat        FLOAT,
    dest_lng        FLOAT,
    mode            TEXT CHECK (mode IN ('shortest', 'safest', 'balanced')),
    vehicle_type    TEXT CHECK (vehicle_type IN ('car', 'bike', 'walk')),
    distance_km     FLOAT,
    duration_min    FLOAT,
    risk_score      FLOAT DEFAULT 0,
    blackspot_count INT DEFAULT 0,
    algorithm       TEXT DEFAULT 'A*',
    computed_at     TIMESTAMP DEFAULT NOW()
);

-- ── SEED: zones ───────────────────────────────────────────────────────────────
INSERT INTO zones (name, city, area_sq_km, population) VALUES
('Shivajinagar',   'Pune', 12.5,  95000),
('Kothrud',        'Pune', 18.2, 180000),
('Hadapsar',       'Pune', 22.4, 210000),
('Hinjewadi',      'Pune', 15.8, 120000),
('Pimpri',         'Pune', 30.1, 250000),
('Chinchwad',      'Pune', 28.5, 220000),
('Viman Nagar',    'Pune', 10.2,  98000),
('Yerwada',        'Pune',  9.8,  75000),
('Wakad',          'Pune', 14.5, 110000),
('Katraj',         'Pune', 16.2, 135000),
('Kharadi',        'Pune', 12.0,  88000),
('Baner',          'Pune', 11.5,  92000);

-- Link nodes to zones
UPDATE nodes SET zone_id = 1  WHERE name ILIKE '%Shivajinagar%' OR name ILIKE '%Deccan%';
UPDATE nodes SET zone_id = 2  WHERE name ILIKE '%Kothrud%' OR name ILIKE '%Chandni%' OR name ILIKE '%Warje%';
UPDATE nodes SET zone_id = 3  WHERE name ILIKE '%Hadapsar%' OR name ILIKE '%Magarpatta%' OR name ILIKE '%Amanora%';
UPDATE nodes SET zone_id = 4  WHERE name ILIKE '%Hinjewadi%';
UPDATE nodes SET zone_id = 5  WHERE name ILIKE '%Pimpri%';
UPDATE nodes SET zone_id = 6  WHERE name ILIKE '%Chinchwad%' OR name ILIKE '%Akurdi%' OR name ILIKE '%PCCOE%';
UPDATE nodes SET zone_id = 7  WHERE name ILIKE '%Viman Nagar%' OR name ILIKE '%Phoenix%';
UPDATE nodes SET zone_id = 8  WHERE name ILIKE '%Yerwada%';
UPDATE nodes SET zone_id = 9  WHERE name ILIKE '%Wakad%' OR name ILIKE '%Baner%';
UPDATE nodes SET zone_id = 10 WHERE name ILIKE '%Katraj%' OR name ILIKE '%Narhe%';
UPDATE nodes SET zone_id = 11 WHERE name ILIKE '%Kharadi%' OR name ILIKE '%EON%' OR name ILIKE '%WTC%';
UPDATE nodes SET zone_id = 12 WHERE name ILIKE '%Balewadi%' OR name ILIKE '%Pashan%';

-- ── SEED: users ───────────────────────────────────────────────────────────────
INSERT INTO users (name, email, phone) VALUES
('Aarav Sharma',   'aarav@example.com',   '9876543210'),
('Priya Desai',    'priya@example.com',   '9823456789'),
('Rohan Kulkarni', 'rohan@example.com',   '9012345678'),
('Sneha Patil',    'sneha@example.com',   '9765432109'),
('Vikram Joshi',   'vikram@example.com',  '9543210987');

-- ── SEED: route_history ───────────────────────────────────────────────────────
INSERT INTO route_history (user_id, source_name, dest_name, source_lat, source_lng, dest_lat, dest_lng, mode, vehicle_type, distance_km, duration_min, risk_score, blackspot_count) VALUES
(1, 'Shivajinagar', 'Hadapsar',     18.5314, 73.8446, 18.5027, 73.9255, 'safest',   'car',  12.5, 35.0, 18.0, 4),
(1, 'Pune Station', 'Kharadi',      18.5280, 73.8740, 18.5527, 73.9496, 'shortest', 'bike',  9.0, 28.0,  5.0, 2),
(2, 'Kothrud',      'Viman Nagar',  18.5089, 73.8176, 18.5679, 73.9143, 'balanced', 'car',  14.2, 40.0, 12.0, 3),
(2, 'Aundh',        'Katraj',       18.5589, 73.8089, 18.4580, 73.8640, 'shortest', 'car',  16.8, 48.0, 22.0, 6),
(3, 'Hadapsar',     'Hinjewadi',    18.5027, 73.9255, 18.5912, 73.7375, 'safest',   'bike', 18.5, 55.0,  3.0, 1),
(3, 'Shivajinagar', 'Yerwada',      18.5314, 73.8446, 18.5534, 73.9077, 'balanced', 'car',  10.2, 32.0,  9.0, 2),
(4, 'Viman Nagar',  'Kothrud',      18.5679, 73.9143, 18.5089, 73.8176, 'shortest', 'walk', 11.0, 30.0, 15.0, 3),
(4, 'Pimpri',       'Shivajinagar', 18.6279, 73.8020, 18.5314, 73.8446, 'safest',   'car',  13.4, 42.0,  4.0, 1),
(5, 'Katraj',       'Chinchwad',    18.4580, 73.8640, 18.6479, 73.7984, 'balanced', 'bike', 20.1, 58.0, 19.0, 5),
(5, 'Hinjewadi',    'Pune Station', 18.5912, 73.7375, 18.5280, 73.8740, 'shortest', 'car',   8.9, 25.0, 11.0, 3);

-- ── VERIFICATION ─────────────────────────────────────────────────────────────
SELECT
    (SELECT COUNT(*) FROM zones)         AS total_zones,
    (SELECT COUNT(*) FROM users)         AS total_users,
    (SELECT COUNT(*) FROM route_history) AS total_routes,
    (SELECT COUNT(*) FROM nodes WHERE zone_id IS NOT NULL) AS linked_nodes;
