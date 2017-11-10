$(function() {
	"use strict";
	var addHandle = function(o){
	 o.style.cursor="move";
	 o.addEventListener("mousedown", mousedown, false)
	};
	var mousedown = function(evt){
	 var oStyle = evt.target.ownerDocument.documentElement.style;
	 oStyle.WebkitUserSelect = "none";
	 oStyle.MozUserSelect = "none";
	 oStyle.MsUserSelect = "none";
	 oStyle.userSelect = "none";

	 evt.target.nX = evt.pageX;
	 evt.target.nY = evt.pageY;

	 evt.target.addEventListener("mouseup", mouseup);
	 evt.target.addEventListener("mousemove", mousemove);
	};
	var mouseup = function(evt){
	 evt.target.style.cursor = "move";

	 var oStyle = evt.target.ownerDocument.documentElement.style;
	 oStyle.WebkitUserSelect = "all";
	 oStyle.MozUserSelect = "all";
	 oStyle.MsUserSelect = "all";
	 oStyle.userSelect = "all";

	 evt.target.removeEventListener("mousemove", mousemove);
	 evt.target.removeEventListener("mouseup", mouseup);
	};
	var mousemove = function(evt){
	 var oFrame = window.frameElement;
	 var oRect = oFrame.getBoundingClientRect();
	 var nX = oRect.left - (evt.target.nX - evt.pageX);
	 var nY = oRect.top - (evt.target.nY - evt.pageY);
	 nX = (nX >= 0? nX:0);
	 nY = (nY >= 0? nY:0);

	 oFrame.style.left = nX.toString()+"px";
	 oFrame.style.top = nY.toString()+"px";
	};
	(function(){

      var elems = $('.draggable:not(.slick-list)'); //rule out slick-lists
      $(elems).each(function() {
          addHandle(this);
      });
	 /*var Elems = document.getElementsByClassName("draggable");
	 for (var nPos = 0; nPos < Elems.length; nPos++) {
	  addHandle(Elems[nPos]);
	 }*/
	})();

	$.ajaxSetup({
		cache: false,
		error: function (obj2, status2, err) {
			console.log(obj2.responseText);
			console.log(err);
		}
	});

	// MOBILE NAV - TOGGLE CLICK
    /*
        Main nav. and top nav. are 'working' together.
        We want to open either one of them, and not both.
        Thus, when we click on main nav, we want the top header nav to disappear, and vice versa.
     */
	var $html = $('html');
	var $navLabel = $('#nav-label');
	var mainNavOpened = 'nav-open';
    var $headerSubnav = $('.navbar-item.has-sub');
    var $headerSubnavParentLink = $('.navbar__parentlink');
    var headerSubnavOpened = '_is_open';

	$navLabel.on('click', function(e) {
		e.preventDefault();
        $html.toggleClass(mainNavOpened);
		noScroll();

        if ( $headerSubnav.hasClass(headerSubnavOpened) ) {
            $headerSubnav.removeClass(headerSubnavOpened);
            $html.addClass(mainNavOpened);
        }
	});

    // Topheader subnav
    $headerSubnav.bind('tap', function() {
        $(this).toggleClass(headerSubnavOpened);

        if ( $html.hasClass(mainNavOpened) ) {
            $html.removeClass(mainNavOpened);
            $headerSubnav.addClass(headerSubnavOpened);
        }

        // Prevents opening the link
        $headerSubnavParentLink.on('click', function(e) {
            e.preventDefault();
        });
    });

    // Hides the nav when the html/body is tapped
    $('html, body').bind('tap', function() {
        if ( $headerSubnav.hasClass(headerSubnavOpened) ) {
            $headerSubnav.removeClass(headerSubnavOpened);
        }
    });

	// MOBILE NAV - TOGGLE SWIPE
	Hammer('html.touch').on("swipeleft", function() {
		if ((($('.nav-open').length) > 0) && (window.matchMedia("(max-width: 768px)").matches)) {
			$('html, #wrapper, .footer').removeClass('nav-open');
			noScroll();
		}
	});

	// HOVERINTENT lte9
	$(".lte9 #header-mainnav").hover(function() {
		var nav = $(this);
		setTimeout(function() {
			nav.addClass("hoverIntent");
		}, 200);
	}, function() {
		$(this).removeClass("hoverIntent");
	});

	// CLICKLIST (v1.0)
	$('.clickList').on('click', '> *', function (event) {
		if ($(event.target).is(":not('a, input, label, label *, select')")) {
			window.location = $(this).find('a').attr('href');
		}
	});

	// EXTERNAL LINKS in new tab/window (v1.0)
	$('a[rel="external"]').click(function (event) {
		window.open($(this).attr('href'));
		event.preventDefault();
	});

	$('.btn.disabled').on('click', function(e) {
		e.preventDefault();
	});

	// IMAGE CAPTIONS (v1.0)
	$('img.imgLeft[title],img.imgRight[title],img.imgCenter[title]').each(function() {
		var caption = $(this).attr("title");
		$(this).wrap('<figure class="' + $(this).attr("class") + '" style="max-width: 100%; width: ' + $(this).attr("width") + 'px;"><\/figure>').removeAttr("title").removeAttr("class");
		$(this).parent().append('<figcaption>' + caption + '<\/figcaption>');
	});

	if ( $('html').is('.touch') ) {
		window.addEventListener("orientationchange", function() {}, false);
	}

	FormFields.Init();

	if(dnz.breakPoint.getCurrent() > 2) {
	    $('.header-mainnav li.hasSubNav, .headerBasket').hoverOnTouch();
	}

	$(".tooltip.theme01").tooltip({
	    position: { my: "center bottom-15", at: "left+15 center" },
	    tooltipClass: "theme01",
	    content: function() {
            return $(this).prop('title');
        }
	});
});

