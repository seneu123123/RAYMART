<?php
/**
 * ALYN SHIR - Automated Concierge Transaction API
 * Provides automated, comprehensive expedition responses without requiring external AI keys.
 */
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    jsonResponse(['error' => 'POST method required'], 405);
}

$input = getJsonInput();
$message = trim($input['message'] ?? '');

if (empty($message)) {
    jsonResponse(['error' => 'Message is required'], 400);
}

$lower = strtolower($message);
$reply = "";

if (strpos($lower, 'coron') !== false || strpos($lower, 'wreck') !== false || strpos($lower, 'kayangan') !== false) {
    $reply = "For Coron, Palawan: We highly recommend our 4D3N Ultimate Coron Expedition featuring Kayangan Lake, Barracuda Lake, and WWII Shipwreck snorkeling. Best time to visit is November through May for calm turquoise waters. Remember to pack reef-safe sunscreen, dry bags, and aqua shoes!";
} elseif (strpos($lower, 'el nido') !== false || strpos($lower, 'bacuit') !== false) {
    $reply = "El Nido's Bacuit Bay is best explored with our Exclusive Big Lagoon & Secret Lagoon luxury catamaran charter. Tides are ideal in the early morning (7:30 AM departure) to avoid peak swells and tourist crowds. We supply dry bags, snorkeling gear, and DOT-certified life vests.";
} elseif (strpos($lower, 'siargao') !== false || strpos($lower, 'surf') !== false || strpos($lower, 'sohoton') !== false) {
    $reply = "Siargao Island: Surfing peak is September to November at Cloud 9, while island hopping to Naked, Daku, and Guyam islands plus Sohoton Cove is magical year-round. Don't miss Sugba Lagoon stand-up paddleboarding!";
} elseif (strpos($lower, 'cebu') !== false || strpos($lower, 'bohol') !== false || strpos($lower, 'tarsier') !== false || strpos($lower, 'sardine') !== false) {
    $reply = "Central Visayas Expedition: Our 5D4N Cebu & Bohol Heritage combo includes Moalboal sardine run, Badian canyoneering, Bohol Chocolate Hills, Loboc River cruise, and the Tarsier sanctuary. DOT accreditation DOT-ACCR-RO7-2026-8819 guarantees certified local guides and Coast Guard compliant speedboats.";
} elseif (strpos($lower, 'batanes') !== false || strpos($lower, 'weather') !== false || strpos($lower, 'season') !== false) {
    $reply = "Batanes Archipelago: Known as the Home of the Winds. The best weather window is December through April when northern trade winds create cool, crisp rolling hills and clear blue seas. Due to maritime regulations, we strictly monitor PCG seaworthiness clearances.";
} elseif (strpos($lower, 'boracay') !== false || strpos($lower, 'paraw') !== false || strpos($lower, 'sunset') !== false) {
    $reply = "Boracay & Romblon: Our 3D2N Sunset Paraw & Carabao Island escape provides private sailboat charter along White Beach at golden hour, plus secluded cliffside lounges and coral sanctuaries.";
} elseif (strpos($lower, 'downpayment') !== false || strpos($lower, 'pay') !== false || strpos($lower, 'price') !== false || strpos($lower, 'cost') !== false) {
    $reply = "Payment Policy: We require a 30% downpayment upon reservation to lock in boat permits and DOT guide dispatch. The remaining balance can be settled 48 hours prior to voyage via bank wire or GCash Business.";
} elseif (strpos($lower, 'pack') !== false || strpos($lower, 'wear') !== false || strpos($lower, 'bring') !== false) {
    $reply = "Essential Philippine Expedition Packing Checklist:\n1. 20L-30L Waterproof Dry Bag\n2. Mineral, reef-safe sunscreen (SPF 50+)\n3. Breathable UV rashguards & aqua shoes\n4. Waterproof phone pouch & powerbank\n5. Valid government ID for Philippine Coast Guard manifest verification.";
} elseif (strpos($lower, 'safety') !== false || strpos($lower, 'pcg') !== false || strpos($lower, 'coast guard') !== false) {
    $reply = "Safety & Accreditation: ALYN SHIR operates under DOT Accreditation DOT-ACCR-RO7-2026-8819 and Coast Guard Master Clearance. Every vessel is equipped with VHF marine radios, life rafts, first-aid kits, and GPS transponders.";
} else {
    $reply = "Mabuhay! Welcome to ALYN SHIR Island Concierge. I am your automated Philippine expedition assistant (DOT-ACCR-RO7-2026-8819). Whether you are exploring Coron shipwrecks, El Nido lagoons, Siargao breaks, or Bohol heritage, I can assist with itineraries, packing tips, or weather guidance. How may I assist your voyage today?";
}

jsonResponse([
    'reply' => $reply,
    'source' => 'Automated Philippine Maritime Transaction Engine'
]);
?>
