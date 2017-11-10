$(function () {
	// JS detection	
	$('html').removeClass('no-js').addClass('js');

	var hasTouch = false;

	var onTouchStartPresent = 'ontouchstart' in window; // works on most browsers 
	var onGesturePresent = 'onmsgesturechange' in window; // works on ie10

	// Ripped from Modernizr 2.8.3
	 var d = "2.8.3",
            e = {},
            f = !0,
            g = document.documentElement,
            h = "modernizr",
            i = document.createElement(h),
            j = i.style,
            k, l = {}.toString,
            m = " -webkit- -moz- -o- -ms- ".split(" "),
            n = {},
            o = {},
            p = {},
            q = [],
            r = q.slice,
            s, t = function(a, c, d, e) {
                var f, i, j, k, l = document.createElement("div"),
                    m = document.body,
                    n = m || document.createElement("body");
                if (parseInt(d, 10))
                    while (d--) j = documentElement.createElement("div"), j.id = e ? e[d] : h +
                        (d + 1), l.appendChild(j);
                return f = ["&#173;", '<style id="s', h, '">', a, "</style>"].join(
                        ""), l.id = h, (m ? l : n).innerHTML += f, n.appendChild(
                        l), m || (n.style.background = "", n.style.overflow =
                        "hidden", k = g.style.overflow, g.style.overflow =
                        "hidden", g.appendChild(n)), i = c(l, a), m ? l.parentNode
                    .removeChild(l) : (n.parentNode.removeChild(n), g.style.overflow =
                        k), !!i
            },
            u = {}.hasOwnProperty,
            v;


	var touchMethod = function() {
       var c;
		return "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch ?
		c = !0 : t(["@media (", m.join("touch-enabled),("), h, ")",
			"{#modernizr{top:9px;position:absolute}}"
		].join(""), function(a) {
		c = a.offsetTop === 9
		}), c
    };
	// End of rip.

	// Touch detection with new call to touchMethod
	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch ||  (navigator.MaxTouchPoints > 0 || touchMethod())
      || (navigator.msMaxTouchPoints > 0)) {
      hasTouch = true;
    } 

	// TOUCH detection (V1.2)
	if (hasTouch) {
		// It's a touch screen device.
		$('html').addClass('touch');
		$('html').removeClass('no-touch');
	}

	//DETECT IOS
	$('html').addClass(navigator.userAgent.match(/(iPod|iPhone|iPad)/) ? 'ios' : 'no-ios');
	
	// DETECT ANDROID
	var ua = navigator.userAgent.toLowerCase();
	$('html').addClass(ua.indexOf("android") > -1 ? 'android' : 'no-android');

	// DETECT ANDROID < 4.3	
	if( ua.indexOf("android") >= 0 ) {
		var androidversion = parseFloat(ua.slice(ua.indexOf("android")+8)); 
		if (androidversion < 4.3) {
			$('html').addClass('crapDroid');
		}
	}

	if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) 
	{
	   $('html').addClass('safari');     
	}

	//DETECT MAC
	$('html').addClass((navigator.userAgent.indexOf('Mac') != -1) ? 'mac' : 'no-mac');

	//DETECT CHROME
	$('html').addClass(navigator.userAgent.toLowerCase().indexOf('chrome') > -1 ? 'chrome' : 'no-chrome');	
	
	// DETECT Windows phone	
	if (/windows phone/i.test(navigator.userAgent.toLowerCase()))
	{
		$('html').addClass('windowsMobile');
	}

    // DETECT SVG Support
	if (!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1")) {
	    $('html').addClass('no-svg');
	}
	
	// PLACEHOLDER SUPPORT (V1.0)
	$('html').addClass(('placeholder' in document.createElement('input')) ? 'placeholder' : 'no-placeholder');

	//DETECT DPR/RETINA
	if (window.devicePixelRatio >= 1.25) { }
	if (window.devicePixelRatio >= 1.3) { }
	if (window.devicePixelRatio >= 1.5) { }
	if (window.devicePixelRatio >= 2) { }

});