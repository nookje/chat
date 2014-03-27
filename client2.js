var milliseconds = 0;
var clickMilliseconds = 0;
var matchEnded = false;
var matchBeggins = false;


var distractColors = ['#4FFFE2', '#FFC46B', '#DA5EFF'];

var room_name = '';

$(document).ready(function() {
    var socket = io.connect("127.0.0.1:8000");
    var myRoomID = null;
    var ready = false;


    $("#chat").hide();
    $("#createRoomForm").hide();
    $("#name").focus();
    $("form").submit(function(event){
        event.preventDefault();
    });

    $("#join").click(function(){
      var name = $("#name").val();
      room_name = $("#room_name").val();
      if (room_name != "") {

        var joinData = {
          roomName: room_name,
          side: 0,
          division: 0,
          name: 'observer',
          avatar: 'http://www.erepublik.com/images/default_avatars/Citizens/default_male_55x55.gif',
        };

        socket.emit("joinserver", joinData);
        $("#login").detach();
        $("#chat").show();
        $("#msg").focus();
        ready = true;

      }
    });


    $("#send").click(function() {
      var msg = $("#msg").val();

        socketMsg = {
          type: 'chat',
          damage: 0,
          weapon: '0',
          message: msg
        };
        socket.emit("send", socketMsg);

      $("#msg").val("");
    });

    $("#msg").keypress(function(e) {
      if(e.which == 13) {
        var msg = $("#msg").val();
        socket.emit("send2", msg);
        $("#msg").val("");
      }
    });

    socket.on("chat", function(response) {

        response = JSON.parse(response);

        if ($("#msgs" + response.side).length == 0) {
          $("#msgs").append("<ul class='sides unstyled' id='msgs" + response.side + "'></ul>");

        }
        $("<li>" + response.message + "</li>").hide().prependTo("#msgs" + response.side).slideDown("normal");
    });



    socket.on("disconnect", function(){
      console.log('disconnect');
      // $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
      // $("#msg").attr("disabled", "disabled");
      // $("#send").attr("disabled", "disabled");
    });


    socket.on("reconnect", function() {
      console.log('reconnected to the server'); 

        var joinData = {
          roomName: room_name,
          side: 0,
          division: 0,
          name: 'observer',
          avatar: 'http://www.erepublik.com/images/default_avatars/Citizens/default_male_55x55.gif',
        };

        socket.emit("joinserver", joinData);      
      });


  if(getParameterByName('room')) {

        room_name = getParameterByName('room')
        var joinData = {
          roomName: room_name,
          side: 0,
          division: 0,
          name: 'observer',
          avatar: 'http://www.erepublik.com/images/default_avatars/Citizens/default_male_55x55.gif',
        };

          socket.emit("joinserver", joinData);
          $("#login").detach();
          $("#chat").show();
          $("#msg").focus();
          ready = true;
  }

});


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


