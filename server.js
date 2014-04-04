var http        = require("http");
var io          = require("socket.io");
var crypto      = require('crypto');

var Room        = require('./room.js');
var Helpers     = require('./helpers.js');
var Helpers     = new Helpers();

var socket      = io.listen(8000, "127.0.0.1");

var mcryptKey   = 'KCtHPRqYy8WbWNt4';
var people      = {};
var rooms       = {};

socket.set("log level", 1);

socket.on("connection", function (client) {

    client.on("joinserver", function(joinData) {

        // try{
        //     joinData = mcryptDecrypt(joinData);
        //     joinData = JSON.parse(joinData);
        // } catch (err) {
        //     console.log('join could not be decrypted');
        //     return;
        // }

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
        
        client.room = joinData.roomName;
        client.join(joinData.roomName);

        var msg = {
            type: 'join',
        };    

        var response = {
            side: joinData.side,
            division: joinData.division,
            message: '<img src="' + joinData.avatar + '"> ' + joinData.name + ' has joined the battle',
            msg: msg,
            name: joinData.name,
            avatar: joinData.avatar,
        };
        socket.sockets.in(joinData.roomName).emit("chat", JSON.stringify(response));

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

            try{
                msg = mcryptDecrypt(msg);
                msg = JSON.parse(msg);
            } catch (err) {
                console.log('message could not be decrypted');
                return;
            }

    		var message = '<img src="' + people[client.id].avatar + '"> ' + people[client.id].name + msg.message;

            var response = {
                side: people[client.id].side,
                division: people[client.id].division,
                message: message,
                msg: msg,
                avatar: people[client.id].avatar,
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

                var msg = {
                    type: 'leave',
                };    

                var response = {
                    msg: msg,
                    side: people[client.id].side,
                    division: people[client.id].division,
                    message: '<img src="' + people[client.id].avatar + '"> ' + people[client.id].name + " has left the battle",
                    name: people[client.id].avatar,
                    avatar: people[client.id].avatar,
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
});


function deleteRoom(roomName)
{
    delete rooms[roomName];
    console.log('deleting room: '  + roomName + '. rooms left: ' + Helpers.getObjectLength(rooms));
}


function mcryptDecrypt(crypted)
{
    // iv (initialization vector) is hidden in the encrypted message at 78% of the string
    var positionOfIV = Math.round((crypted.length - 16)/100*78);

    var iv = crypted.substr(positionOfIV, 16);

    var encryptedMessage = crypted.substr(0,positionOfIV) + crypted.substr(positionOfIV+16);

    var decipher = crypto.createDecipheriv('aes-128-cbc', mcryptKey, iv);
    var decrypted = decipher.update(encryptedMessage, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}