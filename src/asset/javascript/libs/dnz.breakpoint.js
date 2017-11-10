// breakPoint script 0.4 www.denieuwezaak.nl
var dnz = dnz || {};

dnz.breakPoint = (function ($, global) {

    var me = {
    	/*
    	 * Internal/private: The current breakpoint cache
    	 */ 
        _current: null,
        
        /*
         * Internal/private: The current isRetina value cache
         */
        _isRetina: null,
        
        /*
         * Internal/private: The mediaquary used for determining if the screen is Retina
         */
    	_isRetinaMediaQuery:  "(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)",
            
        /*
         *  The mediaqueries for determining the breakpoints
         *  It's possible to add/remove breakpoints
         */  
        _breakPointMediaQueries : {
            1: "(max-width: 480px)",
            2: "(min-width: 480px) and (max-width: 768px)",
            3: "(min-width: 768px) and (max-width: 1024px)",
            4: "(min-width: 1024px) and (max-width: 1280px)",
            5: "(min-width: 1280px)"
        },
        
        /*
         * Initialize the module
         */
    	init: function(){    
    		$(global).smartresize(function () {
    			me.update();
    		});
    	},
    	
    	/*
    	 * Gets if a screen is Retina
    	 * 
    	 * First, checks if the local _isRetina variable is filled,
    	 * if not , set the variable
    	 * 
    	 * Returns true(booL) if a screen is Retina
    	 * Returns false(bool) if a screen is not Retina
    	 */
        getIsRetina: function () {            
            if(me._isRetina != null) {
                return me.isRetina;
            } else {
                me._isRetina = me._determineIsRetina();              
                return me._isRetina;
            }
        },
        
        /*
         * Gets the current breakpoint
         * 
         * First, checks if the local _current variable is filled,
         * if not, fills the local _current value,
         * 
         * Returns a number, based on the current breakpoint
         */
        getCurrent: function() {
            if(me._current != null) {
                return me._current;
            } else {
                me._current = me._determineBreakpoint();
                return me._current;
            }
        },
        
        /*
         * Updates the local _current and _isRetina variable and:
         * breakPoint: Filled with the current breakpoint value
         * isRetina: Filled with the isRetina value
         */
        update: function(){         
            me._current = me._determineBreakpoint();
            me._isRetina = me._determineIsRetina();
        },
        
        /*
         * Gets if the current viewportsize is larger(wider) than the given pixels
         * Used the matchMedia (min-width) function
         * 
         * Return true or false
         * 
         */
        getLargerThan: function(pixels) {
            return global.matchMedia("(min-width: "+ pixels + "px)").matches;
        },
        /*
         * Gets if the current viewportsize is smaller(narrower) than the given pixels
         * Used the matchMedia (max-width) function
         * 
         * Return true or false
         */
        getSmallerThan: function(pixels) {
            return global.matchMedia("(max-width: "+ pixels + "px)").matches;
        },
        
        /*
         * Internal/private: used for determining the current breakpoint
         * 
         */
        _determineBreakpoint: function() {
            var returnBreakpoint;
            $.each(me._breakPointMediaQueries, function (breakPoint, mediaQuery) {
                if(global.matchMedia(mediaQuery).matches) {
                    returnBreakpoint = breakPoint;
                    return false;
                }
            });
            return returnBreakpoint;
        },
        
        /*
         * Internal/private: used for determining if the screen is Retina
         * 
         */
        _determineIsRetina: function() {
            if (global.devicePixelRatio && window.devicePixelRatio > 1 || global.matchMedia && window.matchMedia(me.isRetinaMediaQuery).matches) {
                return true;
            }
            return false;
        }
    };
    
    return me;
}(jQuery, window));
