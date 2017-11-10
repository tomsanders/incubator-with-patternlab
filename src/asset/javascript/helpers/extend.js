var helpers = helpers || {};
helpers.extend = (function () {
    var me = {};
    
    me.extendObject = function(object, extend) {
        object.prototype = Object.create(extend.prototype);
        object.constructor=object;
        object.prototype.parent = extend.prototype;
    };
    
    return me;
}());
