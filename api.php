<?php
$in = $_REQUEST;
$out = new stdClass();
if (array_key_exists("x", $in)) {
    switch ($in['x']) {
    case "get":
        $out = json_decode(file_get_contents("invoices.json"));
        break;
    case "put":
        $json = file_get_contents("php://input");
        if ($json) {
            $now = date("Ymdhi");
            $id = (array_key_exists("id", $in)) ? $in['id'] : $now;
            $obj = json_decode($json);
            $name = preg_replace("/\W/", '_', $obj->company);
            if (file_exists("./invoices/{$id}-{$name}.json")) {
                system("cp ./invoices/{$id}.json ./invoices/backup/{$id}-{$now}.json");
            }

            file_put_contents("invoices/{$id}.json", $json);
            $out = new stdClass();
            $out->id = $id;
            $out->filename = "invoices/{$id}.json";
            $out->modified = filemtime("invoices/{$id}.json");
            $out->filesize = filesize("invoices/{$id}.json");
            $out->status = "ok";
        }
        break;
    }        
}

header("Content-Type: application/json");
print json_encode($out);

?>
