-- ============================================================
-- ApghatDarshak — Graph Expansion v2  (SAFE VERSION)
-- All new nodes use explicit IDs starting at 500
-- (well above current max of 188).
-- Roads use INSERT ... SELECT ... JOIN so missing FK pairs
-- are silently skipped (no FK violation errors).
--
-- Run in Supabase SQL Editor.
-- ============================================================

-- ── STEP 0: Advance the serial sequence past our explicit IDs ──
SELECT setval('nodes_id_seq', GREATEST((SELECT MAX(id) FROM nodes), 700), true);


-- ────────────────────────────────────────────────────────────
-- STEP 1: NEW NODES (explicit IDs 500–699)
-- ────────────────────────────────────────────────────────────
INSERT INTO nodes (id, name, latitude, longitude) VALUES

-- ── Central Pune missing connectors ──────────────────────────
(500, 'FC Road Cross Shivajinagar',    18.5230, 73.8400),
(501, 'Law College Road Cross',        18.5170, 73.8320),
(502, 'Karve Road Nalstop',            18.5080, 73.8220),
(503, 'JM Road Jangali Maharaj',       18.5230, 73.8360),
(504, 'Balgandharva Ranga Mandir',     18.5280, 73.8440),
(505, 'Chatushrungi Temple Road',      18.5450, 73.8380),
(506, 'Senapati Bapat Road Jn',        18.5350, 73.8350),
(507, 'Erandwane Circle',              18.5100, 73.8270),
(508, 'Model Colony Gate',             18.5260, 73.8260),
(509, 'Deccan Bus Stop'  ,             18.5171, 73.8402),
(510, 'Paud Phata Bus Stop',           18.5065, 73.8050),
(511, 'Karve Nagar Cross',             18.5030, 73.8200),
(512, 'Vitthalwadi Kothrud',           18.5010, 73.8090),
(513, 'Tilak Road Junction',           18.5130, 73.8600),
(514, 'Sakal Chowk',                   18.5210, 73.8640),

-- ── Baner / Balewadi / Pimple area ───────────────────────────
(515, 'Baner Gaon Primary School',     18.5560, 73.7860),
(516, 'Baner-Sus Road Crossing',       18.5480, 73.7760),
(517, 'Aundh-Baner Link Road',         18.5700, 73.8010),
(518, 'Pimple Saudagar Phata',         18.5900, 73.8000),
(519, 'Wakad Back Gate',               18.6050, 73.7700),
(520, 'Rahatani Gaon Chowk',           18.6150, 73.7850),
(521, 'Thergaon High Street',          18.6180, 73.7720),

-- ── Yerwada / Race Course / Bund Garden ──────────────────────
(522, 'Race Course Road Corner',       18.5430, 73.8850),
(523, 'Bund Garden East End',          18.5340, 73.8950),
(524, 'Penal Colony Yerwada',          18.5598, 73.9070),
(525, 'Mundhwa Gaon Main Road',        18.5295, 73.9195),

-- ── Katraj / Narhe expanded chain ────────────────────────────
(526, 'Narhe Ambegaon Link',           18.4550, 73.8280),
(527, 'Padmavati Colony',              18.4700, 73.8350),
(528, 'Hingane Khurd Sinhagad Jn',     18.4710, 73.8200),
(529, 'New Katraj Tunnel Exit',        18.3980, 73.8510),

-- ── Hadapsar / Solapur Road extended ─────────────────────────
(530, 'Solapur Road Toll Hadapsar',    18.4900, 73.9620),
(531, 'Ramwadi Solapur Rd Circle',     18.5005, 73.9750),
(532, 'Phursungi Toll Plaza',          18.4780, 73.9850),
(533, 'Loni Kalbhor Bridge',           18.4710, 74.0100),
(534, 'Ranjangaon Circle NH-65',       18.4550, 74.0940),

-- ── Satara Road / NH-48 South ────────────────────────────────
(535, 'Katraj Bypass Toll',            18.4050, 73.8520),
(536, 'Uruli Kanchan Junction',        18.3680, 73.9000),
(537, 'Saswad Junction',               18.3316, 73.9976),
(538, 'Jejuri Phata NH-48',            18.2862, 74.0000),
(539, 'Dive Ghat Top',                 18.2250, 74.0200),
(540, 'Khed Shivapur Toll',            18.2780, 73.8970),
(541, 'Satara City Entry',             17.6880, 74.0000),
(542, 'Wai Junction NH-48',            17.9520, 73.8950),
(543, 'Panchgani Station Road',        17.9230, 73.7960),
(544, 'Mahabaleshwar Entry',           17.9240, 73.6570),
(545, 'Medha Ghat Entry',              17.8150, 73.7800),
(546, 'Chiplun City Center',           17.5380, 73.5150),

