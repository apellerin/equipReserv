$(document).ready(function() {

    var path = $(location).attr('pathname');
    $(".list-group-item[href='"+ path + "']").addClass("hover");

    //autofocus first field with autofocus attribute
    //$(this).find("[autofocus]:first").focus();
    
    //toggle for sidebar in smaller viewports
    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
   
    //On modal set focus in first input
    $("#myModal").on('shown.bs.modal', function() {
        $(this).find("[autofocus]:first").focus();
    });
});