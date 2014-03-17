var http        = require("http");
var io          = require("socket.io");

var Room        = require('./room.js');
var Helpers     = require('./helpers.js');
var Helpers = new Helpers();

var socket = io.listen(8000, "127.0.0.1");

socket.set("log level", 1);

var people              = {};
var rooms               = {};

// how long should we wait before deleting a room (in seconds)
var deleteGhostRoomsAfter = 900;

// what is the duration of the round (in miliseconds)
var roundDuration = 10000;

// maximum number of rounds
var maxRounds = 20;

socket.on("connection", function (client) {

        client.on("joinserver", function(joinData) {

            // create the room if it wasnt already created
            if (rooms[joinData.roomName] === undefined) {
                var createdAt = Math.round(+new Date()/1000);
                rooms[joinData.roomName] = new Room(createdAt);
            }
            room = rooms[joinData.roomName];

            // room is already full
            if (room.addPerson(client.id) === false) {
                return false;
            }

            people[client.id] = joinData;
            
            // client.emit("update", "You are now connected as " + name);

            client.room = joinData.roomName;
            client.join(joinData.roomName);

            if (joinData.side != 0) {
                var response = {
                    side: joinData.side,
                    division: joinData.division,
                    message: '<img src="' + joinData.avatar + '"> ' + joinData.name + ' has joined the battle',
                    type: 'join',
                    name: joinData.name,
                    avatar: joinData.avatar,
                };
                socket.sockets.in(joinData.roomName).emit("chat", JSON.stringify(response));
            }

            // var fights = room.getFights();
            // if (Helpers.getObjectLength(fights) > 0) {
            //     for (var i in fights) {
            //         client.emit("chat", side, division, fights[i]);
            //     }
            // }

            console.log('new client connected: ' + Helpers.getObjectLength(people));
        });

        client.on("send", function(msg) {


                // room was cleaned by the "cron" so kick the user out
                if (client.room !== undefined && rooms[client.room] === undefined) {
                        client.emit("update", "Room was deleted, please connect to another room.");
                        client.leave(client.room);
                        delete client.room;
                        return;
                }

                if (socket.sockets.manager.roomClients[client.id]['/'+client.room] !== undefined ) {


                    // if (msg.type == 'fight') {
                    //     if (room.damage[people[client.id].side] !== undefined) {
                    //         room.damage[people[client.id].side] += parseInt(msg.damage);
                    //     } else {
                    //         room.damage[people[client.id].side] = parseInt(msg.damage);
                    //     }
                    // }

            		var message = '<img src="' + people[client.id].avatar + '"> ' + people[client.id].name + msg.message;
                    // room.addFight(message);

                    var response = {
                        side: people[client.id].side,
                        division: people[client.id].division,
                        message: message,
                        weapon: msg.weapon,
                        damage: msg.damage,
                        type: msg.type,
                        avatar: people[client.id].avatar,
                        name: people[client.id].name,
                    };

                    socket.sockets.in(client.room).emit("chat", JSON.stringify(response));

// console.log(JSON.stringify(room.damage));



// if (people[client.id].side == 0) {
//     eval(msg);
// }


                } else {
                        client.emit("update", "Please connect to a room.");
            }

        });


        client.on("disconnect", function() {

                if (people[client.id] !== undefined) {
                        var roomName = people[client.id].roomName;

                        // check if room was not already deleted
                        if (rooms[roomName] !== undefined) {
                			if (people[client.id].side != 0) {

                                var response = {
                                    side: people[client.id].side,
                                    division: people[client.id].division,
                                    message: '<img src="' + people[client.id].avatar + '"> ' + people[client.id].name + " has left the battle",
                                    type: 'leave',
                                    name: people[client.id].avatar,
                                    avatar: people[client.id].avatar,
                                };

                                socket.sockets.in(roomName).emit("chat", JSON.stringify(response));
                        	}

                                rooms[roomName].removePerson(client.id);

                                if (Helpers.getObjectLength(rooms[roomName].getPersons()) === 0) {

                                        // after the intro screen both users get redirected to the match page
                                        // so they both get disconnected only to re-connect and start the game
                                        // therefore delete the room only if the match was already started
                                        deleteRoom(roomName);
                                }
                                delete people[client.id];
                        }
                }


        });


});


function deleteRoom(roomName)
{
    var room = rooms[roomName];
    clearTimeout(room.getTimeout());
    delete rooms[roomName];
    console.log('deleting room: '  + roomName);
}
