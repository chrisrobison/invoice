<?php
$lines =file_get_contents("call-list.txt");
$calls = preg_split("/\n/", $lines);

$out = ["calls"=>[], "total"=>0];

$fline = array_shift($calls);
$fields = preg_split("/\|/", $fline);
$sum = 0;
foreach ($calls as $call) {
    $parts = preg_split("/\|/", $call);
    
    $new = [];
    for ($i=0; $i<count($fields); $i++) {
        $new[$fields[$i]] = $parts[$i];
    }
    if ($new['date']!="") {
        $out["calls"][] = $new;
        if ($new['duration'] < 900) {
            $sum += 900;
        } else {
            $sum += $new['duration'];
        }
    }
}
$out["total"] = (($sum / 60) / 60) . 'hrs';

header("Content-Type: application/json");

print json_encode($out);

