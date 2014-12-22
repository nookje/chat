var http        = require("http");
var io          = require("socket.io");

var Room        = require('./room.js');
var Helpers     = require('./helpers.js');
var Helpers     = new Helpers();

var socket      = io.listen(8000, "127.0.0.1");

var people      = {};
var rooms       = {};

socket.set("log level", 1);

socket.on("connection", function (client) {

    client.on("joinserver", function(joinData) {

        // create the room if it wasnt already created
        if (rooms[joinData.roomName] === undefined) {
            var createdAt = Math.round(+new Date()/1000);
            rooms[joinData.roomName] = new Room(createdAt);
        }
        room = rooms[joinData.roomName];

        // room is already full
        if (room.addPerson(client.id, joinData) === false) {
            var response = {
                message: ' room is full',
                name: joinData.name,
            };

            client.emit("chat", JSON.stringify(response));

            console.log('room full');
            return false;
        }

        people[client.id] = joinData;
        
        client.room = joinData.roomName;
        client.join(joinData.roomName);

        var person = room.getPerson(client.id);

        if (room.getCount() == 1) {
            position = Helpers.randomIntFromInterval(1,16);
        } else {
            position = Helpers.randomIntFromInterval(506,522);
        }

        person.position = position;

        var msg = {
            type: 'join',
        };    

        var response = {
            message: ' has joined room ' + client.room,
            name: joinData.name,
        };
        socket.sockets.in(joinData.roomName).emit("chat", JSON.stringify(response));

        socket.sockets.in(joinData.roomName).emit("updatePosition", JSON.stringify(room.getPersons()));

        console.log('new client connected: ' + Helpers.getObjectLength(people));
    });


    client.on("send", function(data) {

        // room was cleaned by the "cron" so kick the user out
        if (client.room !== undefined && rooms[client.room] === undefined) {
            client.emit("update", "Room was deleted, please connect to another room.");
            client.leave(client.room);
            delete client.room;
            return;
        }

        if (socket.sockets.manager.roomClients[client.id]['/'+client.room] !== undefined ) {

            var response = {
                message: data.message,
                name: people[client.id].name,
            };

            socket.sockets.in(client.room).emit("chat", JSON.stringify(response));
        } else {
            client.emit("update", "Please connect to a room.");
        }
    });


    client.on("disconnect", function() {

        if (people[client.id] !== undefined) {
            var roomName = people[client.id].roomName;

            // check if room was not already deleted
            if (rooms[roomName] !== undefined) {

                var response = {
                    message: people[client.id].name + " has left " + roomName,
                    name: people[client.id].name,
                };
                socket.sockets.in(roomName).emit("chat", JSON.stringify(response));

                rooms[roomName].removePerson(client.id);

                if (Helpers.getObjectLength(rooms[roomName].getPersons()) === 0) {
                    deleteRoom(roomName);
                }
                delete people[client.id];
            }
        }
    });


    client.on("move", function(data) {

        // room was cleaned by the "cron" so kick the user out
        if (client.room !== undefined && rooms[client.room] === undefined) {
            client.emit("update", "Room was deleted, please connect to another room.");
            client.leave(client.room);
            delete client.room;
            return;
        }

        if (socket.sockets.manager.roomClients[client.id]['/'+client.room] !== undefined ) {
            
            room = rooms[client.room];

            var person = room.getPerson(client.id);

            person.position = data.position;

            socket.sockets.in(client.room).emit("updatePosition", JSON.stringify(room.getPersons()));
        } else {
            client.emit("update", "Please connect to a room.");
        }
    });    
});


function setPersonPosition()
{

}

function deleteRoom(roomName)
{
    delete rooms[roomName];
    console.log('deleting room: '  + roomName + '. rooms left: ' + Helpers.getObjectLength(rooms));
}