var Helpers = require('./helpers.js');
var Helpers = new Helpers();

var peopleLimit = 2000;

function Room(createdAt) {
    this.createdAt  = createdAt;
    this.people     = {};
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


Room.prototype.getCreatedAt = function() {
    return this.createdAt;
};

module.exports = Room;