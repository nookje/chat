<!DOCTYPE html>
<html lang="en">
<head>
    <title>nodejs</title>
    <script type="text/javascript" charset="utf-8" src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="http://127.0.0.1:8000/socket.io/socket.io.js"></script>
    <script src="bootstrap/js/bootstrap.js"></script>
    <link rel="stylesheet" type="text/css" href="bootstrap/css/bootstrap.css">

    <script src="client.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body style="width: 800px;">

    <div style="width: 306px; height: 543px; border-left: 1px solid green; float: left;">
        <?php for ($i = 1; $i <= 522; $i++) { ?>
            <div class="tile" id="<?= $i ?>"></div>
        <?php } ?>

        <div class="clear"></div>

        <div id="controls" class="controls">
            <a href="javascript:;" onclick="knockback();">Knockback</a>
            <a id="build" href="javascript:;" onclick="build();">Build</a>
        </div>


    </div>

    <ol id="msgs" style="width:300px; border: 1px solid #ccc; float: right;"></ol>

</body>
</html>
