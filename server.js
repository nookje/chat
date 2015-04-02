var http        = require("http");
var io          = require("socket.io");

var Room        = require('./room.js');
var Helpers     = require('./helpers.js');
var Helpers     = new Helpers();

var socket      = io.listen(8000, "127.0.0.1");

var people      = {};
var rooms       = {};
var clients     = {};
var sessions    = {};

socket.set("log level", 1);

socket.on("connection", function (client) {

    client.on("joinserver", function(joinData) {

        room = getRoom(joinData.roomName);

        // room is already full
        if (room.addPerson(client.id, joinData) === false) {
            var response = {
                message: ' room is full',
                name: joinData.name,
            };

            client.emit("chatToClient", JSON.stringify(response));
            return;
        }

        people[client.id] = joinData;
        
        client.room = joinData.roomName;
        client.join(joinData.roomName);

        clients[client.id] = client;

        sessions[joinData.sessionId] = client.id;

        var response = {
            message: ' has joined room ' + client.room,
            name: joinData.name,
        };

        socket.sockets.in(joinData.roomName).emit("chatToClient", JSON.stringify(response));
        socket.sockets.in(joinData.roomName).emit("updateClientList", JSON.stringify(people));

        console.log('new client connected: ' + Helpers.getObjectLength(people));
    });


    client.on("chatToServer", function(data) {

        // room was cleaned by the "cron" so kick the user out
        if (client.room !== undefined && rooms[client.room] === undefined) {
            var response = {
                message: "Room was deleted, please connect to another room.",
                name: people[client.id].name,
            };

            client.emit("chatToClient", response);
            client.leave(client.room);
            delete client.room;
            return;
        }

        if (socket.sockets.manager.roomClients[client.id]['/'+client.room] !== undefined ) {

            sendMessage(client, data);

        } else {
            var response = {
                message: "Please connect to a room.",
                name: people[client.id].name,
            };

            client.emit("chatToClient", response);
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
                socket.sockets.in(roomName).emit("chatToClient", JSON.stringify(response));

                rooms[roomName].removePerson(client.id);

                if (Helpers.getObjectLength(rooms[roomName].getPersons()) === 0) {
                    deleteRoom(roomName);
                }
                delete people[client.id];
                delete clients[client.id];
                socket.sockets.in(roomName).emit("updateClientList", JSON.stringify(people));
            }
        }
    });
    
});


function sendMessage(client, data)
{
    var response = {
        message: data.message,
        name: people[client.id].name,
    };


    if (people[client.id].userType == 'client') {
        recipient = clients[rooms[client.room].agentId];
        response.destinatar = client.id;
    } else if (people[client.id].userType == 'agent') {
        recipient = clients[data.recipient];
        response.destinatar = recipient.id;
    }

    response = JSON.stringify(response);

    // trimitem mesajul la destinatar
    recipient.emit("chatToClient", response);

    // trimitem mesajul si la omul care a facut send
    client.emit("chatToClient", response);
}

function deleteRoom(roomName)
{
    delete rooms[roomName];
    console.log('deleting room: '  + roomName + '. rooms left: ' + Helpers.getObjectLength(rooms));
}

function getRoom(roomName)
{
    // create the room if it wasnt already created
    if (rooms[roomName] === undefined) {
        var createdAt = Math.round(+new Date()/1000);
        rooms[roomName] = new Room(createdAt);
    }
    return rooms[roomName];
}
