<?php
$in = $_REQUEST;

if (array_key_exists("x", $in)) {
    switch ($in['x']) {
    case "get":
        $out = file_get_contents("invoices.json");
        header("Content-type: application/json");
        print $out;
        exit;
        break;
    case "put":
        if (array_key_exists("data", $in)) {
            $now = date("Ymdhi");
            system("cp invoices.json invoices-$now.json");
            file_put_contents("invoices.json", $in['data']);
            $out = new stdClass();
            $out->status = "ok";
        break;
    }        
}
?>
