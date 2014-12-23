var http        = require("http");
var io          = require("socket.io");

var Room        = require('./room.js');
var Helpers     = require('./helpers.js');
var Helpers     = new Helpers();

var socket      = io.listen(8000, "127.0.0.1");

var people      = {};
var rooms       = {};

var game        = {complexity: 18, min: 1, max: 522, energy: 15};



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

        // init players stats, skills etc
        room.getPerson(client.id).start = decideStartSide(joinData.roomName);
        room.getPerson(client.id).position = decideStartPosition(client);
        
        if (room.getPerson(client.id).start == 'top') {
            room.getPerson(client.id).energy = game.energy;
        } else {
            room.getPerson(client.id).energy = 0;
        }

        var response = {
            message: ' has joined room ' + client.room,
            name: joinData.name,
            players: room.getPersons(),
        };

        socket.sockets.in(joinData.roomName).emit("chatToClient", JSON.stringify(response));

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

            if (data.type == 'move') {
                movePlayer(client, data);
                return;
            }

            if (data.type == 'knockback') {
                knockback(client);
                return;
            }

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
            }
        }
    });
    
});


function movePlayer(client, data)
{
    room = rooms[client.room];
    player = room.getPerson(client.id);

    var diff = data.position - player.position;
    if (player.start == 'top') {
        // allowed moves
        if (diff != 1 && diff != -1 && diff != game.complexity) {
            return;
        }
    } else {
        // allowed moves
        if (diff != 1 && diff != -1 && diff != -game.complexity) {
            return;
        }
    }

    if (!consumeEnergy(client, 1)) {
        return;
    }

    player.position = data.position;

console.log(player);

    checkVictory(client);
    socket.sockets.in(client.room).emit("updatePosition", JSON.stringify(room.getPersons()));
}

function checkVictory(client)
{
    room = rooms[client.room];
    player = room.getPerson(client.id);

    var victory = false;
    if (player.start == 'top' && player.position > game.max - game.complexity) {
        victory = true;
    } else if (player.start == 'bottom' && player.position <= game.complexity) {
        victory = true;
    }

    if (victory) {
        player.energy = 0;
        socket.sockets.in(client.room).emit("victory", JSON.stringify(player));
    }

}


function sendMessage(client, data)
{
    var response = {
        message: data.message,
        name: people[client.id].name,
    };

    socket.sockets.in(client.room).emit("chatToClient", JSON.stringify(response));
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

function decideStartSide(roomName)
{
    room = rooms[roomName];

    if (room.getCount() == 0) {
        return 'top';
    }

    players = room.getPersons();

    for (i in players) {
        if (players[i].start == 'top') {
            return 'bottom';
        } else {
            return 'top';
        }
    }
}

function decideStartPosition(client)
{
    if (room.getPerson(client.id).start == 'top') {
        return Helpers.randomIntFromInterval(1,16);
    } else {
        return Helpers.randomIntFromInterval(506,522);
    }
}



function knockback(client)
{

    opponent = getOpponent(client);
    
    opponent.position = parseInt(opponent.position);
    
    if (opponent.start == 'top') {
        var position = opponent.position - game.complexity;
        if (position < 1) {
            return;
        }
    } else {
        var position = opponent.position + game.complexity;
        if (position > game.max) {
            return;
        }
    }

    if (!consumeEnergy(client, 4)) {
        return;
    }

    opponent.position = position;
    socket.sockets.in(client.room).emit("updatePosition", JSON.stringify(room.getPersons()));
}

function getOpponent(client)
{
    room = rooms[client.room];

    players = room.getPersons();

    for (i in players) {
        if (i != client.id) {
            var opponent = players[i];
        }
    }
    return opponent;    
}


function consumeEnergy(client, amount)
{
    room = rooms[client.room];
    player = room.getPerson(client.id);
    
    var diff = player.energy - amount;
    if (player.energy == 0 || diff < 0) {
        return false;
    }

    // consume players energy
    player.energy = diff;

    // next players turn
    if (diff == 0) {
        opponent = getOpponent(client);
        opponent.energy = game.energy;
    }

    return true;
}