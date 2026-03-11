-- ============================================================
-- ApghatDarshak — Graph Connectivity Patch
-- Run this in Supabase SQL Editor AFTER the main seed.
-- Adds backbone roads to make the node graph fully traversable
-- by the A* routing engine.
-- ============================================================

-- Key trunk roads that connect all major Pune zones:
INSERT INTO roads (name, start_node_id, end_node_id, distance) VALUES

-- ── Central ↔ East (Pune Station → Kharadi corridor) ─────────────────────────
('Pune Station to Viman Nagar',         3,  19, 6.5),
('Viman Nagar to Kharadi',             19,  18, 2.8),
('Kharadi to Hadapsar',                18,  11, 4.2),
('Hadapsar to Mundhwa',                11, 103, 3.1),
('Mundhwa to Koregaon Park',          103, 171, 2.4),
('Koregaon Park to Yerwada',          171,  31, 1.8),

-- ── Central ↔ North (Shivajinagar → Pimpri corridor) ─────────────────────────
('Shivajinagar to Aundh Direct',        1,  29, 4.0),
('Aundh to Bopodi',                    29, 142, 3.2),
('Bopodi to Dapodi',                  142, 143, 1.5),
('Dapodi to Pimpri Chowk',            143,  21, 4.8),
('Pimpri to Pimpri Bhaji Mandai',      21, 184, 1.0),

-- ── PCMC internal connections ─────────────────────────────────────────────────
('Pimpri to Chinchwad Direct',         21,  22, 2.8),
('Chinchwad to Akurdi Direct',         22,  24, 2.5),
('Akurdi to PCCOE',                    24, 186, 1.2),
('PCCOE to Nigdi',                    186,  25, 2.0),
('Nigdi to Chikhali',                  25, 148, 4.5),

-- ── West Zone (Hinjewadi ↔ Wakad ↔ Baner) ────────────────────────────────────
('Wakad to Baner Road',                27,  28, 3.5),
('Baner to Aundh',                     28,  29, 2.2),
('Hinjewadi to Wakad Direct',          26,  27, 3.0),
('Wakad to Kalewadi',                  27,  38, 2.8),
('Kalewadi to Pimpri Bridge',          38,  21, 3.0),
('Baner to Pashan',                    28,  56, 2.5),
('Pashan to Sus Road',                 56,  30, 2.0),

-- ── South Pune (Katraj ↔ Kondhwa ↔ NIBM) ────────────────────────────────────
('Swargate to Bibvewadi',               4, 169, 2.0),
('Bibvewadi to Katraj',               169,   5, 3.5),
('Kondhwa to Kondhwa Budruk',          13, 112, 1.5),
('NIBM to Dorabjee',                   14, 111, 0.8),
('Undri to Fursungi',                  15, 106, 4.5),

-- ── Nagar Road ↔ Wagholi corridor ────────────────────────────────────────────
('Kalyani Nagar to Viman Nagar',       20,  19, 2.0),
('Viman Nagar to Nagar Rd Kharadi',    19,  32, 3.5),
('Nagar Rd to Wagholi Chowk',          32,  17, 4.2),
('Wagholi to Lohegaon Wagholi Rd',     17, 92,  6.0),

-- ── Airport / Lohegaon connector ─────────────────────────────────────────────
('Vishrantwadi to Airport Rd',         37,  33, 3.2),
('Airport Rd to Viman Nagar',          33,  19, 4.5),
('Lohegaon to Vishrantwadi',           34,  37, 3.0),

-- ── Sinhagad Rd corridor ─────────────────────────────────────────────────────
('Kothrud to Sinhagad Rd Circle',       6,  46, 2.8),
('Sinhagad Rd to Warje Bridge',        46, 122, 2.5),
('Warje Bridge to Warje Malwadi',     122,   8, 1.5),
('Warje Malwadi to Narhe',              8,  42, 2.2),

-- ── Ring Road connectors ──────────────────────────────────────────────────────
('Shivajinagar to Range Hills',         1, 140, 3.8),
('Range Hills to Khadki',             140, 141, 1.5),
('Khadki to Bopodi',                  141, 142, 1.8),
('Deccan to Dandekar Bridge',           2,  50, 1.5),
('Dandekar to Market Yard',            50,  49, 1.2),
('Market Yard to Bibvewadi',           49, 169, 1.5),

-- ── Hadapsar full connectivity ────────────────────────────────────────────────
('Hadapsar to Fursungi',               11, 106, 4.0),
('Hadapsar to Salunke Vihar',          11, 108, 3.5),
('Magarpatta to Mundhwa',              12, 103, 2.0),
('Amanora to NIBM Road',              107,  14, 3.0),

-- ── Pune Station hub ─────────────────────────────────────────────────────────
('Station to Bund Garden',              3, 157, 2.5),
('Bund Garden to Koregaon Park',      157, 171, 1.2),
('Station to Kasba Peth',               3, 171, 2.8),
('Station to Camp MG Road',             3, 134, 1.5);

-- Add accidents for all new roads
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year)
SELECT
    id AS road_id,
    floor(random() * 6)::int AS minor_count,
    floor(random() * 3)::int AS major_count,
    (CASE WHEN random() > 0.88 THEN floor(random() * 2)::int + 1 ELSE 0 END) AS fatal_count,
    2024
FROM roads
WHERE id NOT IN (SELECT DISTINCT road_id FROM accidents);

-- Refresh risk scores
UPDATE roads r
SET risk_score = sub.total_risk
FROM (
    SELECT road_id,
           SUM(minor_count * 1 + major_count * 3 + fatal_count * 5) AS total_risk
    FROM accidents
    GROUP BY road_id
) sub
WHERE r.id = sub.road_id;

-- Verify connectivity
SELECT
    (SELECT COUNT(*) FROM nodes)    AS total_nodes,
    (SELECT COUNT(*) FROM roads)    AS total_roads,
    (SELECT COUNT(*) FROM accidents) AS total_accidents;