-- ── NH-48 West / Mumbai Expressway ───────────────────────────
(547, 'Chandni Chowk Flyover',         18.5010, 73.7780),
(548, 'Wakad NH-48 On-ramp',           18.5980, 73.7430),
(549, 'Dange Chowk NH-48',             18.6100, 73.7550),
(550, 'Chinchwad Flyover NH-48',       18.6440, 73.8120),
(551, 'Bhosari NH-48 Toll',            18.6700, 73.8380),
(552, 'Kiwale Bypass',                 18.6620, 73.7320),
(553, 'Talegaon Junction',             18.7280, 73.6780),
(554, 'Kamshet Station Road',          18.7600, 73.5250),
(555, 'Lonavala Entry Point',          18.7520, 73.4050),

-- ── Pune–Nashik Highway (NH-60 North) ────────────────────────
(556, 'Nashik Phata Main Circle',      18.6280, 73.8230),
(557, 'Chakan Phata',                  18.7580, 73.8550),
(558, 'Rajgurunagar Phata',            18.8550, 73.8870),

-- ── Pune–Solapur Highway (NH-65 East) ────────────────────────
(559, 'Loni Kalbhor Toll Exit',        18.4700, 74.0280),
(560, 'Bakori Road Junction',          18.6020, 74.0580),
(561, 'Shikrapur Phata Nagar Rd',      18.7050, 74.1250),
(562, 'Koregaon Bhima',                18.6800, 74.1770),

-- ── Airport expanded ─────────────────────────────────────────
(563, 'Pune Airport Terminal West',    18.5822, 73.9197),
(564, 'Nagar Road Near Airport',       18.5950, 73.9350),
(565, 'Wagholi Bypass Bridge',         18.5700, 74.0320),

-- ── Pimpri-Chinchwad expanded ────────────────────────────────
(566, 'Talawade IT Park',              18.6380, 73.8120),
(567, 'PCMC New Town Sector',          18.6150, 73.7980),
(568, 'Bharat Nagar Chinchwad',        18.6580, 73.8010),
(569, 'Old Mumbai Pune Rd Dehu',       18.7120, 73.7210),
(570, 'Dehu Cantonment Board',         18.7050, 73.7550),

-- ── West Pune / Mulshi / Lavasa ──────────────────────────────
(571, 'Pirangut Junction',             18.4900, 73.6750),
(572, 'Mulshi Dam Entry',              18.5180, 73.5680),
(573, 'Lavasa Hill Station Gate',      18.4020, 73.5050),
(574, 'Tamhini Ghat Top',              18.3850, 73.4380),

-- ── Wagholi / Nagar Rd extended ──────────────────────────────
(575, 'Wagholi Market Yard',           18.5750, 74.0050),
(576, 'Wagholi Ivy Estate',            18.5820, 74.0150),
(577, 'Kesnand Phata',                 18.5950, 74.0250),

-- ── Lohegaon / Vishrantwadi fixes ────────────────────────────
(578, 'Vishrantwadi Lohegaon Road',    18.6050, 73.9150),
(579, 'Airforce School Lohegaon',      18.5850, 73.9280),

-- ── Undri / Kondhwa chain fixes ──────────────────────────────
(580, 'Cloud 9 Society Undri',         18.4480, 73.9050),
(581, 'Bishop School Undri',           18.4350, 73.8950),
(582, 'Dorabjee Mall NIBM Rd',         18.4650, 73.8980),
(583, 'Kondhwa Budruk Gaon',           18.4550, 73.8780),

