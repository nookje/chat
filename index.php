<!DOCTYPE html>
<html lang="en">
<head>
    <title>The game</title>
    <script type="text/javascript" charset="utf-8" src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="http://127.0.0.1:8000/socket.io/socket.io.js"></script>

    <script src="bootstrap/js/bootstrap.js"></script>
    <link rel="stylesheet" type="text/css" href="bootstrap/css/bootstrap.css">
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="client.js"></script>

</head>
<body style="width: 800px;">

    <div style="width: 306px; height: 493px; border: 1px solid green; border-top:0; border-right:0; float: left;">
        <?php for ($i = 1; $i <= 522; $i++) { ?>
            <div class="tile" id="tile_<?= $i ?>"></div>
        <?php } ?>
    </div>

<!--     <div style = "float: left; width: 1100px;">
        <div class="row">
            <div class="span5 offset2" id="login">
                <form method="post" action="/" class="form-inline" id="form_join">
                    <input type="text" class="input-small" placeholder="Your name" id="name">
                    <input type="text" class="input-small" placeholder="Room name" id="room_name" value="test">
                    <input type="submit" name="join" id="join" value="Join" class="btn btn-primary">
                </form>
            </div>

            <div class="span5 offset2" id="chat">
                <form id="form_send" class="form-inline">
                    <input type="text" class="input" placeholder="Your message" id="msg">
                    <input type="submit" name="send" id="send" value="Send" class="btn btn-success">
                </form>
            </div>
        </div>
    </div> -->

    <ol id="msgs" style="width:300px; border: 1px solid #ccc; float: right;"></ol>

</body>
</html>
