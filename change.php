<?php
// Authenticates user
$user = $_GET['TOKEN'] ?? null;
// If user is not authenticated, then exit
if (!$user) {
    header('WWW-Authenticate: Basic realm="My Realm"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Missing token';
    exit;
}

// Takes $flag as input from HTTP request
$flag = $_GET['flag'] ?? null;
// If $flag is not set, then exit
if (!$flag) {
    echo "No flag given";
    exit;
}

// Code below reads the flag.txt file and stores $flag value in file as JSON text
file_put_contents('flag.json', json_encode(array('flag' => $flag)));
