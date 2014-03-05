$(document).ready(function() {
    //initialize form validation
    $("input,select,textarea").not("[type=submit]").jqBootstrapValidation();

     //On modal set focus in first input
    $("#myModal").on('shown.bs.modal', function() {
        $(this).find("[autofocus]:first").focus();
    });
    //Bootstrap File Upload
    $('input[type=file]').bootstrapFileInput();
    $('.file-inputs').bootstrapFileInput();

    //Get data for select box
    $.getJSON("/admin/equipment/type/list", function(result){
        $.each(result, function(key, value) {
            $('select').append("<option value='" + value.type_id + "'>" + value.type_desc);
        });
    });
});