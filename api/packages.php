<?php
/**
 * ALYN SHIR - Packages API Endpoint
 * Handles CRUD operations for tour expedition packages.
 */

require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper to format package fields from SQL to React-compatible camelCase
function formatPackage($row) {
    if (!$row) return null;
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'destination' => $row['destination'],
        'durationDays' => (int)$row['duration_days'],
        'durationNights' => (int)$row['duration_nights'],
        'pricePhp' => (float)$row['price_php'],
        'downpaymentPhp' => (float)$row['downpayment_php'],
        'heroImage' => $row['hero_image'],
        'galleryImages' => !empty($row['gallery_images']) ? json_decode($row['gallery_images'], true) : [],
        'highlights' => !empty($row['highlights']) ? json_decode($row['highlights'], true) : [],
        'inclusions' => !empty($row['inclusions']) ? json_decode($row['inclusions'], true) : [],
        'exclusions' => !empty($row['exclusions']) ? json_decode($row['exclusions'], true) : [],
        'itinerary' => !empty($row['itinerary']) ? json_decode($row['itinerary'], true) : [],
        'maxGuests' => (int)$row['max_guests'],
        'featured' => (bool)$row['featured'],
        'category' => $row['category'],
        'pcgClearanceStatus' => $row['pcg_clearance_status'] ?? 'Approved',
        'createdAt' => $row['created_at'] ?? null,
    ];
}

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM packages WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $package = $stmt->fetch();
            if (!$package) {
                jsonResponse(['error' => 'Package not found'], 404);
            }
            jsonResponse(formatPackage($package));
        } else {
            $stmt = $pdo->query("SELECT * FROM packages ORDER BY featured DESC, price_php DESC");
            $packages = $stmt->fetchAll();
            $result = array_map('formatPackage', $packages);
            jsonResponse($result);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        if (empty($data['title']) || empty($data['destination']) || empty($data['pricePhp'])) {
            jsonResponse(['error' => 'Title, destination, and price are required.'], 400);
        }

        $id = !empty($data['id']) ? $data['id'] : 'pkg-' . substr(md5(uniqid(rand(), true)), 0, 8);
        $title = $data['title'];
        $destination = $data['destination'];
        $durationDays = isset($data['durationDays']) ? (int)$data['durationDays'] : 3;
        $durationNights = isset($data['durationNights']) ? (int)$data['durationNights'] : ($durationDays - 1);
        $pricePhp = (float)$data['pricePhp'];
        $downpaymentPhp = isset($data['downpaymentPhp']) ? (float)$data['downpaymentPhp'] : round($pricePhp * 0.3);
        $heroImage = $data['heroImage'] ?? 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=1200';
        $galleryImages = json_encode($data['galleryImages'] ?? []);
        $highlights = json_encode($data['highlights'] ?? []);
        $inclusions = json_encode($data['inclusions'] ?? []);
        $exclusions = json_encode($data['exclusions'] ?? []);
        $itinerary = json_encode($data['itinerary'] ?? []);
        $maxGuests = isset($data['maxGuests']) ? (int)$data['maxGuests'] : 10;
        $featured = !empty($data['featured']) ? 1 : 0;
        $category = $data['category'] ?? 'Island Sanctuary';
        $pcgClearanceStatus = $data['pcgClearanceStatus'] ?? 'Approved';

        $stmt = $pdo->prepare("
            INSERT INTO packages (
                id, title, destination, duration_days, duration_nights, price_php, downpayment_php,
                hero_image, gallery_images, highlights, inclusions, exclusions, itinerary,
                max_guests, featured, category, pcg_clearance_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id, $title, $destination, $durationDays, $durationNights, $pricePhp, $downpaymentPhp,
            $heroImage, $galleryImages, $highlights, $inclusions, $exclusions, $itinerary,
            $maxGuests, $featured, $category, $pcgClearanceStatus
        ]);

        $stmt = $pdo->prepare("SELECT * FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(formatPackage($stmt->fetch()), 201);
        break;

    case 'PUT':
        $data = getJsonInput();
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        if (!$id) {
            jsonResponse(['error' => 'Package ID is required for update'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            jsonResponse(['error' => 'Package not found'], 404);
        }

        $title = $data['title'] ?? $existing['title'];
        $destination = $data['destination'] ?? $existing['destination'];
        $durationDays = isset($data['durationDays']) ? (int)$data['durationDays'] : (int)$existing['duration_days'];
        $durationNights = isset($data['durationNights']) ? (int)$data['durationNights'] : (int)$existing['duration_nights'];
        $pricePhp = isset($data['pricePhp']) ? (float)$data['pricePhp'] : (float)$existing['price_php'];
        $downpaymentPhp = isset($data['downpaymentPhp']) ? (float)$data['downpaymentPhp'] : (float)$existing['downpayment_php'];
        $heroImage = $data['heroImage'] ?? $existing['hero_image'];
        $galleryImages = isset($data['galleryImages']) ? json_encode($data['galleryImages']) : $existing['gallery_images'];
        $highlights = isset($data['highlights']) ? json_encode($data['highlights']) : $existing['highlights'];
        $inclusions = isset($data['inclusions']) ? json_encode($data['inclusions']) : $existing['inclusions'];
        $exclusions = isset($data['exclusions']) ? json_encode($data['exclusions']) : $existing['exclusions'];
        $itinerary = isset($data['itinerary']) ? json_encode($data['itinerary']) : $existing['itinerary'];
        $maxGuests = isset($data['maxGuests']) ? (int)$data['maxGuests'] : (int)$existing['max_guests'];
        $featured = isset($data['featured']) ? ($data['featured'] ? 1 : 0) : (int)$existing['featured'];
        $category = $data['category'] ?? $existing['category'];
        $pcgClearanceStatus = $data['pcgClearanceStatus'] ?? $existing['pcg_clearance_status'];

        $stmt = $pdo->prepare("
            UPDATE packages SET
                title = ?, destination = ?, duration_days = ?, duration_nights = ?, price_php = ?, downpayment_php = ?,
                hero_image = ?, gallery_images = ?, highlights = ?, inclusions = ?, exclusions = ?, itinerary = ?,
                max_guests = ?, featured = ?, category = ?, pcg_clearance_status = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $title, $destination, $durationDays, $durationNights, $pricePhp, $downpaymentPhp,
            $heroImage, $galleryImages, $highlights, $inclusions, $exclusions, $itinerary,
            $maxGuests, $featured, $category, $pcgClearanceStatus, $id
        ]);

        $stmt = $pdo->prepare("SELECT * FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(formatPackage($stmt->fetch()));
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            jsonResponse(['error' => 'Package ID is required for deletion'], 400);
        }
        $stmt = $pdo->prepare("DELETE FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true, 'message' => "Package {$id} successfully removed."]);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
