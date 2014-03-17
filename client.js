var milliseconds = 0;
var clickMilliseconds = 0;
var matchEnded = false;
var matchBeggins = false;

var cookieValue = $.cookie("login");

var distractColors = ['#4FFFE2', '#FFC46B', '#DA5EFF'];

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
      var room_name = $("#room_name").val();
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

        $.cookie("login", name);
      }
    });


    $("#send").click(function() {
      var msg = $("#msg").val();
      socket.emit("send2", msg);
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
          $("#msgs").append("<div class='sides unstyled' id='msgs" + response.side + "'><ul title='Division 1' class='sides unstyled' id='msgs" + response.side + "_1'></ul><ul title='Division 2' class='sides unstyled' id='msgs" + response.side + "_2'></ul><ul title='Division 3' class='sides unstyled' id='msgs" + response.side + "_3'></ul><ul title='Division 4' class='sides unstyled' id='msgs" + response.side + "_4'></ul></div>");

        }

        // $("#msgs" + side).prepend("<li>" + msg + "</li>");

        $("<li>" + response.message + "</li>").hide().prependTo("#msgs" + response.side + '_' + response.division).slideDown("normal");        
        // $("<li>" + msg + "</li>").hide().prependTo("#msgs" + side + '_1').slideDown("normal");        
        // $("<li>" + msg + "</li>").hide().prependTo("#msgs" + side + '_2').slideDown("normal");        
        // $("<li>" + msg + "</li>").hide().prependTo("#msgs" + side + '_3').slideDown("normal");        
        // $("<li>" + msg + "</li>").hide().prependTo("#msgs" + side + '_4').slideDown("normal");        
    })


    socket.on("disconnect", function(){
      // $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
      $("#msg").attr("disabled", "disabled");
      $("#send").attr("disabled", "disabled");
    });


});


