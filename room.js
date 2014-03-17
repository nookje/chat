var Helpers = require('./helpers.js');
var Helpers = new Helpers();


var peopleLimit = 2;
var lastFightsLimit = 10;

function Room(createdAt) {
    this.createdAt      = createdAt;
    this.showIntro      = false;
    this.matchStarted   = false;
    this.people         = {};
    this.messages       = {};
    this.timeout        = false;
    this.round          = 1;

    this.lastFights     = [];

    this.damage         = {};
};


Room.prototype.addFight = function(message) {

    if (Helpers.getObjectLength(this.lastFights) >= lastFightsLimit) {
        this.lastFights.pop();
    }   
    this.lastFights.unshift(message);
};


Room.prototype.getFights = function() {
    return this.lastFights;
};


Room.prototype.addPerson = function(personID) {

    if (Helpers.getObjectLength(this.people) < peopleLimit) {
        this.people[personID] = personID;
    } else {
        return false;
    }
};

Room.prototype.removePerson = function(personID) {
    delete this.people[personID];
};


Room.prototype.getPersons = function() {
    return this.people;
};

Room.prototype.addMessage = function(personID, message) {
    if (this.messages[personID] === undefined) {
        this.messages[personID] = message;
    }
    return false;
};

Room.prototype.getMessage = function(personID) {
    return this.messages[personID];
};

Room.prototype.getMessages = function() {
    return this.messages;
};

Room.prototype.removeMessages = function() {
    for (var i in this.messages) {
        delete this.messages[i];
    }
};

Room.prototype.getStarted = function() {
    return this.matchStarted;
};

Room.prototype.setStarted = function() {
    this.matchStarted = true;
};

Room.prototype.getShowIntro = function() {
    return this.showIntro;
};

Room.prototype.setShowIntro = function() {
    this.showIntro = true;
};

Room.prototype.getCreatedAt = function() {
    return this.createdAt;
};

Room.prototype.getTimeout = function() {
    return this.timeout;
};

Room.prototype.setTimeout = function(timeout) {
    this.timeout = timeout;
};

Room.prototype.setRound = function() {
    this.round++;
};

Room.prototype.getRound = function() {
    return this.round;
};

module.exports = Room;