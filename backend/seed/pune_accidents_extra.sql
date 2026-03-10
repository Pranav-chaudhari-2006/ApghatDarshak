-- ============================================================
-- ApghatDarshak — Additional Accident Records
-- Adds realistic multi-year (2020–2023) accident data
-- + bulk accidents for all roads (replaces sparse randomized single-year records)
-- Run AFTER the base seed (pune_accidents.sql)
-- ============================================================

-- ============================================================
-- STEP 1: Add multi-year accident records for ALL existing roads
-- This generates 4 more years (2020–2023) per road,
-- giving a total of 5 years x 84 roads = 420 accident records
-- ============================================================
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year)
SELECT 
    r.id as road_id,
    CASE 
        WHEN yr = 2020 THEN floor(random() * 10 + 5)::int   -- 5-14
        WHEN yr = 2021 THEN floor(random() * 12 + 4)::int   -- 4-15
        WHEN yr = 2022 THEN floor(random() * 14 + 3)::int   -- 3-16
        WHEN yr = 2023 THEN floor(random() * 12 + 4)::int   -- 4-15
    END as minor_count,
    CASE 
        WHEN yr = 2020 THEN floor(random() * 5 + 1)::int
        WHEN yr = 2021 THEN floor(random() * 6 + 1)::int
        WHEN yr = 2022 THEN floor(random() * 7 + 2)::int
        WHEN yr = 2023 THEN floor(random() * 6 + 1)::int
    END as major_count,
    CASE 
        WHEN random() > 0.70 THEN floor(random() * 4)::int + 1   -- 30% chance: 1-4 fatal
        ELSE 0
    END as fatal_count,
    yr as year
FROM roads r
CROSS JOIN (VALUES (2020),(2021),(2022),(2023)) AS years(yr);


-- ============================================================
-- STEP 2: High-risk blackspot overrides — Known Pune danger zones
-- These roads get significantly higher accident numbers (realistic data)
-- Road IDs based on seed order in pune_accidents.sql
-- ============================================================

-- Swargate to Katraj (road_id = 4) — Very high fatals
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
(4, 18, 9, 5, 2021),
(4, 22, 11, 7, 2022),
(4, 20, 10, 6, 2023);

-- Hadapsar to Magarpatta (road_id = 11) — High traffic corridor
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
(11, 14, 6, 3, 2021),
(11, 16, 8, 4, 2022),
(11, 15, 7, 3, 2023);

-- Katraj Tunnel Entry (road_id = 38) — Notorious stretch
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
(38, 20, 12, 8, 2021),
(38, 25, 14, 9, 2022),
(38, 22, 13, 7, 2023);

-- Pune Station to Hadapsar (road_id = 10)
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
(10, 16, 7, 4, 2021),
(10, 18, 9, 5, 2022),
(10, 17, 8, 4, 2023);

-- Baner Road to Wakad (road_id = 22)
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
(22, 12, 5, 2, 2021),
(22, 14, 6, 3, 2022),
(22, 13, 5, 2, 2023);

-- Pimpri to Bhosari (road_id = 26) — MIDC truck route
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
(26, 19, 10, 6, 2021),
(26, 21, 11, 7, 2022),
(26, 20, 10, 5, 2023);

-- Nigdi to Ravet (road_id = 36) — Highway merge
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
(36, 15, 7, 4, 2021),
(36, 17, 8, 5, 2022),
(36, 16, 7, 4, 2023);

-- Ravet to Dehu Road (road_id = 37) — NH zone
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
(37, 18, 9, 6, 2021),
(37, 20, 11, 7, 2022),
(37, 19, 10, 6, 2023);


-- ============================================================
-- STEP 3: Refresh all risk scores after new inserts
-- ============================================================
UPDATE roads r
SET risk_score = sub.total_risk
FROM (
    SELECT road_id,
           SUM(minor_count * 1 + major_count * 3 + fatal_count * 5) AS total_risk
    FROM accidents
    GROUP BY road_id
) sub
WHERE r.id = sub.road_id;


-- ============================================================
-- STEP 4: Verification
-- ============================================================
SELECT 
    (SELECT COUNT(*) FROM nodes)     AS total_nodes,
    (SELECT COUNT(*) FROM roads)     AS total_roads,
    (SELECT COUNT(*) FROM accidents) AS total_accident_records,
    (SELECT SUM(minor_count + major_count + fatal_count) FROM accidents) AS total_incident_count;
