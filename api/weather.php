<?php
/**
 * ALYN SHIR - Dynamic Marine Weather & PAGASA Telemetry API
 * Generates dynamic tide, swell, wave, and wind telemetry across Philippine waters.
 */
require_once __DIR__ . '/config/db.php';

$stations = [
    ['destination' => 'Coron, Palawan', 'islandGroup' => 'Calamianes / Palawan'],
    ['destination' => 'El Nido, Palawan', 'islandGroup' => 'Bacuit Bay / Palawan'],
    ['destination' => 'Siargao Island', 'islandGroup' => 'Surigao / Mindanao'],
    ['destination' => 'Cebu & Bohol', 'islandGroup' => 'Mactan Strait / Visayas'],
    ['destination' => 'Batanes Archipelago', 'islandGroup' => 'Luzon Strait / Batanes'],
    ['destination' => 'Boracay & Romblon', 'islandGroup' => 'Sibuyan Sea / Visayas'],
];

$now = new DateTime();
$minutes = (int)$now->format('i');
$seconds = (int)$now->format('s');
$timeFactor = ($minutes * 7 + $seconds) % 100;

$results = [];

foreach ($stations as $idx => $st) {
    $isNorthern = strpos($st['destination'], 'Batanes') !== false;
    $tempVariation = round(sin($timeFactor + $idx) * 1.5, 1);
    $tempC = round(29 + $tempVariation);

    $waveBase = $isNorthern ? 1.4 : 0.6;
    $waveFluctuation = round(abs(sin($timeFactor * 0.2 + $idx * 1.5)) * 0.7, 1);
    $waveM = round($waveBase + $waveFluctuation, 1);

    $windKts = round(10 + ($idx * 2.5) + ($timeFactor % 8));
    $hasGale = ($waveM >= 2.2) || ($isNorthern && ($timeFactor % 10 < 3));

    $condition = 'Sunny & Calm';
    $seaCondition = 'Smooth (0.3m)';

    if ($hasGale) {
        $condition = 'Rough Seas';
        $seaCondition = 'Rough (Gale Warning)';
    } elseif ($waveM > 1.2) {
        $condition = 'Moderate Swells';
        $seaCondition = 'Moderate (1.2m - 2.0m)';
    } elseif ($waveM > 0.7) {
        $condition = 'Partly Cloudy';
        $seaCondition = 'Slight (0.6m - 1.0m)';
    }

    $tideHours = ((int)$now->format('H') + $idx * 2) % 24;
    $tideMinutes = ($minutes + $idx * 11) % 60;
    $tideTime = sprintf('%02d:%02d PHT', $tideHours, $tideMinutes);
    $tideType = ($idx % 2 === 0) ? 'High Tide' : 'Low Tide';

    $results[] = [
        'destination' => $st['destination'],
        'islandGroup' => $st['islandGroup'],
        'temperatureC' => $tempC,
        'condition' => $condition,
        'seaCondition' => $seaCondition,
        'waveHeightM' => $waveM,
        'windSpeedKts' => $windKts,
        'pcgGaleWarning' => $hasGale,
        'tideTime' => $tideTime,
        'tideType' => $tideType,
    ];
}

jsonResponse($results);
?>