-- ── Misc missing links ────────────────────────────────────────
(584, 'Mundhwa Railway Bridge',        18.5350, 73.9350),
(585, 'Passport Seva Kendra RD',       18.5420, 73.9120),
(586, 'Godrej Infinity Mundhwa',       18.5250, 73.9550),
(587, 'Amanora Park Town Gate',        18.5180, 73.9350),
(588, 'Fursungi Phata Village',        18.4850, 73.9550),
(589, 'Salunke Vihar Road',            18.4780, 73.8950),
(590, 'Noble Hospital Hadapsar',       18.5080, 73.9180),
(591, 'Blue Diamond Chowk Camp',       18.5350, 73.8920),
(592, 'Bund Garden Road Bridge',       18.5380, 73.8850),
(593, 'Koregaon Park North Main',      18.5420, 73.8950),
(594, 'ABC Farm Mundhwa',              18.5450, 73.9220),
(595, 'Phoenix Mall Nagar Rd',         18.5630, 73.9240),
(596, 'EON IT Park Phase 1',           18.5520, 73.9650),
(597, 'World Trade Center Kharadi',    18.5510, 73.9550),
(598, 'Zensar IT Park Kharadi',        18.5480, 73.9420),
(599, 'Lohegaon Wagholi Road',         18.6150, 73.9450),
(600, 'Kalyani Nagar Circle 2',        18.5480, 73.9050),
(601, 'Dhanori Gaon Main',             18.5950, 73.9100),
(602, 'Tingre Nagar Entrance',         18.5780, 73.8920),
(603, 'Viman Nagar Datta Mandir',      18.5620, 73.9150),
(604, 'Pune Camp Cantonment Board',    18.5150, 73.8850),
(605, 'Market Yard to Mandai Link',    18.5046, 73.8530),
(606, 'Narayan Peth River Road',       18.5210, 73.8480),
(607, 'Kasba Peth Ganpati',            18.5230, 73.8580),
(608, 'PMC Pune Municipal Corp',       18.5250, 73.8520),
(609, 'Shaniwar Peth Entry',           18.5220, 73.8530),
(610, 'Appa Balwant Chowk',            18.5180, 73.8550),
(611, 'Budhwar Peth Central',          18.5160, 73.8580),
(612, 'Ganeshkhind Road Cross',        18.5350, 73.8420),
(613, 'Agricultural College Gate',     18.5380, 73.8450),
(614, 'Range Hills Entrance',          18.5450, 73.8380),
(615, 'Khadki Railway Station',        18.5610, 73.8320),
(616, 'Bopodi Metro Station',          18.5720, 73.8280),
(617, 'Dapodi Bridge Junction',        18.5780, 73.8250),
(618, 'Pimpri Bhaji Mandai',           18.6280, 73.8050),
(619, 'Kalewadi Phata Bridge',         18.6050, 73.7920),
(620, 'DSK Vishwa Entry',              18.4350, 73.7950),
(621, 'Navale Bridge Crossing',        18.4550, 73.8220),
(622, 'Ambegaon BK Chowk',             18.4440, 73.8400),
(623, 'Dhayari Circle',                18.4503, 73.8017),
(624, 'Vadgaon BK Junction',           18.4700, 73.8080),
(625, 'Bharti Vidyapeeth Gate',        18.4580, 73.8520),
(626, 'Satara Rd Toll Swargate',       18.4950, 73.8550),
(627, 'Alandi Temple Entrance',        18.6750, 73.8950),
(628, 'Moshi Alandi High Street',      18.6850, 73.8850),
(629, 'Indrayani Nagar Bhosari',       18.6550, 73.8580),
(630, 'Chikhali Chowk MIDC',           18.6780, 73.8150),
(631, 'Kudalwadi MIDC Gate',           18.6650, 73.8250),
(632, 'Charsholi Phata',               18.6550, 73.9150),
(633, 'Sambhajinagar Chinchwad',       18.6650, 73.7980),
(634, 'Pradhikaran Sector 25',         18.6580, 73.7720),
(635, 'Nigdi Authority Circle',        18.6650, 73.7780),
(636, 'Nigdi Main Bus Terminus',       18.6680, 73.7750),
(637, 'Yamunagar Nigdi',               18.6750, 73.7850),
(638, 'Mamurdi Village Entrance',      18.6680, 73.7350),
(639, 'Ravet Basket Bridge',           18.6480, 73.7420),
(640, 'Sentosa Resort Entry',          18.6650, 73.7150),
(641, 'Punawale Main Road',            18.6250, 73.7450),
(642, 'Lotus Business School NH48',    18.6420, 73.7650),
(643, 'Empire Estate Flyover',         18.6320, 73.8030),
(644, 'Tata Motors Gate 1',            18.6450, 73.8250),
(645, 'Landewadi Chowk',               18.6280, 73.8350),
(646, 'Moshi High Street',             18.6750, 73.8550),
(647, 'Spine Road Junction PCMC',      18.6680, 73.8420),
(648, 'Alandi Phata Bhosari',          18.6150, 73.8520),
(649, 'Manjari Junction Solapur Rd',   18.5070, 74.0010),
(650, 'Pashan Lake Entry',             18.5350, 73.7850),
(651, 'Abhimanshree Society',          18.5400, 73.8150),
(652, 'Pancard Club Road',             18.5650, 73.8010),
(653, 'Balewadi High Street',          18.5786, 73.7745),
(654, 'Cummins India Office',          18.5662, 73.7735),
(655, 'Jupiter Hospital Baner Rd',     18.5580, 73.7920),
(656, 'NICMAR Balewadi',               18.5900, 73.7650),
(657, 'Balewadi Stadium Area',         18.5750, 73.7550),
(658, 'Hinjewadi Phase 2 Circle',      18.5830, 73.7120),
(659, 'Hinjewadi Phase 3 Hub',         18.5810, 73.6950),
(660, 'Infosys Phase 1 Gate',          18.5950, 73.7310),
(661, 'Mezza 9 Junction Hinjewadi',    18.5940, 73.7460),
(662, 'Wipro Phase 2 Hub',             18.5880, 73.7080),
(663, 'Indira College Wakad',          18.6050, 73.7550),
(664, 'Ginger Hotel Wakad',            18.5980, 73.7600),
(665, 'Roseland Residency',            18.5950, 73.7850),
(666, 'Shivar Chowk Wakad',            18.5976, 73.7936),
(667, 'Kokanane Chowk Pimple',         18.5950, 73.8050),
(668, 'Govind Garden Chowk',           18.5920, 73.7980),
(669, 'Pimple Nilakh Junction',        18.5750, 73.7950),
(670, 'Rakshak Chowk Aundh',           18.5850, 73.8120),
(671, 'Hinjewadi IT Park Ph3 Rd',      18.5750, 73.6820),
(672, 'Kiwale Ravet Underpass',        18.6520, 73.7380),
(673, 'Sus Gaon Main Chowk',           18.5410, 73.7450),
(674, 'Pashan Sus Junction',           18.5450, 73.7850),
(675, 'Moshi Phata NH60 Junction',     18.7050, 73.8680),
(676, 'Bhosari Charholi Road',         18.6620, 73.8780),
(677, 'Goliabar Maidan Camp',          18.5080, 73.8750),
(678, 'Seven Loves Chowk',             18.5050, 73.8680),
(679, 'Mukund Nagar Entry',            18.5020, 73.8550),
(680, 'Laxmi Road Ganpati Cross',      18.5150, 73.8520),
(681, 'Bibvewadi Junction',            18.4920, 73.8460),
(682, 'Sinhagad Rd Vanaz Cross',       18.5005, 73.8160),
(683, 'Anand Nagar Junction',          18.4930, 73.8140),
(684, 'Hingne Khurd Village',          18.4744, 73.8277),
(685, 'SNDT College Karve Road',       18.5120, 73.8280),
(686, 'Ideal Colony Kothrud',          18.5150, 73.8180),
(687, 'Vanaz Corner Metro',            18.5080, 73.8080),
(688, 'MIT WPU University Gate',       18.5180, 73.8150),
(689, 'Alka Talkies Chowk',            18.5120, 73.8450),
(690, 'Bavdhan Junction Cross',        18.5162, 73.7795),
(691, 'Warje Bridge Flyover',          18.4850, 73.8120),
(692, 'Mai Mangeshkar Hospital',       18.4980, 73.8180)
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- STEP 2: ROADS — FK-safe insert via JOIN
-- Silently skips any road if either endpoint node is missing.
-- ────────────────────────────────────────────────────────────

