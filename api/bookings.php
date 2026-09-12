<?php
/**
 * ALYN SHIR - Bookings API Endpoint
 * Handles expedition reservations, downpayments, status updates, and boarding pass lookup.
 */

require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function formatBooking($row) {
    if (!$row) return null;
    return [
        'id' => $row['id'],
        'packageId' => $row['package_id'],
        'packageTitle' => $row['package_title'],
        'guestName' => $row['guest_name'],
        'guestEmail' => $row['guest_email'],
        'guestPhone' => $row['guest_phone'],
        'totalAmountPhp' => (float)$row['total_amount_php'],
        'downpaymentPaidPhp' => (float)$row['downpayment_paid_php'],
        'balanceDuePhp' => (float)$row['balance_due_php'],
        'paymentStatus' => $row['payment_status'],
        'status' => $row['status'],
        'bookingDate' => $row['booking_date'],
        'travelDate' => $row['travel_date'],
        'qrCodeData' => $row['qr_code_data'],
        'notes' => $row['notes'] ?? '',
        'assignedGuideId' => $row['assigned_guide_id'] ?? null,
        'assignedBoatId' => $row['assigned_boat_id'] ?? null,
        'assignedHotelId' => $row['assigned_hotel_id'] ?? null,
        'createdAt' => $row['created_at'] ?? null,
    ];
}

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $b = $stmt->fetch();
            if (!$b) {
                jsonResponse(['error' => 'Booking reference not found'], 404);
            }
            jsonResponse(formatBooking($b));
        } elseif (isset($_GET['qr'])) {
            $stmt = $pdo->prepare("SELECT * FROM bookings WHERE qr_code_data = ? OR id = ?");
            $stmt->execute([$_GET['qr'], $_GET['qr']]);
            $b = $stmt->fetch();
            if (!$b) {
                jsonResponse(['error' => 'Boarding pass record not found'], 404);
            }
            jsonResponse(formatBooking($b));
        } else {
            $stmt = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC");
            $bookings = $stmt->fetchAll();
            jsonResponse(array_map('formatBooking', $bookings));
        }
        break;

    case 'POST':
        $data = getJsonInput();
        if (empty($data['packageId']) || empty($data['guestName']) || empty($data['guestEmail'])) {
            jsonResponse(['error' => 'Package ID, guest name, and email are required.'], 400);
        }

        $id = !empty($data['id']) ? $data['id'] : 'HT-' . date('Y') . '-' . rand(1000, 9999);
        $packageId = $data['packageId'];
        $packageTitle = $data['packageTitle'] ?? 'Philippine Island Expedition';
        $guestName = $data['guestName'];
        $guestEmail = $data['guestEmail'];
        $guestPhone = $data['guestPhone'] ?? '';
        $totalAmountPhp = (float)($data['totalAmountPhp'] ?? 0);
        $downpaymentPaidPhp = (float)($data['downpaymentPaidPhp'] ?? ($totalAmountPhp * 0.3));
        $balanceDuePhp = (float)($data['balanceDuePhp'] ?? ($totalAmountPhp - $downpaymentPaidPhp));
        $paymentStatus = $data['paymentStatus'] ?? 'Downpayment Verified';
        $status = $data['status'] ?? 'Confirmed';
        $bookingDate = $data['bookingDate'] ?? date('Y-m-d');
        $travelDate = $data['travelDate'] ?? date('Y-m-d', strtotime('+7 days'));
        
        $lastName = explode(' ', $guestName);
        $cleanLastName = preg_replace('/[^A-Za-z0-9]/', '', end($lastName));
        $qrCodeData = !empty($data['qrCodeData']) 
            ? $data['qrCodeData'] 
            : "ALYN-SHIR|PASS-{$id}|PAID-{$downpaymentPaidPhp}|GUEST-{$cleanLastName}|PCG-CLEAR-APPROVED";
        
        $notes = $data['notes'] ?? '';
        $assignedGuideId = $data['assignedGuideId'] ?? 'gd-01';
        $assignedBoatId = $data['assignedBoatId'] ?? 'flt-01';
        $assignedHotelId = $data['assignedHotelId'] ?? 'htl-01';

        $stmt = $pdo->prepare("
            INSERT INTO bookings (
                id, package_id, package_title, guest_name, guest_email, guest_phone,
                total_amount_php, downpayment_paid_php, balance_due_php, payment_status,
                status, booking_date, travel_date, qr_code_data, notes,
                assigned_guide_id, assigned_boat_id, assigned_hotel_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id, $packageId, $packageTitle, $guestName, $guestEmail, $guestPhone,
            $totalAmountPhp, $downpaymentPaidPhp, $balanceDuePhp, $paymentStatus,
            $status, $bookingDate, $travelDate, $qrCodeData, $notes,
            $assignedGuideId, $assignedBoatId, $assignedHotelId
        ]);

        // Automatically log audit entry
        try {
            $auditStmt = $pdo->prepare("
                INSERT INTO audit_logs (id, timestamp, user_email, user_name, role, action, module, details, severity, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $auditStmt->execute([
                'aud-' . substr(md5(uniqid(rand(), true)), 0, 8),
                date('Y-m-d H:i:s'),
                $guestEmail,
                $guestName,
                'Guest Client',
                'BOOKING_DOWNPAYMENT_LOGGED',
                'Booking Hub',
                "New booking confirmed: Ref {$id} for {$guestName} (₱" . number_format($downpaymentPaidPhp, 2) . " downpayment recorded).",
                'Info',
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);
        } catch (Exception $e) {
            // Non-blocking audit log
        }

        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(formatBooking($stmt->fetch()), 201);
        break;

    case 'PUT':
        $data = getJsonInput();
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        if (!$id) {
            jsonResponse(['error' => 'Booking ID is required'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            jsonResponse(['error' => 'Booking not found'], 404);
        }

        $status = $data['status'] ?? $existing['status'];
        $paymentStatus = $data['paymentStatus'] ?? $existing['payment_status'];
        $assignedGuideId = $data['assignedGuideId'] ?? $existing['assigned_guide_id'];
        $assignedBoatId = $data['assignedBoatId'] ?? $existing['assigned_boat_id'];
        $assignedHotelId = $data['assignedHotelId'] ?? $existing['assigned_hotel_id'];
        $notes = $data['notes'] ?? $existing['notes'];

        $stmt = $pdo->prepare("
            UPDATE bookings SET
                status = ?, payment_status = ?, assigned_guide_id = ?, assigned_boat_id = ?,
                assigned_hotel_id = ?, notes = ?
            WHERE id = ?
        ");
        $stmt->execute([$status, $paymentStatus, $assignedGuideId, $assignedBoatId, $assignedHotelId, $notes, $id]);

        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(formatBooking($stmt->fetch()));
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
