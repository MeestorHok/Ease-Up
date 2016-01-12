<?php // Used to upload files

$file = $_FILES['file'];
$file_destination = $_POST['newFilename'];

if (!empty($file) && !empty($_POST['ajax'])) {
    if($file['error'] == 0 && move_uploaded_file($file['tmp_name'], $file_destination)) {
        die();
    }
}

?>
