<?php
// Code below reads the flag.txt file and prints value as JSON in screen
$flag       = file_get_contents('flag.json');
$jsonEncode = json_decode($flag, true);


print_r ($jsonEncode);