INSERT INTO roads (name, start_node_id, end_node_id, distance)
SELECT v.name, v.s, v.e, v.d
FROM (VALUES

-- ══ Central Pune internal grid (new nodes 500–514) ══════════
('Shivajinagar to FC Road',          1,   500,  0.7),
('FC Road to Law College Rd',        500, 501,  0.6),
('Law College Rd to Karve Nalstop',  501, 502,  0.9),
('Karve Nalstop to Deccan',          502, 509,  0.5),
('Deccan to JM Road',                509, 503,  0.4),
('JM Road to Shivajinagar',          503,   1,  0.8),
('Shivajinagar to Balgandharva',       1, 504,  0.7),
('Balgandharva to FC Road',          504, 500,  0.5),
('Shivajinagar to SB Road',            1, 506,  1.1),
('SB Road to Chatushrungi',          506, 505,  1.2),
('FC Road to Symbiosis',             500, 508,  0.8),
('Senapati Bapat to Range Hills',    506, 614,  2.5),
('Aundh to Chatushrungi',             29, 505,  1.5),
('Tilak Rd to Station',              513,   3,  0.9),
('Tilak Rd to Sakal Chowk',          513, 514,  0.4),

-- ══ Deccan / Karve Road chain ════════════════════════════════
('Deccan to Law Coll Rd',              2, 501,  0.7),
('Deccan to Erandwane',                2, 507,  0.9),
('Erandwane to Model Colony',        507, 508,  0.7),
('Model Colony to SB Road',          508, 506,  1.5),
('Karve Nalstop to SNDT',            502, 685,  0.6),
('SNDT to Vanaz',                    685, 687,  0.4),
('Vanaz to Kothrud',                 687,   6,  0.9),
('Karve Nalstop to Karve Nagar',     502, 511,  0.6),
('Karve Nagar to Vitthalwadi',       511, 512,  0.7),
('Vitthalwadi to Paud Phata',        512, 510,  0.5),
('Paud Phata to Kothrud',            510,   6,  0.7),
('MIT WPU to Erandwane',             688, 507,  0.5),
('Kothrud to Ideal Colony',            6, 686,  1.0),
('Ideal Colony to Vanaz',            686, 687,  0.7),
('SNDT to MIT WPU',                  685, 688,  1.4),
('Kothrud to Chandn Chowk',            6,   7,  2.2),
('Chandni to Pirangut Jn',             7, 571,  6.2),
('Bavdhan to Chandni',               690,   7,  2.5),
('Bavdhan to Sus Gaon',              690, 673,  3.5),
('Bavdhan to Pirangut',              690, 571, 12.0),
('Kothrud to Bavdhan',                 6, 690,  3.5),

-- ══ Swargate / Peth chain ════════════════════════════════════
('Station to Tilak Rd',                3, 513,  0.9),
('Station to Appa Balwant',            3, 610,  1.0),
('Appa Balwant to Budhwar Peth',     610, 611,  0.5),
('Budhwar Peth to Mandai',           611,   2,  0.8),
('Mandai to Laxmi Rd',                 2, 680,  0.4),
('Laxmi Rd to Tilak Rd',             680, 513,  0.7),
('Kasba Peth to Shaniwar Peth',      607, 609,  0.5),
('PMC to Kasba Peth',                608, 607,  0.4),
('Shaniwar Peth to Narayan Peth',    609, 606,  0.4),
('Narayan Peth to Deccan',           606,   2,  1.2),
('Swargate to Mukund Nagar',           4, 679,  0.8),
('Swargate to Seven Loves',            4, 678,  0.9),
('Mukund Nagar to Bibvewadi',        679, 681,  1.2),
('Bibvewadi to Sinhagad Rd',         681, 682,  1.8),
('Camp MG Rd to Camp Board',         134, 604,  0.8),
('Goliabar to Mukund Nagar',         677, 679,  0.6),
('Market Yard to Swargate',          605,   4,  1.2),
('Dandekar to Market Yard',           50, 605,  1.2),
('Market Yard to Mandai',            605,   2,  1.5),
('Satara Rd Toll to Swargate',       626,   4,  1.5),

-- ══ Sinhagad Rd / Narhe chain ════════════════════════════════
('Sinhagad Rd to Anand Nagar',       682, 683,  1.6),
('Anand Nagar to Mai Mangeshkar',    683, 692,  2.0),
('Vanaz to Sinhagad Rd',             687, 682,  0.8),
('Sinhagad Rd to Narhe',             682,  42,  3.5),
('Narhe to Ambegaon BK',              42, 622,  2.1),
('Ambegaon to Narhe Link',           526, 622,  1.2),
('Ambegaon to Padmavati',            526, 527,  0.8),
('Padmavati to Katraj',              527,   5,  1.5),
('Hingane Khurd Jn',                 528, 684,  0.8),
('Hingne Khurd to Narhe',            528,  42,  1.5),
('Hingne to Vadgaon BK',             528, 624,  1.2),
('Vadgaon to Dhayari',               624, 623,  1.5),
('Dhayari to Ambegaon',              623, 622,  1.8),
('Dhayari to DSK Vishwa',            623, 620,  2.5),
('DSK to Lavasa Rd',                 620, 573, 22.0),
('Warje Bridge to Sinhagad Rd',      691, 682,  1.2),
('Warje to Hingne Crd v2',             8, 528,  1.5),
('Narhe to Vadgaon BK',               42, 624,  2.2),

-- ══ Katraj south exit / Satara Rd ════════════════════════════
('Katraj Tunnel to Bypass Toll',      41, 535,  1.8),
('Katraj Bypass to Khed Shivapur',   535, 540, 35.0),
('Khed Shivapur to Saswad',          540, 537,  8.0),
('Saswad to Jejuri',                 537, 538,  8.0),
('Jejuri to Dive Ghat',              538, 539, 18.0),
('Dive Ghat to Satara',              539, 541, 50.0),
('Katraj to Satara Rd Toll',           5, 626,  4.5),
('Satara Rd Toll to Khed Shivapur',  626, 540, 12.0),
('Hadapsar to Uruli Kanchan',         11, 536, 12.5),
('Uruli to Saswad',                  536, 537, 11.0),
('Satara to Wai',                    541, 542, 28.0),
('Wai to Panchgani',                 542, 543,  8.0),
('Panchgani to Mahabaleshwar',       543, 544, 12.0),
('Mahabaleshwar to Medha',           544, 545, 15.0),
('Medha Ghat to Chiplun',            545, 546, 55.0),
('Wai to Dive Ghat',                 542, 539, 10.0),
('Bharti Vidyapeeth to Katraj',      625,   5,  1.5),
('Swargate to Bharti Vidyapeeth',      4, 625,  4.0),

-- ══ Kondhwa / NIBM / Undri expansion ════════════════════════
('Kondhwa to Kondhwa Budruk',         13, 583,  1.5),
('Kondhwa Budruk to NIBM Dorabjee',  583, 582,  0.8),
('Dorabjee to NIBM',                 582,  14,  0.8),
('NIBM to Undri',                     14,  15,  2.2),
('Undri to Cloud 9',                  15, 580,  0.9),
('Cloud 9 to Bishop School',         580, 581,  1.2),
('Undri to Fursungi Toll',            15, 532,  3.2),
('Fursungi to Loni Bridge',          532, 533,  2.5),
('Loni Bridge to Loni Toll',         533, 559,  0.5),
('Salunke to Undri',                 589,  15,  2.5),
('Salunke to NIBM',                  589,  14,  2.0),

-- ══ Hadapsar / Solapur Road chain ════════════════════════════
('Hadapsar to Noble Hospital',        11, 590,  1.5),
('Noble to Amanora',                 590, 587,  1.8),
('Amanora to Solapur Toll',          587, 530,  3.5),
('Solapur Toll to Ramwadi',          530, 531,  1.8),
('Ramwadi to Fursungi Toll',         531, 532,  2.2),
('Ramwadi to Loni Bridge',           531, 533,  3.0),
('Loni Bridge to Loni Toll',         533, 559,  0.5),
('Solapur Rd to Ranjangaon Circle',  531, 534, 10.5),
('Ramwadi to Manjari',               531, 649,  3.5),
('Loni to Ranjangaon',               559, 534, 10.0),
('Ranjangaon to Shikrapur',          534, 561, 12.5),
('Fursungi to Hadapsar',             588,  11,  4.5),
('Salunke Vihar Hadapsar',           589,  11,  3.5),
('Magarpatta to Mundhwa',             12, 584,  2.0),

-- ══ East Pune — Mundhwa / Kharadi / Viman Nagar ══════════════
('Kalyani Nagar to Passport',         20, 585,  2.2),
('Passport to Viman Nagar',          585,  19,  1.8),
('Passport to Mundhwa Bridge',       585, 584,  1.5),
('Mundhwa Bridge to Godrej',         584, 586,  2.5),
('Godrej to Fursungi',               586, 588,  3.5),
('Godrej to Ramwadi',                586, 531,  4.0),
('ABC Farm to Mundhwa Gaon',         594, 525,  0.8),
('Mundhwa Gaon to Kharadi',          525,  18,  3.5),
('EON to WTC',                       596, 597,  0.7),
('WTC to Zensar',                    597, 598,  0.5),
('Zensar to Kharadi Bypass',         598,  18,  1.0),
('KP North to Blue Diamond',         593, 591,  1.2),
('Blue Diamond to Bund Garden',      591, 592,  0.5),
('Bund Garden East to Mundhwa',      592, 525,  2.2),
('Viman to Datta Mandir',             19, 603,  0.8),
('Phoenix Mall to Viman',            595,  19,  0.9),
('Tingre to 7-12 Utara',             602, 601,  0.8),
('7-12 Utara to Dhanori Gaon',       601, 601,  1.2),
('Dhanori Gaon to Vishrantwadi',     601,  37,  2.0),
('Penal Colony to Yerwada',          524,  31,  0.8),
('Race Course to Bund Garden',       522, 592,  0.8),
('Bund Garden to KP North',          592, 593,  1.2),
('Yerwada to Penal Colony',           31, 524,  0.8),
('Kalyani Nagar Circle to KN',       600,  20,  0.5),

-- ══ Wagholi corridor ═════════════════════════════════════════
('Wagholi Market to Ivy',            575, 576,  1.2),
('Ivy Estate to Kesnand',            576, 577,  2.0),
('Kesnand to Lohegaon Wagholi',      577, 599,  4.5),
('Wagholi to Bakori Rd',             575, 560,  5.0),
('Wagholi Bypass to Nagar Rd',       565,  32,  4.5),
('Nagar Rd to Wagholi',               32, 575,  4.0),
('Wagholi Market to Manjari',        575, 649,  5.5),

-- ══ Airport / Lohegaon chain ═════════════════════════════════
('Airport Terminal to Road',         563,  33,  0.5),
('Airport to Nagar Rd',              563, 564,  2.5),
('Nagar Rd Airport to Lohegaon',     564,  34,  1.0),
('Dhanori to Lohegaon',               35,  34,  1.8),
('Lohegaon to Vishrantwadi',          34,  37,  3.0),
('Vishrantwadi Lohegaon v2',         578,  37,  1.5),
('Airforce to Lohegaon',             579,  34,  1.5),
('Vishrantwadi to Airforce',          37, 579,  2.0),
('Lohegaon to Charsholi',             34, 632,  4.5),
('Charsholi to Bhosari',             632,  23,  4.0),

-- ══ Aundh / Baner / Pimple Saudagar ═════════════════════════
('Aundh to Bopodi',                   29, 616,  3.2),
('Bopodi to Khadki',                 616, 615,  1.2),
('Khadki to Range Hills',            615, 614,  1.5),
('Range Hills to Shivajinagar',      614,   1,  3.8),
('Dapodi to Bopodi',                 617, 616,  1.5),
('Baner to Baner Gaon',               28, 515,  0.8),
('Baner Gaon to Sus Cross',          515, 516,  0.9),
('Aundh-Baner Link',                 517,  29,  1.2),
('Aundh-Baner to Baner',             517,  28,  0.8),
('Pimple Saud to Wakad',             518,  27,  1.5),
('Pimple Saud to Baner',             518,  28,  1.2),
('Wakad Back Gate to Hinjewadi',     519,  26,  2.5),
('Wakad Back Gate to Wakad',         519,  27,  0.8),
('Rakshak to Bopodi',                670, 616,  1.2),
('Rakshak to Aundh',                 670,  29,  1.0),
('Kalewadi v2 to Pimpri',            619,  21,  3.0),
('Kalewadi to Baner',                619,  28,  3.5),
('Kalewadi to Rahatani',             619, 520,  1.0),
('Rahatani to Pimple Saud',          520, 518,  1.5),
('Thergaon to Wakad Back',           521, 519,  1.5),
('Thergaon to Dange Chowk',          521, 549,  1.5),
('Pimpri Bhaji Mandai to Kalewadi',  618,  21,  1.5),
('Kalewadi Phata to Rahatani',       618, 520,  1.2),
('Pimple Nilakh to Baner',           669,  28,  1.5),
('Govind Garden to Pimple Nilakh',   668, 669,  1.0),
('Shivar to Govind Garden',          666, 668,  0.5),
('Roseland to Shivar Chowk',         665, 666,  0.5),
('Ginger Hotel to Wakad NH48',       664, 548,  0.8),
('Ginger Hotel to Indira Wakad',     664, 663,  0.5),
('Kokanane to Nashik Phata',         667, 556,  1.5),
('Govind Garden to Kokanane',        668, 667,  0.5),
('Pimple Nilakh to Balewadi',        669, 653,  1.8),

-- ══ Balewadi west cluster ════════════════════════════════════
('Balewadi to Baner Back',           653, 515,  1.5),
('Cummins to Balewadi',              654, 653,  1.4),
('Pancard Club to Aundh-Baner',      652, 517,  1.0),
('Jupiter to Pancard Club',          655, 652,  0.8),
('Balewadi to Jupiter',              653, 655,  1.5),
('Balewadi High St to Stadium',      653, 657,  1.2),
('Stadium to NICMAR',                657, 656,  0.8),

-- ══ Hinjewadi cluster ════════════════════════════════════════
('Chandni Flyover to Hinjewadi',     547,  26,  3.5),
('Chandni Flyover to Kothrud',       547,   7,  0.5),
('Chandni to Bavdhan',               547, 690,  2.5),
('Wakad NH-48 to Wakad',             548,  27,  0.8),
('Dange Chowk to Wakad NH-48',       549, 548,  1.2),
('Dange Chowk to Hinjewadi',         549,  26,  1.0),
('Indira Wakad to Dange Chowk',      663, 549,  1.4),
('Hinjewadi Ph1 to Ph2',              26, 658,  2.5),
('Ph2 to Ph3',                       658, 659,  3.1),
('Hinjewadi Ph3 IT Rd',              659, 671,  1.5),
('Infosys to Mezza 9',               660, 661,  1.2),
('Infosys to Hinjewadi Ph1',         660,  26,  1.0),
('Sus Gaon to Hinjewadi',            673,  26,  2.5),
('Pashan Lake to Sus Gaon',          650, 673,  2.0),
('Pashan to Baner',                  650,  28,  2.5),
('Pashan Sus Jn to Pashan',          674, 650,  0.5),
('Bavdhan to Pashan Sus',            690, 674,  3.0),
('Pirangut to Mulshi',               571, 572, 22.0),
('Mulshi to Lavasa',                 572, 573, 25.0),
('Lavasa to Tamhini Top',            573, 574, 14.0),

-- ══ NH-48 West / Talegaon / Lonavala ════════════════════════
('Kiwale Bypass to Ravet',           552,  39,  3.5),
('Kiwale to Talegaon',               552, 553, 12.5),
('Talegaon to Kamshet',              553, 554, 15.0),
('Kamshet to Lonavala',              554, 555, 10.5),
('Chinchwad Flyover to Bhosari',     550,  23,  2.5),
('Chinchwad Flyover to Chinchwad',   550,  22,  0.8),
('Bhosari NH48 Toll to MIDC',        551,  23,  0.5),
('Dange Chowk to Chinchwad Fly',     549, 550,  3.5),
('Ravet to Kiwale v2',                39, 552,  2.0),
('Ravet Basket to Kiwale',           639, 552,  1.5),
('Ravet to Ravet Basket',             39, 639,  0.5),
('Sentosa to Mamurdi',               640, 638,  1.5),
('Mamurdi to Kiwale Bypass',         638, 552,  3.0),
('Mamurdi to Punawale',              638, 641,  2.0),
('Dehu Cantonment to Talegaon',      570, 553, 10.0),
('Dehu Rd to Cantonment',             40, 570,  2.0),
('Old Mumbai Rd to Dehu Rd',         569,  40,  2.0),
('Old Mumbai Rd to Talegaon',        569, 553,  8.5),
('Mamurdi to Old Mumbai Rd',         638, 569,  4.0),

-- ══ Pune–Nashik Highway chain ════════════════════════════════
('Nashik Phata to Pimpri',           556,  21,  1.5),
('Nashik Phata to Bhosari',          556,  23,  2.0),
('Nashik Phata to Chakan',           556, 557, 18.0),
('Chakan to Rajgurunagar',           557, 558, 16.0),
('Pimpri to Nashik Phata',            21, 556,  1.5),
('Moshi to Moshi Street',             84, 628,  2.0),
('Moshi Alandi to Temple',           628, 627,  2.5),
('Alandi Temple to Alandi Rd',       627,  36,  1.5),
('Alandi Rd to Bhosari',              36,  23,  2.5),
('Bhosari MIDC to Kudalwadi',         23, 631,  2.0),
('Kudalwadi to Chikhali',            631, 630,  1.5),
('Chikhali to Moshi',                630,  84,  4.5),
('Moshi Phata to Moshi',             675,  84,  1.0),

-- ══ PCMC expanded ════════════════════════════════════════════
('Bharat Nagar to Chinchwad',        568,  22,  1.5),
('Bharat Nagar to Bhosari',          568,  23,  1.8),
('Talawade IT to Bhosari',           566,  23,  2.5),
('Talawade to PCMC New Town',        566, 567,  1.2),
('PCMC New Town to Nashik Phata',    567, 556,  1.0),
('Pradhikaran to Nigdi',             634,  25,  1.2),
('Pradhikaran to PCCOE',             634,  24,  1.5),
('Nigdi Auth to Pradhikaran',        635, 634,  0.4),
('Nigdi Main Bus to Nigdi Auth',     636, 635,  0.3),
('Yamunagar to Nigdi',               637,  25,  1.0),
('Sambhajinagar to Chinchwad',       633,  22,  1.5),
('Empire Estate to Pimpri',          643,  21,  2.5),
('Landewadi to Bhosari',             645,  23,  2.5),
('Tata Motors to Bhosari',           644,  23,  3.0),
('Spine Rd to Moshi',                647,  84,  2.0),
('PCMC New Town to Kalewadi',        567, 619,  1.5),
('Indrayani to Bhosari',             629,  23,  2.8),
('Lotus Business to Akurdi',         642,  24,  1.5),
('Punawale to NH48 Kiwale',          641, 552,  3.5),

-- ══ Nagpur / Nagar Rd extended ══════════════════════════════
('Nagar Rd to Shikrapur',             32, 561, 15.0),
('Shikrapur to Koregaon Bhima',      561, 562,  7.5),
('Koregaon Bhima to Ranjangaon',     562, 534, 12.0),
('Bakori Rd to Shikrapur',           560, 561,  8.0),
('Wagholi to Bakori v2',             575, 560,  5.0),

-- ══ Pimpri internal links ════════════════════════════════════
('Pimpri Bhaji Mandai to Nashik Phata', 618, 556, 1.8),
('Kalewadi Phata to Pimpri',         619,  21,  2.5),
('Alandi Phata to Bhosari',          648,  23,  2.0),
('Alandi Phata to Alandi Rd',        648,  36,  1.5),

-- ══ Wai / Satara / Chiplun long approach ════════════════════
('Satara to Lonand',                 541, 542, 42.0),
('Swargate to Satara Rd Toll',         4, 626, 20.0),
('Satara Rd Toll to Khed Shivapur',  626, 540,  5.0)

) AS v(name, s, e, d)
JOIN nodes ns ON ns.id = v.s
JOIN nodes ne ON ne.id = v.e;


