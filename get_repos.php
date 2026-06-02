<?php
// Activar errores para depurar el error 500
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Leer archivo .env de forma segura
$envFile = __DIR__ . '/.env';
$githubToken = '';

if (is_readable($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2); // Divide la línea en nombre y valor
        if (count($parts) === 2) { // Asegura que hay un nombre y un valor
            $name = trim($parts[0]);
            $value = trim($parts[1], " \t\n\r\0\x0B\"'"); 
            if ($name === 'GITHUB_TOKEN') {
                $githubToken = $value;
            }
        }
    }
}

if (!$githubToken) {
    $githubToken = getenv('GITHUB_TOKEN');
}

if (!$githubToken) {
    echo json_encode([
        "error" => "No se pudo cargar el GITHUB_TOKEN.",
        "debug" => ["archivo_existe" => file_exists($envFile)]
    ]);
    exit;
}

$githubUser = 'hemmerlingd';

$action = isset($_GET['action']) ? $_GET['action'] : 'repos';
$repoName = isset($_GET['repo']) ? $_GET['repo'] : '';

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Daevid-Portfolio-App');

$headers = [
    "Authorization: Bearer $githubToken",
    "X-GitHub-Api-Version: 2022-11-28"
];

if ($action === 'readme' && !empty($repoName)) {
    $url = "https://api.github.com/repos/$githubUser/$repoName/readme";
    $headers[] = "Accept: application/vnd.github.v3.raw";
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    header("Content-Type: text/plain");
    http_response_code($httpcode);
    echo $response;
    curl_close($ch);
    exit;
}

// Obtener repositorios
$url = "https://api.github.com/user/repos?affiliation=owner&sort=updated&per_page=100";
$headers[] = "Accept: application/vnd.github+json";

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => "cURL error: " . curl_error($ch)]);
    curl_close($ch);
    exit;
}

$repos = json_decode($response, true);

if (!is_array($repos)) {
    http_response_code(500);
    echo json_encode(["error" => "Invalid response from GitHub API"]);
    curl_close($ch);
    exit;
}

// Check if the response is a GitHub API error object (e.g., {"message": "Bad credentials"})
if (is_array($repos) && isset($repos['message']) && is_string($repos['message'])) {
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    http_response_code($httpcode >= 400 ? $httpcode : 500);
    echo json_encode(["error" => "GitHub API Error: " . $repos['message']]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Filtrar repos: solo los que tienen README
// Procesamiento secuencial (compatible con hostings restringidos como InfinityFree que bloquean curl_multi)
$filtered_repos = [];

foreach ($repos as $repo) {
    // Asegurarse de que el objeto repo sea válido y tenga un nombre
    if (!is_array($repo) || !isset($repo['name'])) {
        continue; 
    }
    $rName = $repo['name'];
    $ch_sync = curl_init("https://api.github.com/repos/$githubUser/$rName/readme");
    curl_setopt($ch_sync, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch_sync, CURLOPT_NOBODY, true); // Solo verificar existencia (HEAD)
    curl_setopt($ch_sync, CURLOPT_USERAGENT, 'Daevid-Portfolio-App');
    curl_setopt($ch_sync, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch_sync, CURLOPT_TIMEOUT, 5); // Timeout corto para no colgar el script
    
    curl_exec($ch_sync);
    if (curl_getinfo($ch_sync, CURLINFO_HTTP_CODE) == 200) {
        $filtered_repos[] = $repo;
    }
    curl_close($ch_sync);
}

echo json_encode($filtered_repos);
