var socket = false;

$(document).ready(function() {
    socket = io.connect("127.0.0.1:8000");

    socket.on("chatToClient", function(response) {
        response = JSON.parse(response);

        if (response.players) {
            updatePosition(response.players);
        }
        $("#msgs").prepend("<li><b>" + response.name + "</b>: " + response.message + "</li>");
    });

    socket.on("disconnect", function(){
        $("#msgs").prepend("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
    });

    socket.on("reconnect", function() {
        joinServer();
    });

    socket.on("updatePosition", function(members) {
        members = JSON.parse(members);
        updatePosition(members);
    });

    socket.on("victory", function(player) {
        player = JSON.parse(player);
        $("#controls").html(player.name + ' has won the match').addClass('victory');
    });

    $("#chat").hide();
    $("#name").focus();

    $("#form_join").submit(function(event){
        event.preventDefault();
        joinServer($("#room_name").val(), $("#name").val());
    });

    $("#form_send").submit(function(event){
        event.preventDefault();
        sendMessage();
    });

    joinServer();

});

function sendMessage(message)
{
    socket.emit("chatToServer", message);
}

function joinServer()
{
    var room = getParameterByName('room');
    var name = getParameterByName('name');

    if (room != "" && name != "") {

        var joinData = {
            roomName: room,
            name: name,
        };

        socket.emit("joinserver", joinData);
    }

}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function updatePosition(members)
{
    $("div.position").removeClass('position').html("");

    $.each(members, function(key, value) {
        $("#" + value.position).html(value.name + value.energy).addClass('position');
    });
}

function knockback () 
{
    message = {
        type: "knockback"
    };
    sendMessage(message);
}


$( document ).ready(function() {
    $('div.tile').click(function() {
        message = {
            type: "move",
            position: this.id
        };
        sendMessage(message);
    });
});