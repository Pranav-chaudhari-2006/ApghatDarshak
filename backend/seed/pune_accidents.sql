-- ============================================================
-- GuardianRoute — Pune Accident Blackspot Seed Data
-- 50 real Pune road locations with accident records
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- 1. Create tables if not exist
CREATE TABLE IF NOT EXISTS nodes (
    id SERIAL PRIMARY KEY,
    name TEXT,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS roads (
    id SERIAL PRIMARY KEY,
    name TEXT,
    start_node_id INT REFERENCES nodes(id),
    end_node_id INT REFERENCES nodes(id),
    distance FLOAT NOT NULL,  -- km
    risk_score FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accidents (
    id SERIAL PRIMARY KEY,
    road_id INT REFERENCES roads(id),
    minor_count INT DEFAULT 0,
    major_count INT DEFAULT 0,
    fatal_count INT DEFAULT 0,
    year INT DEFAULT 2024
);

-- ============================================================
-- 2. Insert 50 Pune Nodes (real road junctions / areas)
-- ============================================================
INSERT INTO nodes (name, latitude, longitude) VALUES
-- Central Pune
('Shivajinagar Junction',           18.5314, 73.8446),
('Deccan Gymkhana',                 18.5162, 73.8412),
('Pune Railway Station',            18.5280, 73.8740),
('Swargate Bus Stand',              18.5021, 73.8602),
('Katraj Circle',                   18.4580, 73.8640),
-- Kothrud / Warje
('Kothrud Depot',                   18.5089, 73.8176),
('Chandni Chowk Kothrud',           18.5000, 73.7980),
('Warje Malwadi Junction',          18.4757, 73.8030),
('Paud Road Junction',              18.5060, 73.8100),
('Bavdhan Junction',                18.5162, 73.7795),
-- Hadapsar / Kondhwa
('Hadapsar Junction',               18.5027, 73.9255),
('Magarpatta City Gate',            18.5168, 73.9253),
('Kondhwa Road Junction',           18.4680, 73.8860),
('NIBM Road Circle',                18.4600, 73.8912),
('Undri Chowk',                     18.4440, 73.8990),
-- Pune-Solapur Highway
('Manjari Junction',                18.5070, 74.0010),
('Wagholi Chowk',                   18.5645, 74.0100),
('Kharadi Bypass Junction',         18.5527, 73.9496),
('Viman Nagar Circle',              18.5679, 73.9143),
('Kalyani Nagar Junction',          18.5465, 73.9020),
-- Pimpri-Chinchwad
('Pimpri Chowk',                    18.6279, 73.8020),
('Chinchwad Station',               18.6479, 73.7984),
('Bhosari MIDC Junction',           18.6514, 73.8451),
('Akurdi Junction',                 18.6459, 73.7682),
('Nigdi Circle',                    18.6694, 73.7750),
-- Hinjewadi / Wakad
('Hinjewadi Phase 1 Gate',          18.5912, 73.7375),
('Wakad Chowk',                     18.6007, 73.7618),
('Baner Road Junction',             18.5601, 73.7873),
('Aundh Circle',                    18.5589, 73.8089),
('Sus Road Junction',               18.5712, 73.7724),
-- Yerwada / Nagar Road
('Yerwada Junction',                18.5534, 73.9077),
('Nagar Road Kharadi',              18.5520, 73.9418),
('Airport Rd Chowk',                18.5821, 73.9198),
('Lohegaon Junction',               18.5967, 73.9315),
('Dhanori Circle',                  18.5750, 73.9045),
-- Pune-Nashik Highway
('Alandi Road Junction',            18.6598, 73.8680),
('Vishrantwadi Chowk',              18.5895, 73.8890),
('Kalewadi Junction',               18.6200, 73.7900),
('Ravet Circle',                    18.6440, 73.7540),
('Dehu Road Junction',              18.6880, 73.7380),
-- Katraj / Satara Road
('Katraj Tunnel Entry',             18.4510, 73.8580),
('Narhe Junction',                  18.4614, 73.8181),
('Ambegaon BK Chowk',               18.4440, 73.8400),
('Dhayari Circle',                  18.4503, 73.8017),
('Vadgaon BK Junction',             18.4700, 73.8080),
-- Sinhagad Road
('Sinhagad Road Circle',            18.4820, 73.8210),
('Anand Nagar Junction',            18.4930, 73.8140),
('Hingne Khurd',                    18.4744, 73.8277),
('Market Yard Junction',            18.5046, 73.8530),
('Dandekar Bridge',                 18.5124, 73.8530);


-- ============================================================
-- 3. Insert 50 Roads connecting the nodes
-- ============================================================
INSERT INTO roads (name, start_node_id, end_node_id, distance) VALUES
('Shivajinagar to Deccan',          1, 2, 1.8),
('Shivajinagar to Pune Station',    1, 3, 2.1),
('Deccan to Swargate',              2, 4, 2.8),
('Swargate to Katraj',              4, 5, 5.2),
('Deccan to Kothrud',               2, 6, 3.0),
('Kothrud to Chandni Chowk',        6, 7, 2.2),
('Chandni Chowk to Warje',          7, 8, 2.5),
('Kothrud to Paud Road',            6, 9, 1.5),
('Paud Road to Bavdhan',            9, 10, 3.2),
('Pune Station to Hadapsar',        3, 11, 9.0),
('Hadapsar to Magarpatta',          11, 12, 1.8),
('Swargate to Kondhwa',             4, 13, 4.1),
('Kondhwa to NIBM',                 13, 14, 1.4),
('NIBM to Undri',                   14, 15, 2.2),
('Hadapsar to Manjari',             11, 16, 4.5),
('Manjari to Wagholi',              16, 17, 5.2),
('Kharadi Bypass to Viman Nagar',   18, 19, 3.1),
('Viman Nagar to Kalyani Nagar',    19, 20, 2.0),
('Kalyani Nagar to Shivajinagar',   20, 1, 4.5),
('Shivajinagar to Aundh',           1, 29, 4.0),
('Aundh to Baner',                  29, 28, 2.2),
('Baner to Wakad',                  28, 27, 3.5),
('Wakad to Hinjewadi',              27, 26, 3.0),
('Hinjewadi to Sus Road',           26, 30, 2.0),
('Aundh to Pimpri Chowk',          29, 21, 6.5),
('Pimpri to Chinchwad',             21, 22, 2.8),
('Pimpri to Bhosari',               21, 23, 4.2),
('Chinchwad to Akurdi',             22, 24, 2.5),
('Akurdi to Nigdi',                 24, 25, 3.1),
('Pune Station to Yerwada',         3, 31, 3.5),
('Yerwada to Kharadi',              31, 32, 4.0),
('Airport Rd to Lohegaon',          33, 34, 2.3),
('Lohegaon to Dhanori',             34, 35, 1.8),
('Dhanori to Vishrantwadi',         35, 37, 2.5),
('Vishrantwadi to Alandi Rd',       37, 36, 3.8),
('Alandi Rd to Bhosari',           36, 23, 2.5),
('Nigdi to Ravet',                  25, 39, 3.2),
('Ravet to Dehu Road',              39, 40, 4.5),
('Kalewadi to Pimpri',              38, 21, 3.0),
('Katraj to Katraj Tunnel',         5, 41, 0.8),
('Katraj to Narhe',                 5, 42, 3.2),
('Narhe to Ambegaon',               42, 43, 2.1),
('Ambegaon to Dhayari',             43, 44, 1.8),
('Dhayari to Vadgaon BK',           44, 45, 1.5),
('Sinhagad Rd Circle to Anand Ngr', 46, 47, 1.6),
('Anand Nagar to Hingne Khurd',     47, 48, 1.8),
('Hingne Khurd to Warje',           48, 8, 2.0),
('Market Yard to Swargate',         49, 4, 1.2),
('Dandekar Bridge to Deccan',       50, 2, 1.5),
('Market Yard to Shivajinagar',     49, 1, 2.5);


-- ============================================================
-- 4. Insert 50 Accident Records
-- Risk = (minor*1) + (major*3) + (fatal*5)
-- Threshold for blackspot: Risk > 10
-- ============================================================
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year) VALUES
-- High Risk Blackspots (Risk > 15)
(4,  5, 4, 2, 2024),  -- Swargate to Katraj         Risk=5+12+10=27 ⚠️ BLACKSPOT
(10, 3, 5, 3, 2024),  -- Pune Station to Hadapsar   Risk=3+15+15=33 ⚠️ BLACKSPOT
(12, 4, 3, 2, 2024),  -- Swargate to Kondhwa         Risk=4+ 9+10=23 ⚠️ BLACKSPOT
(25, 6, 4, 2, 2024),  -- Aundh to Pimpri             Risk=6+12+10=28 ⚠️ BLACKSPOT
(16, 2, 4, 3, 2024),  -- Manjari to Wagholi          Risk=2+12+15=29 ⚠️ BLACKSPOT
(39, 3, 5, 2, 2024),  -- Kalewadi to Pimpri          Risk=3+15+10=28 ⚠️ BLACKSPOT
(38, 4, 3, 3, 2024),  -- Ravet to Dehu Road          Risk=4+ 9+15=28 ⚠️ BLACKSPOT
(41, 5, 6, 4, 2024),  -- Katraj to Narhe             Risk=5+18+20=43 ⚠️ BLACKSPOT
(17, 2, 3, 3, 2024),  -- Kharadi Bypass              Risk=2+ 9+15=26 ⚠️ BLACKSPOT
(30, 3, 4, 2, 2024),  -- Pune Station to Yerwada     Risk=3+12+10=25 ⚠️ BLACKSPOT
-- Medium Risk (Risk 5–15)
(1,  3, 2, 1, 2024),  -- Shivajinagar-Deccan         Risk=3+6+5=14
(2,  2, 2, 1, 2024),  -- Shivajinagar-Station        Risk=2+6+5=13
(3,  4, 2, 0, 2024),  -- Deccan to Swargate          Risk=4+6+0=10
(5,  3, 2, 1, 2024),  -- Deccan to Kothrud           Risk=3+6+5=14
(6,  2, 2, 0, 2024),  -- Kothrud to Chandni Chowk   Risk=2+6+0= 8
(7,  3, 1, 1, 2024),  -- Chandni to Warje            Risk=3+3+5=11
(8,  2, 2, 0, 2024),  -- Kothrud to Paud Road        Risk=2+6+0= 8
(9,  4, 2, 1, 2024),  -- Paud Road to Bavdhan        Risk=4+6+5=15
(11, 2, 1, 1, 2024),  -- Hadapsar to Magarpatta      Risk=2+3+5=10
(13, 3, 2, 0, 2024),  -- Kondhwa to NIBM             Risk=3+6+0= 9
(14, 2, 1, 0, 2024),  -- NIBM to Undri               Risk=2+3+0= 5
(15, 3, 2, 1, 2024),  -- Hadapsar to Manjari         Risk=3+6+5=14
(18, 4, 2, 1, 2024),  -- Viman Nagar to Kalyani      Risk=4+6+5=15
(19, 3, 2, 1, 2024),  -- Kalyani to Shivajinagar     Risk=3+6+5=14
(20, 2, 2, 0, 2024),  -- Shivajinagar to Aundh       Risk=2+6+0= 8
-- Lower Risk (Risk < 8)
(21, 1, 1, 0, 2024),  -- Aundh to Baner              Risk=1+3+0= 4
(22, 2, 1, 0, 2024),  -- Baner to Wakad              Risk=2+3+0= 5
(23, 3, 1, 0, 2024),  -- Wakad to Hinjewadi          Risk=3+3+0= 6
(24, 1, 1, 0, 2024),  -- Hinjewadi to Sus Road       Risk=1+3+0= 4
(26, 2, 2, 0, 2024),  -- Pimpri to Chinchwad         Risk=2+6+0= 8
(27, 3, 2, 0, 2024),  -- Pimpri to Bhosari           Risk=3+6+0= 9
(28, 2, 1, 0, 2024),  -- Chinchwad to Akurdi         Risk=2+3+0= 5
(29, 1, 1, 0, 2024),  -- Akurdi to Nigdi             Risk=1+3+0= 4
(31, 2, 1, 0, 2024),  -- Yerwada to Kharadi          Risk=2+3+0= 5
(32, 1, 1, 0, 2024),  -- Airport to Lohegaon         Risk=1+3+0= 4
(33, 2, 1, 0, 2024),  -- Lohegaon to Dhanori         Risk=2+3+0= 5
(34, 1, 1, 0, 2024),  -- Dhanori to Vishrantwadi     Risk=1+3+0= 4
(35, 2, 2, 0, 2024),  -- Vishrantwadi to Alandi      Risk=2+6+0= 8
(36, 3, 1, 1, 2024),  -- Alandi to Bhosari           Risk=3+3+5=11
(37, 2, 1, 0, 2024),  -- Nigdi to Ravet              Risk=2+3+0= 5
(40, 1, 1, 0, 2024),  -- Katraj to Tunnel            Risk=1+3+0= 4
(42, 3, 1, 0, 2024),  -- Narhe to Ambegaon           Risk=3+3+0= 6
(43, 2, 1, 0, 2024),  -- Ambegaon to Dhayari         Risk=2+3+0= 5
(44, 1, 1, 0, 2024),  -- Dhayari to Vadgaon          Risk=1+3+0= 4
(45, 2, 1, 0, 2024),  -- Sinhagad to Anand Nagar     Risk=2+3+0= 5
(46, 1, 1, 0, 2024),  -- Anand Nagar to Hingne Khurd Risk=1+3+0= 4
(47, 2, 1, 0, 2024),  -- Hingne Khurd to Warje       Risk=2+3+0= 5
(48, 1, 1, 0, 2024),  -- Market Yard to Swargate     Risk=1+3+0= 4
(49, 2, 1, 0, 2024),  -- Dandekar Bridge to Deccan   Risk=2+3+0= 5
(50, 2, 1, 0, 2024);  -- Market Yard to Shivajinagar Risk=2+3+0= 5


-- ============================================================
-- 5. Update risk_score on roads table based on accident data
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
-- Verify: Show top blackspots (risk > 10)
-- ============================================================
SELECT r.name, r.distance, r.risk_score,
       a.minor_count, a.major_count, a.fatal_count
FROM roads r
JOIN accidents a ON a.road_id = r.id
WHERE r.risk_score > 10
ORDER BY r.risk_score DESC;
