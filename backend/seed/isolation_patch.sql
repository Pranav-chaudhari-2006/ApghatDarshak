-- ============================================================
-- ApghatDarshak — Isolation Patch
-- Connects the 11 remaining isolated nodes to the main graph.
-- Run in Supabase SQL Editor after graph_expansion_v2.sql
-- ============================================================

INSERT INTO roads (name, start_node_id, end_node_id, distance)
SELECT v.name, v.s, v.e, v.d
FROM (VALUES
  -- [523] Bund Garden East End  → Race Course [522] + Koregaon Park North [593]
  ('Bund Garden East to Race Course',      523, 522, 0.9),
  ('Bund Garden East to KP North',         523, 593, 0.7),

  -- [529] New Katraj Tunnel Exit → Katraj Bypass Toll [535]
  ('New Katraj Exit to Bypass Toll',       529, 535, 0.8),

  -- [612] Ganeshkhind Road Cross → Chatushrungi [505] + Shivajinagar [1]
  ('Ganeshkhind to Chatushrungi',          612, 505, 0.6),
  ('Ganeshkhind to Shivajinagar',          612,   1, 1.0),

  -- [613] Agricultural College Gate → Ganeshkhind [612] + SB Road [506]
  ('Agri College to Ganeshkhind',          613, 612, 0.4),
  ('Agri College to SB Road',             613, 506, 0.8),

  -- [621] Navale Bridge Crossing → Sinhagad Rd [682] + Narhe [42]
  ('Navale Bridge to Sinhagad Rd',         621, 682, 1.2),
  ('Navale Bridge to Narhe',               621,  42, 2.5),

  -- [646] Moshi High Street → Moshi Alandi [628] + Bhosari [23]
  ('Moshi High St to Moshi Alandi',        646, 628, 1.2),
  ('Moshi High St to Bhosari',             646,  23, 4.5),

  -- [651] Abhimanshree Society → Pashan Sus [674] + Baner [28]
  ('Abhimanshree to Pashan Sus',           651, 674, 1.5),
  ('Abhimanshree to Baner',               651,  28, 2.0),

  -- [662] Wipro Phase 2 Hub → Hinjewadi Ph2 [658] + Ph3 [659]
  ('Wipro Ph2 to Hinjewadi Ph2',           662, 658, 0.6),
  ('Wipro Ph2 to Hinjewadi Ph3',           662, 659, 0.8),

  -- [672] Kiwale Ravet Underpass → Kiwale Bypass [552] + Ravet Basket [639]
  ('Kiwale Underpass to Bypass',           672, 552, 0.5),
  ('Kiwale Underpass to Ravet Basket',     672, 639, 0.8),

  -- [676] Bhosari Charholi Road → Bhosari MIDC [23] + Charsholi [632]
  ('Bhosari Charholi to Bhosari',          676,  23, 1.5),
  ('Bhosari Charholi to Charsholi',        676, 632, 2.5),

  -- [689] Alka Talkies Chowk → Deccan [2] + Tilak Rd [513]
  ('Alka Talkies to Deccan',               689,   2, 0.8),
  ('Alka Talkies to Tilak Rd',             689, 513, 0.7)

) AS v(name, s, e, d)
JOIN nodes ns ON ns.id = v.s
JOIN nodes ne ON ne.id = v.e;

-- Seed accidents for new roads
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year)
SELECT id, floor(random()*4)::int, floor(random()*2)::int,
       (CASE WHEN random() > 0.9 THEN 1 ELSE 0 END), 2024
FROM roads
WHERE id NOT IN (SELECT DISTINCT road_id FROM accidents);

-- Refresh risk scores
UPDATE roads r
SET risk_score = sub.total_risk
FROM (
    SELECT road_id, SUM(minor_count + major_count*3 + fatal_count*5) AS total_risk
    FROM accidents GROUP BY road_id
) sub
WHERE r.id = sub.road_id;

-- Verify: isolated_nodes should be 0
SELECT
  (SELECT COUNT(*) FROM nodes)     AS total_nodes,
  (SELECT COUNT(*) FROM roads)     AS total_roads,
  (SELECT COUNT(*) FROM nodes n WHERE NOT EXISTS (
      SELECT 1 FROM roads r
      WHERE r.start_node_id = n.id OR r.end_node_id = n.id
  ))                               AS isolated_nodes;
