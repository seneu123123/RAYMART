<?php
/**
 * ALYN SHIR - Security & Operations Audit Logs API
 */
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100");
        $logs = $stmt->fetchAll();
        $formatted = array_map(function($row) {
            return [
                'id' => $row['id'],
                'timestamp' => $row['timestamp'],
                'userEmail' => $row['user_email'],
                'userName' => $row['user_name'],
                'role' => $row['role'],
                'action' => $row['action'],
                'module' => $row['module'],
                'details' => $row['details'],
                'severity' => $row['severity'],
                'ipAddress' => $row['ip_address'] ?? '127.0.0.1',
            ];
        }, $logs);
        jsonResponse($formatted);
        break;

    case 'POST':
        $data = getJsonInput();
        if (empty($data['action']) || empty($data['details'])) {
            jsonResponse(['error' => 'Action and details are required'], 400);
        }

        $id = $data['id'] ?? 'aud-' . substr(md5(uniqid(rand(), true)), 0, 8);
        $timestamp = $data['timestamp'] ?? date('Y-m-d H:i:s');
        $userEmail = $data['userEmail'] ?? 'staff@alynshir.ph';
        $userName = $data['userName'] ?? 'Operations Staff';
        $role = $data['role'] ?? 'Officer';
        $action = $data['action'];
        $module = $data['module'] ?? 'Operations';
        $details = $data['details'];
        $severity = $data['severity'] ?? 'Info';
        $ipAddress = $data['ipAddress'] ?? ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');

        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (id, timestamp, user_email, user_name, role, action, module, details, severity, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$id, $timestamp, $userEmail, $userName, $role, $action, $module, $details, $severity, $ipAddress]);

        jsonResponse(['success' => true, 'id' => $id], 201);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
