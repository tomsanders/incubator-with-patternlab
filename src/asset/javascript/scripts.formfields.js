// FORMFIELDS (2/2) v1.5
/* Change History:
	V1.5 checkFilled function added to avoid trigger(blur)
	v1.4 Placeholder behaviour and polyfill
	v1.3 Trigger blur on load
	v1.2 Excluding hidden inputs
	v1.1 isChrome function outside each-loop
	v1.0 Formfields within function
*/
var FormFields = {};



FormFields.Init = function () {

    FormFields.InitConditial();

    FormFields.InitInputs();

    FormFields.InitChecksAndRadios();

    // INPUT FILLED CHROME
    if ($('html').hasClass('chrome')) {
        $('input:-webkit-autofill').parents('div.field').addClass('filled');
    }

    // DISABLED (v1.1)
    $('.disabled, .disabled *').click(function (event) {
        event.preventDefault();
    });
    
    // ADD CLASS HAS_SELECT ON EACH PARENT OF A SELECTFIELD
    $('select').each(function () {
        $(this).parent().addClass('has_select');
    });

    // HINT CLICKING (tablet support) v1.0
    $('div.field label').not('.disabled label').click(function () {
        $(this).siblings('input,textarea').focus();
    });
};

FormFields.InitConditial = function () {

    $.expr[":"].screenVisible = function (el) {
        return !($(el).is(':hidden') || $(el).parents(':hidden').length);
    };

    // CONDITIONAL HIDDEN
    $('.hidden').hide();

    // CONDITIONAL SELECT (V1.0)
    $('.conditional select').change(function () {
        var selectedOption = $(this).children(":selected").attr('value');
        if (selectedOption == '') {
            return;
        }
        $('.hidden.' + selectedOption).show();
        $(this).find('option').not(':selected').each(function () {
            var notSelectedOption = $(this).attr('value');
            if (notSelectedOption == '') {
                return;
            }
            $('.hidden.' + notSelectedOption).hide();
        });
    }).trigger('change');


    // CONDITIONAL CHECKBOXES & RADIOS (V1.1)
    /* Change History:
	v1.1 Typo fix: checksAnsRadios -> checksAndRadios

	//searches in DOM for parent with class 'conditional' the toggleble radiobuttons should be within this element

	*/
    $('.conditional.checks label, .conditional.radios label, .checks .conditional label, .radios .conditional label').on('click touchstart', function (e) {
        var containingParent = $(this).closest('.conditional');
        containingParent.find('input:not(:checked:screenVisible)').each(function () {
            var forValue = $(this).attr('id');
            $('.hidden.' + forValue).hide();
        });

        containingParent.find('input:checked:screenVisible').each(function () {
            var forValue = $(this).attr('id');
            $('.hidden.' + forValue).show();
        });

        //checksAndRadios();
    }).trigger('touchstart');
};

// RADIOS and CHECKS - label fix for iPad, radioList for eg. paymentOptions (v1.1)
FormFields.InitChecksAndRadios = function () {
    $('.radios label, .checks label, ol.radioList > li, ul.radioList > li').not(':has(input:disabled)').click(function (event) {
        if ($(event.target).is(":not('a, input, label')")) {
            $('input:radio', this).attr('checked', 'checked');
            $('input:radio', this).trigger('click');
        }
        $(this).addClass('active').siblings().removeClass('active');
    }).each(function () {
        $(this).filter(':has(input[type="radio"]:checked)').addClass('active').siblings().removeClass('active');
    });
};

FormFields.InitInputs = function () {

    // Check for placeholder support (depends on placeholder detection)
    var browserSupportsPlaceHolder = $('html').hasClass('placeholder');

    $('input.text, textarea, select').not('input[type=hidden]').each(function () {

        // HTML5 PLACEHOLDER polyfill, ! only use when top positioned labels on .field.focus aren't used and labels arent added by default! */
        // if ( $(this).attr('placeholder') ) {
        // 	var placeholderText = $(this).attr('placeholder');
        // 	var placeholderId = $(this).attr('id');

        // 	if (browserSupportsPlaceHolder) {
        // 	 	following  script also hides label when positioned above field on .focus.filled
        // 		$(this).prev('label[for="'+ placeholderId +'"]').hide(); 
        // 	} else {
        // 		following script should only be applied if labels above fields are not used, because then the labels should not be added in html by default 
        // 	 	$(this).before('<label for="'+ placeholderId +'">' + placeholderText + '<\/label>');
        // 	}
        // }

        // INPUT FOCUS
        $(this).focus(function () {
            $(this).select().parent().addClass('focus');
            if ($(this).parents('.ios').length) {
                $('#wrapper').addClass('iosFocus');
            }
        });

        // INPUT LOAD
        FormFields.CheckFilled(this);

        // INPUT BLUR
        $(this).blur(function () {
            FormFields.CheckFilled(this);
        });

        // INPUT FILLED KEYUP
        $(this).keyup(function () {
            if ($(this).val() != "") {
                $(this).parent().addClass('filled');
            }
        });
    });
};

// CHECK FOR FILLED INPUTS
FormFields.CheckFilled = function (obj) {
    $(obj).parent().removeClass('focus');
    if ($(obj).val() != "") {
        $(obj).parent().addClass('filled');
    } else {
        $(obj).parent().removeClass('filled');
    };
    if ($(obj).parents('.ios').length) {
        $('#wrapper').removeClass('iosFocus');
    }
};

