var helpers = helpers || {};
(function(helpers) {
    // Use this helper to create timeouts
    var timeout = (function() {
        
        // Constructor
        function timeout(multipleTimeouts, fallBackDuration) {
            this.multipleTimeouts = multipleTimeouts == undefined ? false : multipleTimeouts;
            this.fallBackDuration = fallBackDuration == undefined ? 1000 : fallBackDuration;
            this.timeoutPool = []; 
        };
        
        // Handles a time-out
        timeout.prototype.handleTimeout = function(func, duration, id)
        {   
            if(func == undefined || func == null) {
                return;
            }
            
            duration = duration ? duration : this.fallBackDuration;
            
            var id = this.createTimeoutId(id);
            if(this.timeoutPool[id] != null) {                
                clearTimeout(this.timeoutPool[id]);
            }
            
            var self = this; //Stupid 'this' problem for anonymous functions -,-
            this.timeoutPool[id] = setTimeout(function() {  
                delete self.timeoutPool[id];
                func();
            }, duration);
        };
        
        timeout.prototype.createTimeoutId = function(id) {
            if(this.multipleTimeouts) {
                if(id == undefined) {
                    id = Math.random().toString(36).substring(7);
                }
            } else {
                id = 'timeout';
            }
            
            return id;
        };
                
        return timeout;
    })();
    helpers.timeout = timeout;
})(helpers || (helpers = {}));