var socket = false;

$(document).ready(function() {
    socket = io.connect("127.0.0.1:8000");

    socket.on("chat", function(response) {
        response = JSON.parse(response);

        $("#msgs").prepend("<li><b>" + response.name + "</b>: " + response.message + "</li>");
    });

    socket.on("disconnect", function(){
        $("#msgs").prepend("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
        $("#msg").attr("disabled", "disabled");
        $("#send").attr("disabled", "disabled");
    });

    socket.on("reconnect", function() {
        joinServer();
    });

    socket.on("updatePosition", function(members) {
        updatePosition(members);
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

function sendMessage()
{
    var msg = $("#msg");

    socketMsg = {
        type: 'chat',
        message: msg.val()
    };
    socket.emit("send", socketMsg);

    msg.val("");
}

function joinServer()
{
    var room = getParameterByName('room');
    if (room == "") {
        room = $("#room_name").val();
    }      
    var name = getParameterByName('name');
    if (name == "") {
        name = $("#name").val();
    }      

    if (room != "" && name != "") {

        var joinData = {
            roomName: room,
            name: name,
        };

        socket.emit("joinserver", joinData);
        $("#login").hide();
        $("#chat").show();
        $("#msg").focus();
        $("#msg").removeAttr("disabled");
        $("#send").removeAttr("disabled");
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

    members = JSON.parse(members);

    $.each( members, function( key , value) {
        $("div.player_" + value.name).removeClass('position player_' + value.name).html("");

        $("#tile_" + value.position).html(value.name);
        $("#tile_" + value.position).addClass('position player_' + value.name);
    });
}



$( document ).ready(function() {
    $('div.tile').click(function() {
        var parts = this.id.split("_");
        socketMsg = {
            position: parts[1]
        };
        socket.emit("move", socketMsg);
    });
});