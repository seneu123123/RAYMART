-- ==========================================================
-- ALYN SHIR Marine Expeditions & Luxury Charters
-- MySQL Database Schema & Seed Data
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `alyn_shir_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `alyn_shir_db`;

-- 1. Users / Staff Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `role` ENUM('Super Admin', 'Operations Director', 'Harbor Master', 'Reservation Specialist', 'Guide Captain') NOT NULL DEFAULT 'Reservation Specialist',
  `avatar_url` TEXT,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `access_code` VARCHAR(50) DEFAULT 'ALYN-2026',
  `otp_code` VARCHAR(10) DEFAULT NULL,
  `otp_expires_at` DATETIME DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tour Packages Table
CREATE TABLE IF NOT EXISTS `packages` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `destination` VARCHAR(100) NOT NULL,
  `duration_days` INT NOT NULL DEFAULT 1,
  `duration_nights` INT NOT NULL DEFAULT 0,
  `price_php` DECIMAL(12,2) NOT NULL,
  `downpayment_php` DECIMAL(12,2) NOT NULL,
  `hero_image` TEXT NOT NULL,
  `gallery_images` JSON,
  `highlights` JSON,
  `inclusions` JSON,
  `exclusions` JSON,
  `itinerary` JSON,
  `max_guests` INT NOT NULL DEFAULT 12,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Island Sanctuary',
  `pcg_clearance_status` VARCHAR(50) NOT NULL DEFAULT 'Approved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(50) PRIMARY KEY,
  `package_id` VARCHAR(50) NOT NULL,
  `package_title` VARCHAR(255) NOT NULL,
  `guest_name` VARCHAR(150) NOT NULL,
  `guest_email` VARCHAR(150) NOT NULL,
  `guest_phone` VARCHAR(50) NOT NULL,
  `total_amount_php` DECIMAL(12,2) NOT NULL,
  `downpayment_paid_php` DECIMAL(12,2) NOT NULL,
  `balance_due_php` DECIMAL(12,2) NOT NULL,
  `payment_status` ENUM('Downpayment Verified', 'Fully Paid', 'Pending Bank Wire', 'Refunded') NOT NULL DEFAULT 'Downpayment Verified',
  `status` ENUM('Confirmed', 'Vessel Dispatched', 'PCG Cleared', 'Completed', 'Rescheduled', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  `booking_date` VARCHAR(50) NOT NULL,
  `travel_date` VARCHAR(50) NOT NULL,
  `qr_code_data` TEXT NOT NULL,
  `notes` TEXT,
  `assigned_guide_id` VARCHAR(50),
  `assigned_boat_id` VARCHAR(50),
  `assigned_hotel_id` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`package_id`),
  INDEX (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Fleet Vessels Table
CREATE TABLE IF NOT EXISTS `fleet` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(80) NOT NULL,
  `capacity` INT NOT NULL DEFAULT 12,
  `captain` VARCHAR(100) NOT NULL,
  `status` ENUM('Ready for Sea', 'Under Inspection', 'On Voyage', 'Drydock Maintenance') NOT NULL DEFAULT 'Ready for Sea',
  `engine_specs` VARCHAR(150) NOT NULL,
  `pcg_certificate_no` VARCHAR(100) NOT NULL,
  `insurance_expiry` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Master Tour Guides Table
CREATE TABLE IF NOT EXISTS `guides` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `dot_accreditation_no` VARCHAR(100) NOT NULL,
  `languages` JSON,
  `specialty` VARCHAR(100) NOT NULL,
  `years_experience` INT NOT NULL DEFAULT 5,
  `phone` VARCHAR(50) NOT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.0,
  `status` ENUM('Active Dispatch', 'On Rotation', 'Rest Day') NOT NULL DEFAULT 'Active Dispatch',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Partner Hotels Table
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `destination` VARCHAR(100) NOT NULL,
  `stars` INT NOT NULL DEFAULT 5,
  `contact_person` VARCHAR(100) NOT NULL,
  `contact_email` VARCHAR(150) NOT NULL,
  `contract_rate_discount_percent` INT NOT NULL DEFAULT 15,
  `status` ENUM('Active Agreement', 'Renewal Pending', 'Inactive') NOT NULL DEFAULT 'Active Agreement',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Audit & Security Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `timestamp` VARCHAR(50) NOT NULL,
  `user_email` VARCHAR(150) NOT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(80) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL DEFAULT 'Operations',
  `details` TEXT NOT NULL,
  `severity` ENUM('Info', 'Warning', 'Security Alert', 'High', 'Critical') NOT NULL DEFAULT 'Info',
  `ip_address` VARCHAR(100) DEFAULT '127.0.0.1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(50) PRIMARY KEY,
  `author_name` VARCHAR(100) NOT NULL,
  `package_id` VARCHAR(50) NOT NULL,
  `package_title` VARCHAR(255),
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `verified_guest` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('Published', 'Pending Moderation', 'Hidden') NOT NULL DEFAULT 'Published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. System Settings Table
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `agency_name` VARCHAR(150) NOT NULL DEFAULT 'ALYN SHIR Marine Expeditions & Luxury Charters Inc',
  `dot_license` VARCHAR(100) NOT NULL DEFAULT 'DOT-ACCR-RO7-2026-8819',
  `address` TEXT NOT NULL,
  `contact_phone` VARCHAR(50) NOT NULL DEFAULT '+63 (02) 8892-ALYN / +63 917 888 2596',
  `contact_email` VARCHAR(150) NOT NULL DEFAULT 'operations@alynshir.ph',
  `currency_symbol` VARCHAR(10) NOT NULL DEFAULT '₱',
  `tax_rate_percent` DECIMAL(5,2) NOT NULL DEFAULT 12.00,
  `accent_color` VARCHAR(30) NOT NULL DEFAULT '#06b6d4',
  `safety_checklist_mandatory` TINYINT(1) NOT NULL DEFAULT 1,
  `auto_lock_minutes` INT NOT NULL DEFAULT 15,
  `company_name` VARCHAR(150) DEFAULT 'ALYN SHIR Marine Expeditions & Luxury Charters Inc',
  `tin_number` VARCHAR(50) DEFAULT '402-991-824-000',
  `pcg_emergency_hotline` VARCHAR(50) DEFAULT 'Coast Guard Action Center: +63 917 724 0115',
  `pnp_maritime_hotline` VARCHAR(50) DEFAULT 'PNP Maritime Group: +63 998 598 7924',
  `downpayment_percentage_required` INT DEFAULT 30,
  `max_wave_height_meters` DECIMAL(3,1) DEFAULT 2.2,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA INSERTION
-- ==========================================================

-- Insert Users / Staff (Default Password for all seed accounts: Password123!)
-- Password Hash below corresponds to password_hash('Password123!', PASSWORD_BCRYPT)
INSERT INTO `users` (`id`, `name`, `email`, `role`, `avatar_url`, `password_hash`, `access_code`, `active`) VALUES
('usr-01', 'Captain Eduardo Valderama', 'harbor.master@alynshir.ph', 'Super Admin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '$2y$10$eA32bO5k8cI0R68mQYJpneJ3XfF2pG0sP.00b0Kx3n1kG0O6p4N6m', 'ALYN-2026', 1),
('usr-02', 'Ma. Cristina Alcantara', 'director.ops@alynshir.ph', 'Operations Director', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '$2y$10$eA32bO5k8cI0R68mQYJpneJ3XfF2pG0sP.00b0Kx3n1kG0O6p4N6m', 'ALYN-2026', 1),
('usr-03', 'Rodrigo Mendoza', 'maritime.safety@alynshir.ph', 'Harbor Master', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '$2y$10$eA32bO5k8cI0R68mQYJpneJ3XfF2pG0sP.00b0Kx3n1kG0O6p4N6m', 'ALYN-2026', 1),
('usr-04', 'Liza Mae Santos', 'bookings@alynshir.ph', 'Reservation Specialist', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', '$2y$10$eA32bO5k8cI0R68mQYJpneJ3XfF2pG0sP.00b0Kx3n1kG0O6p4N6m', 'ALYN-2026', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert Tour Packages
INSERT INTO `packages` (
  `id`, `title`, `destination`, `duration_days`, `duration_nights`, `price_php`, `downpayment_php`, `hero_image`, 
  `gallery_images`, `highlights`, `inclusions`, `exclusions`, `itinerary`, `max_guests`, `featured`, `category`, `pcg_clearance_status`
) VALUES
(
  'pkg-coron-01',
  'Coron Shipwrecks & Kayangan Pristine Sanctuary',
  'Coron, Palawan',
  4, 3, 42500.00, 12750.00,
  'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=1200&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800", "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800"]',
  '["Kayangan Lake private VIP dawn entry", "WWII Japanese Shipwreck guided snorkel", "Barracuda Lake thermocline diving", "Twin Lagoon secluded bamboo raft access"]',
  '["Private twin-engine speedboat charter", "DOT-accredited master guide & lifeguard", "All marine sanctuary environmental permits", "Chef-prepared coastal seafood lunch & fresh coconuts", "PCG approved safety gear & reef-safe sunscreen"]',
  '["Airfare to Busuanga (USU)", "Personal dive equipment (available for rental)", "Gratuities for boat crew"]',
  '[{"day": 1, "title": "Touchdown Coron & Coastal Welcome", "activities": ["Private van transfer from Busuanga Airport to Coron Bay", "Boarding briefing at ALYN SHIR Private Pier", "Sunset cocktail cruise along Siete Pecados marine sanctuary"]}, {"day": 2, "title": "Kayangan Lake & Sunken WWII Freighters", "activities": ["06:30 Private dawn cruise to Kayangan Lake before public entry", "Snorkel exploration of the Japanese Lusong Gunboat wreck", "Secluded lunch cove at Banol Beach"]}, {"day": 3, "title": "Barracuda Thermoclines & Twin Lagoon", "activities": ["Geothermal thermocline swim in Barracuda Lake", "Twin Lagoon swimming hole exploration", "CYC Beach coral garden drift snorkel"]}, {"day": 4, "title": "Maquinit Hot Springs & Departure", "activities": ["Morning salt-water soak at Maquinit Hot Springs", "Souvenir curation in Coron Town", "Airport VIP private shuttle transfer"]}]',
  10, 1, 'Island Sanctuary', 'Approved'
),
(
  'pkg-elnido-02',
  'Bacuit Archipelago Ultra-Luxury Catamaran Charter',
  'El Nido, Palawan',
  5, 4, 68000.00, 20400.00,
  'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800"]',
  '["Big Lagoon private double kayak clearance", "Secret Lagoon hidden limestone portal entry", "Snake Island sandbar sunrise champagne breakfast", "Entalula private beach pavilion dining"]',
  '["Exclusive 42ft outrigger motorized catamaran", "DOT master guide with marine biology credential", "All El Nido protected area permits", "Five-course seaside grill lunch daily", "Professional underwater photography package"]',
  '["Flights into Lio Airport (ENI)", "Specialty alcoholic spirits outside menu", "Spa treatments at partner resorts"]',
  '[{"day": 1, "title": "Lio Airport Arrival & Bacuit Sunset Sail", "activities": ["VIP vehicle welcome at Lio Airport", "Check-in at partner luxury beach resort", "Sunset yacht sail with Philippine charcuterie"]}, {"day": 2, "title": "Lagoon Frontiers: Big & Secret Lagoons", "activities": ["Early kayak navigation through Big Lagoon emerald waters", "Low-tide ingress through Secret Lagoon rock cleft", "Fresh tuna sashimi lunch at Shimizu Island"]}, {"day": 3, "title": "Cathedral Caves & Snake Island Sandbar", "activities": ["Cathedral Cave motorized exploration", "Stroll the serpentine sandbar of Snake Island at low tide", "Pinagbuyutan island beach sanctuary"]}, {"day": 4, "title": "Hidden Beach & Helicopter Island Reef", "activities": ["Hidden Beach protected turtle sanctuary snorkel", "Helicopter Island wall dive & snorkeling", "Starlit beach campfire banquet on 7 Commandos Beach"]}, {"day": 5, "title": "Island Departure", "activities": ["Morning seaside yoga and tropical breakfast", "Transfer to Lio Airport for onward flight"]}]',
  8, 1, 'Luxury Catamaran', 'Approved'
),
(
  'pkg-siargao-03',
  'Siargao Outer Atolls & Sohoton Marine Reserve',
  'Siargao Island',
  4, 3, 38500.00, 11550.00,
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800"]',
  '["Sohoton Cove stingless jellyfish sanctuary swim", "Naked Island, Daku & Guyam private trifecta", "Sugba Lagoon stand-up paddleboarding", "Cloud 9 VIP surf coaching session"]',
  '["Custom twin-engine fiberglass center-console boat", "Sohoton Cove indigenous guide clearance & entry", "Local gourmet seafood feast at Daku Island", "Stand-up paddleboards and snorkeling gear", "Philippine Coast Guard manifests & safety clearance"]',
  '["Flights to Sayak Airport (IAO)", "Surfboard rental & private ding repairs", "Personal expenses & nightlife"]',
  '[{"day": 1, "title": "Arrival in General Luna", "activities": ["Sayak airport pickup and scenic coconut highway transfer", "Afternoon chill at Cloud 9 boardwalk viewing tower", "Welcome sunset dinner at General Luna"]}, {"day": 2, "title": "Sohoton Cove Magical Jellyfish Realm", "activities": ["2-hour boat cruise to Bucas Grande Island", "Enter underwater tunnel into Hagukan Cave", "Swim peacefully with thousands of stingless golden jellyfish"]}, {"day": 3, "title": "Tri-Island Odyssey & Corregidor Island", "activities": ["Pristine sands of Naked Island", "Boodle fight feast under coconut palms on Daku Island", "Snorkel the reefs around Guyam Island"]}, {"day": 4, "title": "Sugba Lagoon & Departure", "activities": ["Morning paddleboarding in tranquil Sugba Lagoon", "Magpupungko Tidal Pools (tide-dependent)", "Transfer to Sayak Airport"]}]',
  12, 1, 'Island Sanctuary', 'Approved'
),
(
  'pkg-cebu-bohol-04',
  'Cebu Heritage Marine & Bohol Emerald Coves',
  'Cebu & Bohol',
  5, 4, 52000.00, 15600.00,
  'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800"]',
  '["Moalboal million-sardine run & sea turtle swim", "Badian Canyoneering private helicopter/boat option", "Bohol Chocolate Hills & Tarsier conservation sanctuary", "Loboc River private floating banquet cruise"]',
  '["Fast-craft private charter across Mactan Strait", "Private air-conditioned executive van in Bohol & Cebu", "Licensed DOT Master Guides across both provinces", "All national park & sanctuary entry clearances", "Seafood buffet lunches on all tour days"]',
  '["Airfare to Mactan-Cebu International Airport (CEB)", "Optional scuba tank rentals", "Travel insurance add-on"]',
  '[{"day": 1, "title": "Arrival Cebu & Historical Coast", "activities": ["Mactan Airport meet & greet", "Check-in at Mactan beachfront resort", "Briefing on marine conservation protocol"]}, {"day": 2, "title": "Moalboal Sardines & Pescador Island", "activities": ["Snorkel alongside massive schools of Moalboal sardines", "Encounter resident green sea turtles at Talisay Point", "Scenic drive back through heritage carcar countryside"]}, {"day": 3, "title": "Crossing to Bohol & Loboc River", "activities": ["Fast boat voyage across the Bohol Sea", "Loboc River gourmet luncheon aboard native river raft", "Visit the endangered Philippine Tarsier Sanctuary"]}, {"day": 4, "title": "Chocolate Hills & Panglao Marine Reserve", "activities": ["Sunrise view of the iconic Chocolate Hills", "Snorkel Balicasag Island marine sanctuary", "Panglao white sand beach retreat"]}, {"day": 5, "title": "Departure via Tagbilaran or Mactan", "activities": ["Gourmet Filipino breakfast", "Shopping for artisanal Bohol handicrafts", "Drop-off at Panglao Airport (TAG) or Cebu ferry terminal"]}]',
  12, 0, 'Cultural Expedition', 'Approved'
),
(
  'pkg-batanes-05',
  'Batanes Windswept Islands & Ivatan Sanctuaries',
  'Batanes Archipelago',
  5, 4, 58000.00, 17400.00,
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"]',
  '["Basco Lighthouse rolling pasture sunset vistas", "Marlboro Hills (Rakuh a Payaman) panoramic vistas", "Sabtang Island crossing on traditional Faluwa boat", "Chavayan heritage stone house village immersion"]',
  '["Registered Ivatan master guide & indigenous clearance", "Private land transport across Batan & Sabtang islands", "Faluwa boat crossing with certified life vests & PCG check", "Daily traditional Ivatan culinary menus on banana leaves", "Provincial environmental eco-tourism fees included"]',
  '["Flights to Basco Airport (BSO)", "Alcoholic beverages & personal souvenirs", "Faluwa ocean baggage fees exceeding 15kg"]',
  '[{"day": 1, "title": "Arrival in Basco & North Batan", "activities": ["Basco Airport welcome with floral lei greeting", "Mt. Carmel Chapel & Tukon Radar Station", "Sunset at Basco Lighthouse atop Naidi Hills"]}, {"day": 2, "title": "South Batan Cultural Trail", "activities": ["Mahatao San Carlos Borromeo Church & Spanish lighthouse", "Honesty Coffee Shop historic visit", "Marlboro Hills windswept pastoral viewpoints"]}, {"day": 3, "title": "Sabtang Island Sea Crossing", "activities": ["06:00 Faluwa crossing from San Vicente Port across channel", "Explore stone houses of Savidug & Chavayan villages", "Traditional Ivatan lunch under Nakabuang Natural Arch"]}, {"day": 4, "title": "Itbayat Vista & Marine Sanctuaries", "activities": ["Diura Fishing Village & Sacred Spring of Youth", "Valugan Boulder Beach wave contemplation", "Farewell feast with fresh coconut crabs and uvud balls"]}, {"day": 5, "title": "Basco Departure", "activities": ["Ivatan souvenir shopping (vakul & kanayi weaving)", "Airport drop-off for flight back to Manila"]}]',
  8, 0, 'Island Sanctuary', 'Approved'
),
(
  'pkg-boracay-06',
  'Boracay Sunset Paraw & Carabao Island Sanctuary',
  'Boracay & Romblon',
  3, 2, 29500.00, 8850.00,
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80',
  '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"]',
  '["Private twin-sail traditional Paraw boat sunset cruise", "Carabao Island secluded untouched sandbar voyage", "Crocodile Island & Crystal Cove marine snorkeling", "Diniwid cliffside private champagne lounge access"]',
  '["Exclusive Paraw sailboat charter with licensed boatmen", "All Malay municipality environmental & port terminal fees", "Chilled champagne & tropical fruit grazing platters", "High-grade snorkel masks & certified life jackets", "Coast Guard validated voyage manifest"]',
  '["Flights into Caticlan Airport (MPH)", "Personal dinner reservations in Station 1", "Motorized water sports outside itinerary"]',
  '[{"day": 1, "title": "Caticlan Arrival & Sunset Paraw", "activities": ["VIP jetty port express speed boat transfer to Boracay", "Check-in at Station 1 luxury beachfront villa", "Sunset Paraw sailing cruise along White Beach shoreline"]}, {"day": 2, "title": "Carabao Island Sanctuary Escape", "activities": ["Cross the channel to the raw, quiet shores of Carabao Island", "Snorkel the pristine corals of Crocodile Island", "Beach barbecue lunch under wild coconut groves"]}, {"day": 3, "title": "Puka Shell Beach & Farewell", "activities": ["Morning cruise to quiet Puka Shell Beach", "Stand-up paddleboard session in calm turquoise water", "Express speedboat transfer back to Caticlan Airport"]}]',
  6, 0, 'Sunset Paraw', 'Approved'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Insert Fleet Vessels
INSERT INTO `fleet` (`id`, `name`, `type`, `capacity`, `captain`, `status`, `engine_specs`, `pcg_certificate_no`, `insurance_expiry`) VALUES
('flt-01', 'M/V ALYN SHIR I', 'Twin-Engine Speedboat (40ft)', 14, 'Capt. Dante Alcantara', 'Ready for Sea', 'Twin Yamaha 300HP 4-Stroke', 'PCG-CEB-2026-091', '2027-04-15'),
('flt-02', 'M/V Bacuit Pearl', 'Outrigger Luxury Catamaran (46ft)', 18, 'Capt. Joselito Ramos', 'Ready for Sea', 'Cummins Marine 450HP Inboard', 'PCG-PAL-2026-144', '2027-06-20'),
('flt-03', 'M/V Coron Sovereign', 'Executive Speedboat (36ft)', 10, 'Capt. Noel Gutierrez', 'On Voyage', 'Twin Suzuki 250HP Lean Burn', 'PCG-COR-2026-088', '2027-02-10'),
('flt-04', 'M/V Siargao Crest', 'Center-Console Offshore Explorer (32ft)', 12, 'Capt. Marlon Vega', 'Ready for Sea', 'Twin Yamaha 200HP V6', 'PCG-SIA-2026-032', '2027-08-30'),
('flt-05', 'M/V Ivatan Seeker', 'Reinforced Heavy Outrigger (48ft)', 20, 'Capt. Teodoro Castillejos', 'Under Inspection', 'Yanmar 6CX Marine Diesel', 'PCG-BAT-2026-015', '2027-01-12')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert Master Tour Guides
INSERT INTO `guides` (`id`, `name`, `dot_accreditation_no`, `languages`, `specialty`, `years_experience`, `phone`, `rating`, `status`) VALUES
('gd-01', 'Ramon "Mon" Bautista', 'DOT-TG-RO7-88102', '["English", "Tagalog", "Cebuano"]', 'Marine Biology & Coral Ecology', 9, '+63 917 442 8819', 4.95, 'Active Dispatch'),
('gd-02', 'Elena Soriano', 'DOT-TG-RO4B-44192', '["English", "Tagalog", "French"]', 'WWII Shipwreck Diving & History', 7, '+63 918 331 9920', 4.98, 'Active Dispatch'),
('gd-03', 'Gabriel "Gabby" Cruz', 'DOT-TG-RO13-11029', '["English", "Tagalog", "Spanish"]', 'Tidal Navigation & Wave Reading', 6, '+63 919 772 1445', 4.92, 'On Rotation'),
('gd-04', 'Maricel Valenzuela', 'DOT-TG-RO2-00912', '["English", "Ivatan", "Tagalog"]', 'Ivatan Cultural Heritage & Geology', 11, '+63 920 661 8831', 5.00, 'Active Dispatch')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert Partner Hotels
INSERT INTO `hotels` (`id`, `name`, `destination`, `stars`, `contact_person`, `contact_email`, `contract_rate_discount_percent`, `status`) VALUES
('htl-01', 'Two Seasons Coron Island Resort', 'Coron, Palawan', 5, 'Cheryl Tan', 'reservations@twoseasons.com', 20, 'Active Agreement'),
('htl-02', 'El Nido Resorts - Pangulasian Island', 'El Nido, Palawan', 5, 'Alfonso Roxas', 'sales@elnidoresorts.com', 18, 'Active Agreement'),
('htl-03', 'Nay Palad Hideaway', 'Siargao Island', 5, 'Camille Laurent', 'guestservices@naypalad.com', 15, 'Active Agreement'),
('htl-04', 'Amorita Resort', 'Panglao, Bohol', 5, 'Benedict Santos', 'events@amoritaresort.com', 22, 'Active Agreement'),
('htl-05', 'Fundacion Pacita Batanes Nature Lodge', 'Basco, Batanes', 4, 'Teresa Abad', 'stay@fundacionpacita.ph', 15, 'Active Agreement')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert Initial Bookings
INSERT INTO `bookings` (
  `id`, `package_id`, `package_title`, `guest_name`, `guest_email`, `guest_phone`, 
  `total_amount_php`, `downpayment_paid_php`, `balance_due_php`, `payment_status`, 
  `status`, `booking_date`, `travel_date`, `qr_code_data`, `assigned_guide_id`, `assigned_boat_id`, `assigned_hotel_id`
) VALUES
(
  'HT-2026-8819',
  'pkg-coron-01',
  'Coron Shipwrecks & Kayangan Pristine Sanctuary',
  'Atty. Joaquin Delgado',
  'j.delgado@delgadolaw.ph',
  '+63 917 552 1099',
  85000.00, 25500.00, 59500.00,
  'Downpayment Verified', 'Confirmed',
  '2026-03-01', '2026-03-24',
  'ALYN-SHIR|PASS-HT-2026-8819|PAID-25500|GUEST-Delgado|PCG-CLEAR-APPROVED',
  'gd-02', 'flt-03', 'htl-01'
),
(
  'HT-2026-9042',
  'pkg-elnido-02',
  'Bacuit Archipelago Ultra-Luxury Catamaran Charter',
  'Dr. Vivienne Chen-Villarama',
  'vivienne.chen@villarama-med.com',
  '+63 918 882 4431',
  136000.00, 136000.00, 0.00,
  'Fully Paid', 'Vessel Dispatched',
  '2026-03-04', '2026-03-18',
  'ALYN-SHIR|PASS-HT-2026-9042|PAID-136000|GUEST-Chen-Villarama|PCG-CLEAR-APPROVED',
  'gd-01', 'flt-02', 'htl-02'
)
ON DUPLICATE KEY UPDATE `guest_name` = VALUES(`guest_name`);

-- Insert Audit Logs
INSERT INTO `audit_logs` (`id`, `timestamp`, `user_email`, `user_name`, `role`, `action`, `module`, `details`, `severity`, `ip_address`) VALUES
('aud-01', '2026-03-10 08:30:14', 'harbor.master@alynshir.ph', 'Capt. Eduardo Valderama', 'Super Admin', 'PCG_VOYAGE_CLEARANCE_ISSUED', 'Fleet Readiness', 'Issued Philippine Coast Guard clearance for M/V Bacuit Pearl (Palawan route). Wave condition: 0.6m Calm.', 'Info', '192.168.10.42'),
('aud-02', '2026-03-10 09:15:22', 'bookings@alynshir.ph', 'Liza Mae Santos', 'Reservation Specialist', 'DOWNPAYMENT_VERIFIED', 'Booking Hub', 'Verified GCash Business wire downpayment ₱25,500.00 for Booking HT-2026-8819 (Atty. Delgado). QR Boarding pass generated.', 'Info', '192.168.10.45'),
('aud-03', '2026-03-10 11:04:00', 'director.ops@alynshir.ph', 'Ma. Cristina Alcantara', 'Operations Director', 'PRICE_MATRIX_UPDATED', 'Catalog', 'Updated Batanes high-season surcharge compliance according to fuel index.', 'Warning', '192.168.10.38')
ON DUPLICATE KEY UPDATE `details` = VALUES(`details`);

-- Insert Reviews
INSERT INTO `reviews` (`id`, `author_name`, `package_id`, `package_title`, `rating`, `comment`, `date`, `verified_guest`, `status`) VALUES
('rev-01', 'Atty. Roberto Tan', 'pkg-coron-01', 'Coron Shipwrecks & Kayangan Pristine Sanctuary', 5, 'Pure perfection. Reaching Kayangan Lake at 7:00 AM before any tourist crowds arrived gave us an ethereal, glassy lagoon all to ourselves. Guide Elena Soriano was brilliant with shipwreck history.', '2026-02-28', 1, 'Published'),
('rev-02', 'Clarissa Montes-Reyes', 'pkg-elnido-02', 'Bacuit Archipelago Ultra-Luxury Catamaran Charter', 5, 'The Bacuit Pearl catamaran is easily the cleanest, most seaworthy vessel in Palawan. Chef lunch on Entalula island was five-star hotel quality. Outstanding Coast Guard compliance and safety.', '2026-03-02', 1, 'Published'),
('rev-03', 'Jonathan Blake', 'pkg-siargao-03', 'Siargao Outer Atolls & Sohoton Marine Reserve', 5, 'Swimming with the stingless jellyfish in Sohoton Cove was a bucket list highlight. ALYN SHIR handled all permits effortlessly. Will book Batanes with them next year.', '2026-03-05', 1, 'Published')
ON DUPLICATE KEY UPDATE `comment` = VALUES(`comment`);

-- Insert Default System Settings
INSERT INTO `system_settings` (`id`, `agency_name`, `dot_license`, `address`, `contact_phone`, `contact_email`, `currency_symbol`, `tax_rate_percent`, `accent_color`)
VALUES (1, 'ALYN SHIR Marine Expeditions & Luxury Charters Inc', 'DOT-ACCR-RO7-2026-8819', 'Pier 4 Marine Sanctuary Terminal, North Reclamation Area, Cebu City & Coron Bay Pier, Palawan, Philippines', '+63 (02) 8892-ALYN / +63 917 888 2596', 'operations@alynshir.ph', '₱', 12.00, '#06b6d4')
ON DUPLICATE KEY UPDATE `agency_name` = VALUES(`agency_name`);
