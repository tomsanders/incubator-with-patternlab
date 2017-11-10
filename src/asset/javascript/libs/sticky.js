(function ( $, window, document, undefined ) {
    var pluginName = "sticky",
        defaults = {
            lastPosition: 0,
            marginTop: 0,
            spacer: $('<div />'),
            type: 'top',
            state: 'default',
            stickyClass: 'state-break'
        };

    function Plugin( element, options ) {
        this.element = element;
        this.$element = $(element);
        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {
        init: function() {
            var base = this;
            base.setInitialValues();
            base.defineState();
            base.setBindings();
        },

        setInitialValues: function() {
            var base = this;
            base.options.initialPosition = base.$element.offset().top;
            base.options.spacer.css({
                width: base.$element.outerWidth(),
                height: base.$element.outerHeight(),
                display: base.$element.css('display'),
                'vertical-align': base.$element.css('vertical-align')
            });

            if (base.options.type === 'container') {
                base.options.container = base.$element.closest('.container__sticky').parent();
                base.options.topOfContainer = base.options.container.find('.container__sticky').offset().top;
                base.options.bottomOfContainer = base.options.topOfContainer + base.options.container.outerHeight(true);
            }
        },

        setToStickyTop: function() {
            var css, elementWidth,
                base = this;

            if (base.options.type === 'container') {
                elementWidth = base.$element.closest('.container__sticky').width()  + 'px';
            } else {
                elementWidth = '';
            }

            css = {
                position: 'fixed',
                top:  base.options.marginTop + 'px',
                bottom: '',
                width: elementWidth
            };
            base.$element.css(css).addClass(base.options.stickyClass);
            if (base.options.type !== 'container') {
                base.$element.after(base.options.spacer);
            }
        },

        setToStickyContainerBottom: function(currentPosition) {
            var css,
                base = this;

            css = {
                position: 'absolute',
                bottom:  '0',
                top: ''
            };
            base.$element.css(css).addClass(base.options.stickyClass);
        },

        setToDefault: function() {
            var css,
                base = this;

            css = {
                position: '',
                top: '',
                bottom: ''
            };

            base.$element.parent().find(base.options.spacer).detach();
            base.$element.css(css).removeClass(base.options.stickyClass);
        },

        recalculate: function(mySticky) {
            var base = this;

            if (base.options.type === 'container') {
                base.options.container = base.$element.closest('.container__sticky').parent();
                base.options.topOfContainer = base.options.container.offset().top;
                base.options.bottomOfContainer = base.options.topOfContainer + base.options.container.outerHeight(true);
            }

            base.options.initialPosition = base.$element.offset().top;

            switch(base.options.type) {
                case 'top':
                    base.defineStateTop($(document).scrollTop(), true);
                    break;
                case 'container':
                    base.defineStateContainer($(document).scrollTop(), true);
                    break;
                default:
                    base.defineStateTop($(document).scrollTop(), true);
            }
        },

        defineStateTop: function(currentPosition){
            var base = this;

            if (base.options.state === 'default') {
                base.options.initialPosition = base.$element.offset().top;
            }

            if ((base.$element.offset().top - $(window).scrollTop() <= base.options.marginTop) && base.options.state !== 'sticky') {
                base.options.state = 'sticky';
                base.setToStickyTop();
            } else if ((currentPosition + base.options.marginTop <= base.options.initialPosition) && base.options.state !== 'default') {
                base.options.state = 'default';
                base.setToDefault();
            }
        },

        defineStateContainer: function(currentPosition, isScrollingDown){
            var base = this;
            var topOfElement = base.$element.offset().top;
            var bottomOfElement = topOfElement + base.$element.outerHeight(true);
            var $containersAboveSticky = base.options.container.children().not('.container__sticky');
            var heightContainersAboveSticky = 0;

            if ($containersAboveSticky.length) {
                heightContainersAboveSticky = $containersAboveSticky.outerHeight(true);
            }

            base.options.bottomOfContainer = base.options.topOfContainer + base.options.container.outerHeight(true) - heightContainersAboveSticky;

            if (base.options.container.outerHeight(true) <= base.$element.outerHeight(true)) {
                base.options.state = 'default';
                base.setToDefault();
            }

            else if ((base.options.topOfContainer - $(window).scrollTop() <= base.options.marginTop && (base.options.bottomOfContainer - base.$element.outerHeight(true) - base.options.marginTop > currentPosition))) {
                base.options.state = 'sticky';
                base.setToStickyTop();
            }

            else if ((currentPosition + base.options.marginTop <= base.options.initialPosition && base.options.state !== 'default')) {
                base.options.state = 'default';
                base.setToDefault();
            }

            else if (bottomOfElement >= base.options.bottomOfContainer && base.options.state !== 'containerBottom') {
                base.options.state = 'containerBottom';
                base.setToStickyContainerBottom(base.options.bottomOfContainer);
            }
        },

        defineState: function() {
            var base = this,
                currentPosition = $(document).scrollTop();

            base.$element.css({
                'max-width': base.$element.parent().outerWidth()
            });

            var isScrollingDown = base.options.lastPosition < currentPosition;

            switch(base.options.type) {
                case 'top':
                    base.defineStateTop(currentPosition, isScrollingDown);
                    break;
                case 'container':
                    base.defineStateContainer(currentPosition, isScrollingDown);
                    break;
                default:
                    base.defineStateTop(currentPosition, isScrollingDown);
            }

            base.options.lastPosition = currentPosition;
        },

        setBindings: function() {
            var base = this;

            $(window).on('scroll', function(){
                base.defineState();
            });

            $('body').on('touchmove', function() {
                base.defineState();
            });

            $(window).on('resize', function() {
                base.recalculate();
            });
        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new Plugin( this, options ));
            }
        });
    };
})( jQuery, window, document );
