$(document).ready(function() {
    $(this).find("[autofocus]:first").focus();
    
    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });
  
    $("#myModal").on('shown', function() {
        $(this).find("[autofocus]:first").focus();
  });

    $('#username').on('keyup',function(){
        $('.form-group').addClass('has-error');
    });
  


});