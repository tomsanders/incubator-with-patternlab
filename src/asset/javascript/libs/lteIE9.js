$(function() {

	var isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());
	if (isWindowsPhone )
	{
		$('html').addClass('windowsMobile');
	}


});