<?php // used by creator script

session_start();
include 'imports/connection.php';

if(!empty($_POST['ajax'])) {
    $query = "INSERT INTO lessons (creator, title, description, information) VALUES ('$_SESSION[username]', '$_POST[titlePost]', '$_POST[descriptionPost]', '$_POST[infoPost]')";
    $result = mysqli_query($db, $query);
    if($result) {
        echo json_encode('thanks-for-uploading');
    }
}

?>