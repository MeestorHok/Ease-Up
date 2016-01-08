<?php // used by creator script

session_start();
include 'imports/connection.php';

if(!empty($_POST['ajax'])) {
    $query = "INSERT INTO lessons (creator, title, description, information) VALUES ('$_SESSION[username]', '$_POST[title]', '$_POST[description]', '$_POST[data]')";
    $result = mysqli_query($db, $query);
    if($result) {
        echo json_encode($_POST['callback']);
    }
}

?>