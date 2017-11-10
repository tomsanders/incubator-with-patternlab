(function($) {

	//This function prevents a click on first touch where a hover action is intended.
	$.fn.hoverOnTouch = function() {
		var target = this;

		//Do not try to execute this script on IE8
		if($('html').hasClass('lt9')) {
			return;
		}

		//IE11 has its own aria functionality to solve the hover on touch issue.
		if($('html').hasClass('ie11')) {
			target.children('a').attr('aria-haspopup', true);
			return;
		}

		//Record last touch time. If element touch time == last touch time then touch action has already been executed and the click event may be fired.
		$.___lastTouchTime = new Date().getTime();
		var resetLastTouch = function() {
			$.___lastTouchTime = new Date().getTime();
		};

		//intercept the touch and prevent a click when data-touchtime != $.__lastTouchTime
		//set the current touch time to the touched element.
		target.bind("touchstart", function(e) {
			$(this).unbind("click");
			var el = $(this);
			var time = new Date().getTime();				
					
			if($.___lastTouchTime == el.attr('data-touchtime')) {
				el.removeAttr('data-touchtime');
			} else {
				el.one('click', function(ce) {
					ce.preventDefault();
					return false;
				});
				
				el.attr('data-touchtime', time);
			}
			
			$.___lastTouchTime = time;
			e.stopPropagation();			
		});

		//Bind click and touch to all elements so that a  popup can be closed without clicking through.
		//Only bind once per document.
		if(!$.___hoverOnTouchBoundToDocument) {			
			document.onclick = function(e) {
				if(!($(this).attr('data-touchtime'))) {
					resetLastTouch();
				}
				e.stopPropagation();
			}
			
			if ("ontouchstart" in document.documentElement) {
				document.ontouchstart = function(e) {
					if(!($(this).attr('data-touchtime'))) {
						resetLastTouch();
					}
					e.stopPropagation();
				}
			}
			
			$.___hoverOnTouchBoundToDocument = true;
		}
	};	
	
})(jQuery);