<?php
/**
 * ALYN SHIR - Guides Management API
 */
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function formatGuide($row) {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'dotAccreditationNo' => $row['dot_accreditation_no'],
        'languages' => !empty($row['languages']) ? json_decode($row['languages'], true) : ['English', 'Tagalog'],
        'specialty' => $row['specialty'],
        'yearsExperience' => (int)$row['years_experience'],
        'phone' => $row['phone'],
        'rating' => (float)$row['rating'],
        'status' => $row['status'],
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM guides ORDER BY rating DESC");
        jsonResponse(array_map('formatGuide', $stmt->fetchAll()));
        break;

    case 'PUT':
        $data = getJsonInput();
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        if (!$id) jsonResponse(['error' => 'Guide ID required'], 400);

        $stmt = $pdo->prepare("SELECT * FROM guides WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) jsonResponse(['error' => 'Guide not found'], 404);

        $status = $data['status'] ?? $existing['status'];
        $phone = $data['phone'] ?? $existing['phone'];

        $stmt = $pdo->prepare("UPDATE guides SET status = ?, phone = ? WHERE id = ?");
        $stmt->execute([$status, $phone, $id]);

        $stmt = $pdo->prepare("SELECT * FROM guides WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(formatGuide($stmt->fetch()));
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
