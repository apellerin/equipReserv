//This file is for scripts that should be applied to every page.
$(document).ready(function() {

    var path = $(location).attr('pathname');
    $(".list-group-item[href='"+ path + "']").addClass("hover");

    //autofocus first field with autofocus attribute
    $(this).find("[autofocus]:first").focus();
    
    //toggle for sidebar in smaller viewports
    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
});