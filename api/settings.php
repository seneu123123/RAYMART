<?php
/**
 * ALYN SHIR - System Settings & Compliance API
 */
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function formatSettings($row) {
    if (!$row) return null;
    return [
        'agencyName' => $row['agency_name'],
        'dotLicense' => $row['dot_license'],
        'address' => $row['address'],
        'contactPhone' => $row['contact_phone'],
        'contactEmail' => $row['contact_email'],
        'currencySymbol' => $row['currency_symbol'],
        'taxRatePercent' => (float)$row['tax_rate_percent'],
        'accentColor' => $row['accent_color'],
        'safetyChecklistMandatory' => (bool)$row['safety_checklist_mandatory'],
        'autoLockMinutes' => (int)$row['auto_lock_minutes'],
        'companyName' => $row['company_name'],
        'tinNumber' => $row['tin_number'],
        'pcgEmergencyHotline' => $row['pcg_emergency_hotline'],
        'pnpMaritimeHotline' => $row['pnp_maritime_hotline'],
        'downpaymentPercentageRequired' => (int)($row['downpayment_percentage_required'] ?? 30),
        'maxWaveHeightMeters' => (float)($row['max_wave_height_meters'] ?? 2.2),
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
        $settings = $stmt->fetch();
        if (!$settings) {
            jsonResponse([
                'agencyName' => 'ALYN SHIR Marine Expeditions & Luxury Charters Inc',
                'dotLicense' => 'DOT-ACCR-RO7-2026-8819',
                'address' => 'Pier 4 Marine Sanctuary Terminal, Cebu & Coron Bay Pier, Palawan',
                'contactPhone' => '+63 (02) 8892-ALYN / +63 917 888 2596',
                'contactEmail' => 'operations@alynshir.ph',
                'currencySymbol' => '₱',
                'taxRatePercent' => 12.0,
                'accentColor' => '#06b6d4',
                'safetyChecklistMandatory' => true,
                'autoLockMinutes' => 15,
            ]);
        }
        jsonResponse(formatSettings($settings));
        break;

    case 'PUT':
    case 'POST':
        $data = getJsonInput();
        $stmt = $pdo->prepare("
            UPDATE system_settings SET
                agency_name = COALESCE(?, agency_name),
                dot_license = COALESCE(?, dot_license),
                address = COALESCE(?, address),
                contact_phone = COALESCE(?, contact_phone),
                contact_email = COALESCE(?, contact_email),
                currency_symbol = COALESCE(?, currency_symbol),
                tax_rate_percent = COALESCE(?, tax_rate_percent),
                accent_color = COALESCE(?, accent_color),
                auto_lock_minutes = COALESCE(?, auto_lock_minutes)
            WHERE id = 1
        ");
        $stmt->execute([
            $data['agencyName'] ?? null,
            $data['dotLicense'] ?? null,
            $data['address'] ?? null,
            $data['contactPhone'] ?? null,
            $data['contactEmail'] ?? null,
            $data['currencySymbol'] ?? null,
            $data['taxRatePercent'] ?? null,
            $data['accentColor'] ?? null,
            $data['autoLockMinutes'] ?? null,
        ]);

        $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
        jsonResponse(formatSettings($stmt->fetch()));
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
