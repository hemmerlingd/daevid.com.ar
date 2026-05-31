<?php
header("Access-Control-Allow-Origin: *");

// Leer archivo .env de forma segura
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . '=' . trim($value));
    }
}

$githubToken = getenv('GITHUB_TOKEN') ?: '';
$githubUser = 'hemmerlingd';

$action = isset($_GET['action']) ? $_GET['action'] : 'repos';
$repoName = isset($_GET['repo']) ? $_GET['repo'] : '';

$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Daevid-Portfolio-App');

$headers = [
    "Authorization: token $githubToken",
    "X-GitHub-Api-Version: 2022-11-28"
];

if ($action === 'readme' && !empty($repoName)) {
    $url = "https://api.github.com/repos/$githubUser/$repoName/readme";
    $headers[] = "Accept: application/vnd.github.v3.raw";
    header("Content-Type: text/plain");
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    http_response_code($httpcode);
    echo $response;
    curl_close($ch);
    exit;
}

// Obtener repositorios
$url = "https://api.github.com/user/repos?affiliation=owner&sort=updated&per_page=100";
$headers[] = "Accept: application/vnd.github+json";
header("Content-Type: application/json");

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
curl_close($ch);

if (!is_array($repos) || isset($repos['message'])) {
    http_response_code(500);
    $errMsg = isset($repos['message']) ? $repos['message'] : "Invalid response from GitHub API";
    echo json_encode(["error" => $errMsg]);
    exit;
}

// Filtrar repos: solo los que tienen README usando curl_multi (peticiones HEAD en paralelo)
$mh = curl_multi_init();
$curl_handles = [];

foreach ($repos as $index => $repo) {
    $rName = $repo['name'];
    $rUrl = "https://api.github.com/repos/$githubUser/$rName/readme";
    
    $ch_multi = curl_init();
    curl_setopt($ch_multi, CURLOPT_URL, $rUrl);
    curl_setopt($ch_multi, CURLOPT_RETURNTRANSFER, true);
    // Cambiado de HEAD a GET porque algunas peticiones fallaban silenciosamente
    curl_setopt($ch_multi, CURLOPT_USERAGENT, 'Daevid-Portfolio-App');
    curl_setopt($ch_multi, CURLOPT_HTTPHEADER, $headers);
    
    curl_multi_add_handle($mh, $ch_multi);
    $curl_handles[$index] = $ch_multi;
}

$active = null;
do {
    $mrc = curl_multi_exec($mh, $active);
    if ($active) {
        // Wait a short time for more activity
        curl_multi_select($mh);
    }
} while ($active && $mrc == CURLM_OK);

$filtered_repos = [];
foreach ($curl_handles as $index => $ch_multi) {
    $httpcode = curl_getinfo($ch_multi, CURLINFO_HTTP_CODE);
    // 200 OK significa que el README existe
    if ($httpcode == 200) {
        $filtered_repos[] = $repos[$index];
    }
    curl_multi_remove_handle($mh, $ch_multi);
    curl_close($ch_multi);
}
curl_multi_close($mh);

echo json_encode($filtered_repos);
