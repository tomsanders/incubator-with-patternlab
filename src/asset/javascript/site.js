var modules = modules || {};
var site = site || {
    basketService:null
};

site.IsEmpty = function (str) {
    return (!str || 0 === $.trim(str).length);
};

site.InInt= function (value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
  }

site.scrollTo = function (id) {
        
    var headerHeight = ($('#smallSubHeader').is(':visible')) ? $('#smallSubHeader').height() : $('#subHeader').height();

    if ($("#" + id).length > 0)
    {    
        $('html, body').animate({        
            scrollTop: $("#" + id).offset().top - headerHeight - 20
        }, 500);
    }
};

site.submitForm = function (form, submitButton) { 
            
    if (submitButton.is("[formnovalidate]")) {
        form.submit();
        return;
    }
    
    if (form.valid()) {
        //util.disableSubmitButton(form);   
        if (submitButton.data("action"))
        {
            var input = $("<input>")
                        .attr("type", "hidden")
                        .attr("name", submitButton.data("action")).val(submitButton.data("action"));
            form.append($(input));
        }
        
        form.submit();
    }
    else
    {
        site.scrollToInvalidElement();
    }
};


site.scrollToInvalidElement = function() {
    var headerHeight = ($('#smallSubHeader').is(':visible')) ? $('#smallSubHeader').height() : $('#subHeader').height();
    var offsetElement = $("div.invalid").first();
    if (offsetElement.length == 0) {
        return;
    }
    
    $('html, body').animate({ 
        scrollTop: offsetElement.offset().top - headerHeight - 20 
    });
}

site.initValidation =  function(moduleContainer, errorContainer) {
    $("form", moduleContainer).validate({
        onsubmit: false,
        ignore: ":disabled, [readonly=readonly], .ignore",
        errorElement: "div",
        errorClass: "alert invalid",
        validClass: "alert valid",
        ignoreTitle: true,
        errorPlacement: function (error, element) {            
            var errorElement = $(errorContainer).append(error);
            
            //Check for alt class on error element
            var altClass = $(element).data('error_alt');
            if (altClass) {
                error.addClass("alt");
            }
            if ($(element).parents('#login').length > 0) {
                error.appendTo(element.closest("li"));
            } else if ($(element).parents('.generalConditions').length > 0) {
                error.insertAfter(element.closest("label"));
            } else if ($(element).parents('.featherlight-popup').length > 0)  {
                errorElement.appendTo(element.closest('div.input'));
            } else if ($(element).parents('[data-wishlist-title-form]').length > 0)  {
                errorElement.appendTo(element.closest("form"));
            } else {
                errorElement.appendTo(element.closest("li.g"));
            }

            $('#'+$(element).attr('id')).closest("div.input").removeClass("valid").addClass("invalid");
        },
        success: function (label, element) {
            if ($(element).parents('.generalConditions').length > 0) {                
                $(label).remove();
                $('#'+$(element).attr('id')).closest("div.input").removeClass("invalid").removeClass("invalid");
                
            } else {                
                $(label).parent().remove();
                $('#'+$(element).attr('id')).closest("div.input").removeClass("invalid").removeClass("invalid");
            }
        },
        highlight: function (element) {
            //$(element).closest("div.field").addClass("error");
        },
        unhighlight: function (element) {
            //$(element).closest("div.field").removeClass("error");
        },
        onkeyup: false,
        //onfocusin: function(element) { $(element).valid(); },
        onfocusout: function (element) {
            $(element).valid();            
        }
    });
}

jQuery.fn.extend({
    addLoading: function() {
        this.addClass("loadingBtn").addClass("stopPropagation").removeClass("btn");
        this.on('click', function(e) {        
            if ($(this).hasClass('stopPropagation'))
            {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    },
    removeLoading: function() {
        this.removeClass("loadingBtn").removeClass("stopPropagation").addClass("btn");
    }
});

var Queue = function () {
    var previous = new $.Deferred().resolve();

    return function (fn, fail) {
        if (typeof fn !== 'function') {
            throw 'must be a function';
        }

        return previous = previous.then(fn, fail || fn);
    };
};
       
$(function () {
    
    site.basketService = new services.basket(sessionData.dispatchUrl, sessionData.synchronizerToken);
    
    dnz.breakPoint.init();
    
    // Initialization of the modules
    $("[data-module]").each(function () {
       
        var moduleArray = $(this).data('module').split('-');
        var module = moduleArray[0];

        if (moduleArray.length > 1) {
            // Submodule.. 
            var subModule = moduleArray[1];
            window[module][subModule].init($(this));
            return;
        }

        // Normal module
        window[module].init($(this));
    });

    // Registers the form submit click and makes sure the buttons is disable when the form is valid.
    $(document).on('click', '[data-formsubmit="true"]', function () {
        var submitButton = $(this);
        var form = submitButton.closest('form');

        if (form && form.length == 1) {
            site.submitForm(form, submitButton);
        }
        return false;
    });

    // Handle the default button when pressing Enter in a form field
    $('form').keypress(function (e) {
        if (e.which == 13) {
            var defaultButton = $(this).find('[data-defaultbutton="true"]');
            if (!$(':focus').is('textarea')) {
                $(defaultButton).trigger('click');
                e.preventDefault();
            }
        }
    });

    // Fadeout all messages with data attribute fade.
    setTimeout(function () {        
        $('[data-fade="true"]').fadeOut('slow');
    }, 5000);

    // 
    $('select[data-role="navigation"]').change(function () {
        var redirectToUrl = $(this).val();
        if (redirectToUrl == undefined || redirectToUrl.length == 0) {
            return;
        }

        window.location.href = redirectToUrl;
    });

    // Global ajax error handling.
    $(document).ajaxError(function () {
        // TODO: Url aanpassen naar juiste 500 error page.
        //document.location.href = '/Error/500/';
    });
});