-- ────────────────────────────────────────────────────────────
-- STEP 3: Seed accidents for all roads without one
-- ────────────────────────────────────────────────────────────
INSERT INTO accidents (road_id, minor_count, major_count, fatal_count, year)
SELECT
    id AS road_id,
    floor(random() * 6)::int  AS minor_count,
    floor(random() * 3)::int  AS major_count,
    (CASE WHEN random() > 0.87 THEN 1 ELSE 0 END) AS fatal_count,
    2024
FROM roads
WHERE id NOT IN (SELECT DISTINCT road_id FROM accidents);

-- ────────────────────────────────────────────────────────────
-- STEP 4: Refresh all road risk_scores
-- ────────────────────────────────────────────────────────────
UPDATE roads r
SET risk_score = sub.total_risk
FROM (
    SELECT road_id,
           SUM(minor_count * 1 + major_count * 3 + fatal_count * 5) AS total_risk
    FROM accidents
    GROUP BY road_id
) sub
WHERE r.id = sub.road_id;

-- ────────────────────────────────────────────────────────────
-- STEP 5: Verification — run this to confirm success
-- ────────────────────────────────────────────────────────────
SELECT
    (SELECT COUNT(*) FROM nodes)     AS total_nodes,
    (SELECT COUNT(*) FROM roads)     AS total_roads,
    (SELECT COUNT(*) FROM accidents) AS total_accidents,
    (SELECT COUNT(*) FROM nodes n
     WHERE EXISTS (
         SELECT 1 FROM roads r
         WHERE r.start_node_id = n.id OR r.end_node_id = n.id
     ))                              AS connected_nodes,
    (SELECT COUNT(*) FROM nodes n
     WHERE NOT EXISTS (
         SELECT 1 FROM roads r
         WHERE r.start_node_id = n.id OR r.end_node_id = n.id
     ))                              AS isolated_nodes;
