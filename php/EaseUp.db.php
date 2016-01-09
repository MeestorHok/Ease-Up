<?php // used by creator script

$db = mysqli_connect("127.0.0.1", "meestorhok", "", "c9", 3306)or die(mysql_error());

if(!empty($_POST['ajax'])) {
    $query = "INSERT INTO uploads (data) VALUES ('$_POST[data]')";
    $result = mysqli_query($db, $query);
    if($result) {
        echo json_encode($_POST['callback']);
    }
}

?>