// No scroll on open nav
function noScroll() {
	if (($('.nav-open').length) && (dnz.breakPoint.getCurrent() < 3)) {
		$('#content').on('touchmove', function (e) {
			e.preventDefault();
		}).on('click', function (e) {
			e.preventDefault();
		});
	} else {
		$('#content, #content > *, .footer, #subHeader').unbind('touchmove').unbind('click');
	}
}

// Override the 'more' links with custom script, because of the tabs in the search results page
function setMoreLinks() {
	$('.ac_results .products .footer a.showMoreLink').unbind('click').bind('click', function (e) {
		e.preventDefault();
		GoToSearchResult(this, 'producten');
	});
	$('.ac_results .combinations .footer a.showMoreLink').unbind('click').bind('click', function (e) {
		e.preventDefault();
		GoToSearchResult(this, 'combinaties');
	});
	$('.ac_results .information .footer a.showMoreLink').unbind('click').bind('click', function (e) {
		e.preventDefault();
		GoToSearchResult(this, 'overigen');
	});
}

function GoToSearchResult(el, searchTab) {
	var searchSection = $(el).closest('section.search');
	var hidSearchTab = searchSection.find('#hidSearchTab');
	var btnSearch = searchSection.find('.btnSubmitSearch');
	hidSearchTab.val(searchTab);
	window.location.href = btnSearch.attr('href');
}

// CUSTOM SELECT FOR CREATING CUSTOM LISTS
function customSelect(){
	$('html').click(function(event) {
		if ($(event.target).is(":not('div.customSelect, div.customSelect *')") ) {
			$('div.customSelect').closest('.customSelectContainer').removeClass('active');
			$('.basket .description .fields > li').removeClass('active');
		}
	});
	$('.customSelect > span').unbind('click').click(function() {
		if ( dnz.breakPoint.getSmallerThan(768)  ) {
			$(this).closest('.customSelectContainer').toggleClass('active').siblings().removeClass('active');
			var topPos = $(this).offset().top;
			$('html, body').animate({ scrollTop: topPos - 100 });
		} else {
			$(this).closest('.customSelectContainer').toggleClass('active').siblings().removeClass('active');
			$(this).parents('.basket .description .fields > li').toggleClass('active').siblings().removeClass('active');
		}
	});
}

function stickyElements() {
    $('.cart-sticky').sticky({
        marginTop: 120,
        type: 'container'
    });
}

function categoryFilterLister() {
    var $dataFilterSelect = $('.categoryFilter_select');

    $dataFilterSelect.on('change', function() {
        var selectedOption = $(this).find(':selected').data('filterOption');
        window.location.href = selectedOption;
    });
}

$(document).ready(function() {
    var windowWidth = $(window).width(),
        tabletWidth = 1024,
        $stickyContainer = $('.container__sticky'),
        $stickySiblings = $stickyContainer.siblings(),
        stickyAndSiblingsHeights = $stickyContainer.outerHeight(true) + $stickySiblings.outerHeight(true),
        $productSearch = $('.productSearch'),
        productSearchHeight = $productSearch.outerHeight(true),
        $navItemWithSub = $('.navItem.hasSubNav'),
        $subnav = $('.subNav'),
        $categoryFilterDropdown = $('.categoryFilter_dropdown');

    if ($categoryFilterDropdown) {
        categoryFilterLister();
    }

    $navItemWithSub.mouseenter(function() {
        $subnav.stop(true, false).fadeIn(250);
    }).mouseleave(function() {
        $subnav.stop(true, false).fadeOut(250);
    });

    // Replaces SVG Images to PNG on browsers which don't support SVG
    if ($("html").hasClass("no-svg")) {
        $('img[src*="svg"]').attr('src', function() {
            return $(this).attr('src').replace('.svg', '.png');
        });
    }

    // Sticky Element on Checkout Overview
    if (windowWidth > tabletWidth) {
        if ($stickyContainer.length) {
            if (productSearchHeight > stickyAndSiblingsHeights) {
                stickyElements();
            }
        }
    }

    // TOGGLE SHOPPING LIST ON ORDER CONFIRMATION PAGE
    var $cartToggle = $('.cartToggle');
    if ($cartToggle) {
        $cartToggle.on('click', function(){
            $('.productSearch.minimal').toggle();
        });
    }
});
