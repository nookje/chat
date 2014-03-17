function Helpers() {};

Helpers.prototype.getObjectLength = function(obj) {
    return Object.keys(obj).length;
};

Helpers.prototype.isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
};


module.exports = Helpers;