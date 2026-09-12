<?php
/**
 * ALYN SHIR - Fleet Management API
 */
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function formatFleet($row) {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'type' => $row['type'],
        'capacity' => (int)$row['capacity'],
        'captain' => $row['captain'],
        'status' => $row['status'],
        'engineSpecs' => $row['engine_specs'],
        'pcgCertificateNo' => $row['pcg_certificate_no'],
        'insuranceExpiry' => $row['insurance_expiry'],
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM fleet ORDER BY name ASC");
        jsonResponse(array_map('formatFleet', $stmt->fetchAll()));
        break;

    case 'PUT':
        $data = getJsonInput();
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        if (!$id) jsonResponse(['error' => 'Vessel ID required'], 400);

        $stmt = $pdo->prepare("SELECT * FROM fleet WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) jsonResponse(['error' => 'Vessel not found'], 404);

        $status = $data['status'] ?? $existing['status'];
        $captain = $data['captain'] ?? $existing['captain'];
        $engineSpecs = $data['engineSpecs'] ?? $existing['engine_specs'];
        $insuranceExpiry = $data['insuranceExpiry'] ?? $existing['insurance_expiry'];

        $stmt = $pdo->prepare("UPDATE fleet SET status = ?, captain = ?, engine_specs = ?, insurance_expiry = ? WHERE id = ?");
        $stmt->execute([$status, $captain, $engineSpecs, $insuranceExpiry, $id]);

        $stmt = $pdo->prepare("SELECT * FROM fleet WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(formatFleet($stmt->fetch()));
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
