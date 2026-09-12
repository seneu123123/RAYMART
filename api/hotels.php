<?php
/**
 * ALYN SHIR - Luxury Partner Hotels API
 */
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function formatHotel($row) {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'destination' => $row['destination'],
        'stars' => (int)$row['stars'],
        'contactPerson' => $row['contact_person'],
        'contactEmail' => $row['contact_email'],
        'contractRateDiscountPercent' => (int)$row['contract_rate_discount_percent'],
        'status' => $row['status'],
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM hotels ORDER BY stars DESC, name ASC");
        jsonResponse(array_map('formatHotel', $stmt->fetchAll()));
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
