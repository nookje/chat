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

Helpers.prototype.randomIntFromInterval = function(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
};


module.exports = Helpers;