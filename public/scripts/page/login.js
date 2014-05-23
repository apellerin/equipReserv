$(document).ready(function() {

	
    //initialize form validation
    $("input,select,textarea").not("[type=submit]").jqBootstrapValidation();

     //On modal set focus in first input
    $("#myModal").on('shown.bs.modal', function() {
        $(this).find("[autofocus]:first").focus();
    });

});