(function( $ ) {
    var defaults = {
        levels: 5,
        images: {}
    },

    privateVars = {
        minZoomSize: {
            width: null,
            height: null
        },
        maxZoomSize: {
            width: 1500,
            height: 1500
        },
        currentBreakpoint: 1,

        currentZoomLevel: 0,
        imageZoom: null,
        imageZoomContainer : null,
        retina: (window.devicePixelRatio > 1),
        ytUrl: '//www.youtube.com/embed/',
        vimeoUrl: '//player.vimeo.com/video/',
        isLt9: $('html').hasClass('lt9')
    },

    methods = {
        /*
         * init
         * start script and data to clickable element
         */
        init : function() {
            var self = $(this),
                settings = $.extend({}, defaults, arguments[0], privateVars);

            if(!createjs) {
                alert('Not all required plugins are loaded, check preloadjs');
            }

            // bind data to element
            $(this).data('zoom', settings);
            data = self.data('zoom');

            self.on('click', function () {
            	methods.show.call(self);
            });
        },

        /*
         * build
         * build HTML and add eventlisteners
         */
        build: function() {
            var self = $(this),
                data = self.data('zoom');

            data.imageZoom = '<div id="imageZoom">';
                data.imageZoom += '<div id="imageZoom_container">';
                    data.imageZoom += '<div>';
                        data.imageZoom += '<div class="imageZoom_image">';
                            data.imageZoom += '<img src="" alt="" />';
                        data.imageZoom += '</div>';
                    data.imageZoom += '</div>';
                data.imageZoom += '</div>';
                data.imageZoom += '<div id="imageZoom_controls">';
                    data.imageZoom += '<a href="#/zoom" class="imageZoom_btn imageZoom_close"><img src="/Styles/default/Images/zoom/ico_zoom_close.png" alt="zoom in" /></a>';
                    data.imageZoom += '<a href="#/zoom" class="imageZoom_btn imageZoom_zoom imageZoom_zoomIn"><img src="/Styles/default/Images/zoom/ico_zoom_plus.png" alt="zoom in" /></a>';
                    data.imageZoom += '<a href="#/zoom" class="imageZoom_btn imageZoom_zoom imageZoom_zoomOut"><img src="/Styles/default/Images/zoom/ico_zoom_min.png" alt="zoom in" /></a>';
                data.imageZoom += '</div>';
                data.imageZoom += '<div id="imageZoom_thumbs">';
                    data.imageZoom += '<ul>';
                    data.imageZoom += '</ul>';
                data.imageZoom += '</div>';
            data.imageZoom += '</div>';
            data.imageZoom = $(data.imageZoom);
            data.imageZoomContainer = data.imageZoom.find('#imageZoom_container');

            $('body').append(data.imageZoom);

            methods.eventListeners.call(self);
        },

        /*
         * show
         * show image and build preload thumbs and big image.
         */
        show: function () {
            var self = $(this),
                img = $(this).find('img');
                data = self.data('zoom'),
                numberOfThumbs = data.images.length,
                numberOfThumbsi = 0;
			
            methods.build.call(self);

            data.imageZoom.addClass('show');
            methods.hideImage.call(self);
            methods.setZoomSize.call(self);

            data.imageZoom.find('#imageZoom_thumbs ul *').remove();
            data.imageZoomContainer.find('img').attr('src', '');

            var index = arguments[0] ? arguments[0] : data.indexFromList.objects.find(data.indexFromList.selector).index();
            if(index >= numberOfThumbs) {
                if(console && console.log) {
                    console.log('jQuery.zoom: undefined index of thumb');
                }
                index = 0;
            }

            if(index == -1) {
                index = 0;
            }

            methods.setZoomImage.call(self, index);
            var ul = data.imageZoom.find('#imageZoom_thumbs ul');

            // append images
            $.each(data.images, function(key, value) {

                var item = $('<li><a href="#/zoom"><img src="" /></a></li>');
                ul.append(item);

                if(value.isVideo) {
                	item.addClass('video');
                }

                methods.preload.call(self, value.thumb, function(url) {
                    numberOfThumbsi++;

                    item.find('img').attr('src', url);
					
                    if(numberOfThumbsi >= numberOfThumbs) {
                    	data.imageZoom.find('#imageZoom_thumbs ul li').removeClass('selected').eq(index).addClass('selected');
                    }
                });
            });

            $('body').addClass('imageZoom');
            data.imageZoom.find('#imageZoom_thumbs ul li:first').addClass('selected');

            //Fixed the annoyance. (pressing backspace or hitting back button in browser will navigate to previous page)
            location.href = '#/zoom';
	        
            var interval = setInterval(function() {
                if(location.href.indexOf('#/zoom') == -1) {
                    methods.hide.call(self);
                    clearInterval(interval);
                }
            }, 100);
        },

        setZoomImage: function() {
            var self = $(this),
                data = self.data('zoom'),
                index = 0,
                image;

            if(arguments[0]) {
                index = arguments[0];
            }

            data.imageZoom.find('#imageZoom_thumbs ul li').eq(index).addClass('selected').siblings().removeClass('selected');

            methods.hideImage.call(self);

            data.imageZoomContainer.find('iframe').remove();
            data.imageZoomContainer.find('div.jwplayer').remove();

            if(data.images[index].isVideo)
            {
            	data.imageZoom.find('.imageZoom_zoomIn').addClass('disabled');
            	data.imageZoom.find('.imageZoom_zoomOut').addClass('disabled');

                data.imageZoomContainer.find('img').hide();
                var iframe, jwDiv;

                var isYouTube = !(typeof data.images[index].ytCode == typeof undefined || data.images[index].ytCode == false || data.images[index].ytCode == "");
	            var isVimeo = !(typeof data.images[index].vimeoCode == typeof undefined || data.images[index].vimeoCode == false || data.images[index].vimeoCode == "");
	            var isLocal = !(typeof data.images[index].videoUrl == typeof undefined || data.images[index].videoUrl == false || data.images[index].videoUrl == "");
				
	            if (isYouTube || isVimeo) {
	            	iframe = $('<iframe style="width: 100%; height: 100%; border: none;" />');

	            	if(isYouTube) {
	            		iframe.attr('src', data.ytUrl + data.images[index].ytCode + '?autoplay=1&controls=0&showinfo=0&modestbranding=1&loop=1');
	            	} else if (isVimeo) {
	            		iframe.attr('src', data.vimeoUrl + data.images[index].vimeoCode + '?autoplay=1&badge=0&title=0&byline=0&portrait=0&loop=1');
	            	}

	            	data.imageZoomContainer.find('> div').append(iframe);

	            	iframe.show();
                }

                if (isLocal) {
                	jwDiv = $('<div class="jwplayer" />');
                	jwDiv.uniqueId();

                	data.imageZoomContainer.find('> div').append(jwDiv);

                	data.jwPlayer = jwplayer(jwDiv.attr('id')).setup({
		                file: data.images[index].videoUrl,
		                width: "100%",
		                aspectratio: "16:9",
		                autostart: true
	                });
                }
				
                return;
            }

            data.imageZoomContainer.find('img').show();
            data.imageZoom.find('.imageZoom_zoomOut').addClass('disabled');
            data.imageZoom.find('.imageZoom_zoomIn').removeClass('disabled');

        	//Preload image

            data.imageZoomContainer.find('> div').addClass('preload');
            data.currentZoomLevel = 0;

            var breakpoint = methods.getNearestBreakpoint.call(self, data.images[index]);

            if(data.retina && data.images[index]['initial']['b' + breakpoint]['retina']) {
                image = data.images[index]['initial']['b' + breakpoint]['retina'];
            }
            else {
                image = data.images[index]['initial']['b' + breakpoint]['normal'];
            }

            methods.preload.call(self, image, function(url){
            	data.imageZoomContainer.find('img').attr('src', url).parent().removeClass('zoom');
                data.maxZoomSize = data.images[index]['zoom']['b' + breakpoint]['size'];

            	//Preload image
                data.imageZoomContainer.find('.preload').removeClass('preload');

                methods.centerImg.call(self, 0);
                methods.zoom.call(self, 'fit', function(){
                    methods.showImage.call(self, 300);
                });
            });
        },

        /*
         * hide
         * hide big image only
         */
        hide : function() {
            var self = $(this),
                data = self.data('zoom');

			if (data.jwPlayer && data.jwPlayer.stop) {
				data.jwPlayer.stop();
			}

			data.imageZoomContainer.find('div.jwplayer').remove();
			data.imageZoomContainer.find('iframe').remove();

            data.imageZoom.removeClass('show');
            $('body').removeClass('imageZoom');

            setTimeout(function () {
            	data.imageZoom.remove();
            }, 500);
        },

        /*
         * addListeners
         * add listeners to zoom
         */
        eventListeners: function() {
            var self = $(this),
                data = self.data('zoom');

            $(window).on('resize.zoom', function(){
                methods.setZoomSize.call(self);
            });

            var clickCount = 0,
                clickCountInterval,
                btnMouseDown,
                scroll,
                zoomed,
                img = data.imageZoomContainer.find('.imageZoom_image');

            data.imageZoom.hammer().on('pinch', function(e) {
                e.preventDefault();
                e.stopPropagation();

                //TODO: make pinch zooming work.

                //alert(e.height());

                //e.height(e.height() + (e.height() * -(1 - e.gesture.scale)));
            });

            data.imageZoom
                .on('click touchstart', '.imageZoom_close', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    location.hash = "";
                })
                .on('click touchstart', '#imageZoom_thumbs ul li a', function(e){
                    e.stopPropagation();

                    if ($(this).parent().hasClass('selected')) {
                        methods.zoom.call(self, 'fit', 'center');
                    }
                    else {
                        var imageIndex = $(this).parent().index();
	                    methods.setZoomImage.call(self, imageIndex);
                    }
                })
                .on('onmousedown mousedown touchstart', data.imageZoomContainer, function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    e = methods.mouseToTouch(e);

                    var img = data.imageZoomContainer.find('.imageZoom_image'),
                        startPos = {
                            x: e.screenX,
                            y: e.screenY
                        },
                        startImagePosition = {
                            x: parseInt(img.css('left'), 10),
                            y: parseInt(img.css('top'), 10)
                        };

                    $(window).on('onmousemove mousemove.img touchmove.img', function (e) {
                        e.preventDefault();

                        e = methods.mouseToTouch(e);
	                    
                        var movedPixels = {
                            x: e.screenX-startPos.x,
                            y: e.screenY-startPos.y
                        };

                        var newPos = {
                            x: startImagePosition.x+movedPixels.x,
                            y: startImagePosition.y+movedPixels.y
                        };

                        newPos = methods.lockPosition.call(self, newPos); 

                        var el = data.imageZoomContainer.find('.imageZoom_image')[0];
                        el.style.left = newPos.x + 'px';
                        el.style.top = newPos.y + 'px';
                    });

                    $(window).on('onmouseup mouseup touchend', function() {
                        $(window).off('onmousemove mousemove.img touchmove.img');
                    });
                })
                .on('mousedown.zoom touchstart.zoom', '.imageZoom_zoom', function(e){
                    e.preventDefault();

                    var btn = $(this);
                    zoomed = false;

                    clearInterval(btnMouseDown);
                    btnMouseDown = setInterval(function(){
                        if(btn.hasClass('imageZoom_zoomIn')) {
                            methods.zoom.call(self, 1, 'center');
                        } else if (btn.hasClass('imageZoom_zoomOut')) {
                            methods.zoom.call(self, -1, 'center');
                        }

                        zoomed = true;
                    }, 200);

                    data.imageZoom.on('mouseup.zoom touchend.zoom', '.imageZoom_zoom', function(){
                        // clear mouseup
                        data.imageZoom.off('mouseup.zoom touchend.zoom');
                        clearInterval(btnMouseDown);

                        if(!zoomed) {
                            if(btn.hasClass('imageZoom_zoomIn')) {
                                methods.zoom.call(self, 1, 'center');
                            } else if (btn.hasClass('imageZoom_zoomOut')) {
                                methods.zoom.call(self, -1, 'center');
                            }
                        }
                    });
                })
                // dbl click zoom
                .on('click', '#imageZoom_container .imageZoom_image', function(e){
                    e.preventDefault();
                    e = methods.mouseToTouch(e);

                    clearTimeout(clickCountInterval);

                    if(++clickCount === 2) {
                        clickCount = 0;
                        if(e.offsetX === undefined) {
                            e.offsetX = e.pageX-$(this).offset().left;
                            e.offsetY = e.pageY-$(this).offset().top;
                        }

                        methods.zoom.call(self, 1, e.offsetX, e.offsetY);
                    }
                    else {
                        clickCountInterval = setTimeout(function(){
                            clickCount = 0;
                        }, 200);
                    }
                })
                // scroll zoom
                .on('mousewheel DOMMouseScroll', '#imageZoom_container div', function(e){
                    e.preventDefault();
                    e = e.originalEvent;
                    var wheelDelta;

                    if(e.type === 'wheel' || e.type == 'mousewheel') {
                        wheelDelta = e.wheelDelta;
                    }
                    else if (e.type === 'DOMMouseScroll') {
                        wheelDelta = -e.detail;
                    }
                    else {
                        if(console && console.warn) {
                            console.warn('undefined scroll event');
                        }
                    }

                    /* for IE */
                    if(!wheelDelta) {
                        wheelDelta = -e.deltaY;
                    }

                    if(wheelDelta >= 0) {
                        methods.zoom.call(self, 1, e.offsetX, e.offsetY);
                    }
                    else {
                        methods.zoom.call(self, -1, e.offsetX, e.offsetY);
                    }

                    return false;
                });
        },
        zoom: function() {
            var self = $(this),
                data = self.data('zoom'),
                img = data.imageZoomContainer.find('.imageZoom_image'),
                newImageSize = {
                    width: null,
                    height: null
                };

            if(arguments[0] === 'fit') {
                data.currentZoomLevel = 0;

                newImageSize = {
                    width: data.minZoomSize.width,
                    height: data.minZoomSize.height
                };

                img.css({ opacity: 1 });
            } else {
            	var zoomTo = arguments[0];

            	if (data.currentZoomLevel + zoomTo < 0 || data.currentZoomLevel + zoomTo > data.levels) {

	            	if (data.currentZoomLevel + zoomTo < 0) {
	            		data.imageZoom.find('.imageZoom_zoomOut').addClass('disabled');
	            		data.imageZoom.find('.imageZoom_zoomIn').removeClass('disabled');
		            } else {
	            		data.imageZoom.find('.imageZoom_zoomIn').addClass('disabled');
	            		data.imageZoom.find('.imageZoom_zoomOut').removeClass('disabled');
		            }

                    return false;
                }
            	else {
            		data.imageZoom.find('.imageZoom_zoomOut').removeClass('disabled');
            		data.imageZoom.find('.imageZoom_zoomIn').removeClass('disabled');
                    data.currentZoomLevel = data.currentZoomLevel+zoomTo;
                }
				
            	img.stop();

                if(!img.hasClass('zoom')) {
                    img.addClass('zoom');
                	var currentImg = data.imageZoom.find('#imageZoom_thumbs ul li.selected').index(),
                        image;

                    var breakpoint = methods.getNearestBreakpoint.call(self, data.images[currentImg]);

                    if(data.retina && data.images[currentImg]['zoom']['b' + breakpoint]['retina']) {
                        image = data.images[currentImg]['zoom']['b' + breakpoint]['retina'];
                    }
                    else {
                        image = data.images[currentImg]['zoom']['b' + breakpoint]['normal'];
                    }

                    methods.preload.call(self, image, function(url){
                        img.addClass('zoom').find('img').attr('src', url);
                    });
                }
                
                var zoomPercent = (1/data.levels)*data.currentZoomLevel;

                var zoomBetween = {
                    width: data.maxZoomSize.width - data.minZoomSize.width,
                    height: data.maxZoomSize.height - data.minZoomSize.height
                };

                newImageSize = {
                    width: data.minZoomSize.width+(zoomBetween.width*zoomPercent),
                    height: data.minZoomSize.height+(zoomBetween.height*zoomPercent)
                };
            }
			
            // Max zoomsize mag niet groter zijn dan min zoom size
            if(data.maxZoomSize.width < data.minZoomSize.width) {
                newImageSize.width = data.maxZoomSize.width;
            }

            if(data.maxZoomSize.height < data.minZoomSize.height) {
                newImageSize.height = data.maxZoomSize.height;
            }

            // currentImagePosiiton
            var imagePosition = {
                left: parseInt(img.css('left'), 10),
                top: parseInt(img.css('top'), 10)
            };

            // old image size
            var oldImageSize = {
                width: img.width(),
                height: img.height()
            };


            // set "x and y" to center
            if(arguments[1] == 'center') {
                x = oldImageSize.width/2;
                y = oldImageSize.height/2;
            }
            else {
                var x = arguments[1],
                    y = arguments[2];
            }

            var zoomCenter = {
                    x: (100/oldImageSize.width)*x,
                    y: (100/oldImageSize.height)*y
                },
                newClickPoint = {
                    x: (newImageSize.width/100)*zoomCenter.x,
                    y: (newImageSize.height/100)*zoomCenter.y
                },
                newPos = {
                    x: (imagePosition.left+x) - newClickPoint.x,
                    y: (imagePosition.top+y) - newClickPoint.y
                };

	        zoomCenter.x = isNaN(zoomCenter.x) ? 0 : zoomCenter.x;
            zoomCenter.y = isNaN(zoomCenter.y) ? 0 : zoomCenter.y;
            newClickPoint.x = isNaN(newClickPoint.x) ? 0 : newClickPoint.x;
            newClickPoint.y = isNaN(newClickPoint.y) ? 0 : newClickPoint.y;
            newPos.x = isNaN(newPos.x) ? 0 : newPos.x;
            newPos.y = isNaN(newPos.y) ? 0 : newPos.y;

            if(newImageSize.width < data.imageZoomContainer.width()) {
                newPos.x = (data.imageZoomContainer.width()-newImageSize.width)/2;
            }

            if(newImageSize.height < data.imageZoomContainer.height()) {
                newPos.y = (data.imageZoomContainer.height()-newImageSize.height)/2;
            }
	        
            // fit image to screen on Y axis
            if(newImageSize.height >= data.imageZoomContainer.height()) {
                if(newPos.y <= 0 && newPos.y+newImageSize.height <= data.imageZoomContainer.height()) {
                    newPos.y = data.imageZoomContainer.height()-newImageSize.height;
                }

                if(newPos.y >= 0) {
                    newPos.y = 0;
                }
            }

            // fit image to screen on X axis
            if(newImageSize.width >= data.imageZoomContainer.width()) {
                if(newPos.x <= 0 && newPos.x+newImageSize.width <= data.imageZoomContainer.width()) {
                    newPos.x = data.imageZoomContainer.width()-newImageSize.width;
                }

                if(newPos.x >= 0) {
                    newPos.x = 0;
                }
            }

            if(!data.isLt9) {
                img.animate({
                    width: newImageSize.width,
                    height: newImageSize.height,
                    left: newPos.x,
                    top: newPos.y
                }, 190, 'swing', function() {
                    methods.reFit.call(self, 0, function(){
                        if(typeof x === 'function') x();
                    });
                });
            } else {
                img.css({
                    width: newImageSize.width,
                    height: newImageSize.height,
                    left: newPos.x,
                    top: newPos.y
                });
                methods.reFit.call(self, 0, function(){
                    if(typeof x === 'function') x();
                });
            }
        },
        centerImg: function() {
            var self = $(this),
                data = self.data('zoom'),
                callback = null;

            if(typeof arguments[0] === 'function') {
                callback = arguments[0];
            }
            else if (typeof arguments[1] === 'function'){
                callback = arguments[1];
            }

            var img = data.imageZoomContainer.find('.imageZoom_image');
            var imageSize = {
                width: img.width(),
                height: img.height()
            };

            if(!data.isLt9)
            {
                img.animate({
                    left: (data.imageZoomContainer.width()/2)-imageSize.width/2,
                    top: (data.imageZoomContainer.height()/2)-imageSize.height/2
                }, 100, 'linear', callback);
            } else {
	            img.css({
		            left: (data.imageZoomContainer.width() / 2) - imageSize.width / 2,
		            top: (data.imageZoomContainer.height() / 2) - imageSize.height / 2
	            });
                if(callback) callback();
            }
        },
        reFit: function(){
            var self = $(this),
                data = self.data('zoom'),
                img = data.imageZoomContainer.find('.imageZoom_image'),
                newPos = methods.lockPosition.call(self, parseInt(img.css('left'), 10), parseInt(img.css('top'), 10)),
                callback;

            if(typeof arguments[0] === 'function') {
                callback = arguments[0];
            }
            else if (typeof arguments[1] === 'function') {
                callback = arguments[1];
            }

            if(!data.isLt9) {
                data.imageZoomContainer.find('.imageZoom_image').animate({
                    left: newPos.x, top: newPos.y
                }, 100, 'linear', callback);
            } else {
	            data.imageZoomContainer.find('.imageZoom_image').css({
		            left: newPos.x,
		            top: newPos.y
	            });

                if(callback) callback();
            }
        },
        lockPosition: function(newPos) {
	        var self = $(this),
		        data = self.data('zoom'),
		        img = data.imageZoomContainer.find('.imageZoom_image img');
                
	        
            if(img.height() > data.imageZoomContainer.height()) {
                if(newPos.y <= 0 && newPos.y+img.height() <= data.imageZoomContainer.height()) {
                    newPos.y = data.imageZoomContainer.height()-img.height();
                }

                if(newPos.y >= 0) {
                    newPos.y = 0;
                }
            }
            else {
                if(newPos.y <= 0) {
                    newPos.y = 0;
                }

                if(newPos.y >= data.imageZoomContainer.height()-img.height()) {
                    newPos.y = data.imageZoomContainer.height()-img.height();
                }
            }

            if(img.width() > data.imageZoomContainer.width()) {
                if(newPos.x <= 0 && newPos.x+img.width() <= data.imageZoomContainer.width()) {
                    newPos.x = data.imageZoomContainer.width()-img.width();
                }

                if(newPos.x >= 0) {
                    newPos.x = 0;
                }
            }
            else {
                if(newPos.x <= 0) {
                    newPos.x = 0;
                }

                if(newPos.x >= data.imageZoomContainer.width()-img.width()) {
                    newPos.x = data.imageZoomContainer.width()-img.width();
                }
            }

            if(img.width() < data.imageZoomContainer.width()) {
                newPos.x = (data.imageZoomContainer.width()-img.width())/2;
            }

            if(img.height() < data.imageZoomContainer.height()) {
                newPos.y = (data.imageZoomContainer.height()-img.height())/2;
            }

            return newPos;
        },
        setZoomSize: function() {
            var self = $(this),
                data = self.data('zoom');

            var startSize = 0;
            if(data.imageZoomContainer.width() > data.imageZoomContainer.height()) {
                startSize = data.imageZoomContainer.height();
            }
            else {
                startSize = data.imageZoomContainer.width();
            }

            data.minZoomSize = {
                width: startSize,
                height: startSize
            };
        },
        getNearestBreakpoint: function(imgdata) {
            var nearest = 1;

            for(var i = 1; i <= defaults.levels && i <= dnz.breakPoint.getCurrent(); i++) {
                if(imgdata['zoom']['b' + i]) nearest = i;
            }

            return nearest;
        },
        showImage: function() {
	        var self = $(this),
		        data = self.data('zoom'),
		        img = data.imageZoomContainer.find('.imageZoom_image');
                animationSpeed = 0;

            if((arguments[0]-1)) {
                animationSpeed = arguments[0];
            }

            if(typeof arguments[0] === 'function') {
                callback = arguments[0];
            }
            else if (typeof arguments[1] === 'function') {
                callback = arguments[1];
            }

	        img.fadeIn(animationSpeed, function() {
		        if (typeof callback == 'function') {
			        callback.call();
		        }
	        });
        },
        hideImage: function() {
            var self = $(this),
                data = self.data('zoom'),
                animationSpeed = 0;

            if((arguments[0]-1)) {
                animationSpeed = arguments[0];
            }

            if(typeof arguments[0] === 'function') {
                callback = arguments[0];
            }
            else if (typeof arguments[1] === 'function'){
                callback = arguments[1];
            }

            data.imageZoomContainer.find('.imageZoom_image').fadeOut(animationSpeed, function(){
                if(typeof callback == 'function') {
                    callback.call();
                }
            });
        },
        preload: function(url, callback) {
            var self = $(this),
                data = self.data('zoom');

            var queue = new createjs.LoadQueue();

            queue.on("complete", function(){
                callback.call(self, url);
            });

            queue.loadFile({id:'image', src:url});
        },
        mouseToTouch: function(e){
            if(e.type.indexOf('touch') >= 0) {
                return e.originalEvent.touches[0];
            }
            else {
                return e.originalEvent;
            }
        }
    };

    $.fn.zoom = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) {
            return methods[methodOrOptions].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.zoom' );
        }
    };
})( jQuery );