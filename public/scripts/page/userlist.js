$(document).ready(function() {
    
    $("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
    //initial table load
    loadTable();

    //refresh table data on paginate
    $('.page-control')
        .click(function(){
            if ($(this).hasClass("previous")) {
                loadTable(null,parseInt(localStorage.page) -1,null);
            } else {
                loadTable(null,parseInt(localStorage.page) +1,null);
                }
        });
    //refresh data on filter change
    $('#filter').on('input',function(){
        loadTable(null, null, $('#filter').val());
    });

});


//loadTable function
var loadTable = function(length, page, filter) {
    //set page length based on viewport size    
    if(!length){
            if($(window).width() < 992) {length = 5;}
                else {length = 15;}
            }
        //if page is not supplied or page is <0 make 0 and disable previous button.
        if(!page || page<0){
            page = 0;
            $('.previous').hide();
        }else {
            $('.previous').show();
            }
        if(!filter){filter = $('#filter').val()};
        localStorage.setItem("page", page);
        $.getJSON("/admin/users/list?length=" + length + "&page=" + page + "&filter=" + filter, function (result) {
            $('tbody').empty();
            $.each(result, function (key, value) {
                var level = 'User';
                var active = 'Inactive';
                if (value.user_level == -1) level = 'Admin';
                if (value.activated == 1) active = 'Active';
                $('tbody')
                    .append(
                        "<tr>" + 
                        "<td id='user_name'>" + value.user_name + "</td>" +
                        "<td id='first_name'>" + value.first_name + "</td>" +
                        "<td id='last_name'>" + value.last_name + "</td>" +
                        "<td id='email'>" + value.email + "</td>" +
                        "<td id='user_level'>" + level + "</td>" +
                        "<td id='activated'>" + active + "</td>" +
                        "<td>" + "<a href='#' class='edit btn btn-xs btn-warning actionbutton', data-toggle='modal' data-target='#edituser'>Edit </a>"+ "</td>" +
                        "<td>" + "<a href='#' class='delete btn btn-xs btn-danger actionbutton'>Delete </a>"+ "</td>" +
                        "</tr>");
            });
            //hide next button if there are less than defined length rows.
            if($("#eqlist > tbody > tr").length < length){
                $('.next').hide();
            }else {
                $('.next').show();
            }
            //if no rows are printed rerun the function with page-1
            if($("#eqlist > tbody > tr").length = 0) {
                loadTable(null,parseInt(localStorage.page) - 1,null);
            }

            //handle row edit link click events
            $('.edit').on("click", function(){
                //get equipment id for row
                var uid = $(this).parent().siblings(":first").text();
                //get data
                $.post("/admin/users/get",{user_name: uid},  function (result) {
                    populate("#edituserform", result);
                });
                $('#edituser').modal('toggle');
            });

            //handle row delete link click events
            $('.delete').on("click", function(){
                //get equipment id for row
                var user = $(this).parent().siblings(":first").text();
                // prompt dialog
                alertify.confirm("Are you sure you want to delete this user?", function (e, str) {
                    // str is the input text
                    if (e) {
                        $.post("/admin/users/delete",{user_name: user},  function (result) {
                            loadTable(length,page,filter);
                        });
                    } else {
                        // user clicked "cancel"
                    }
                }, "Default Value");  
            });
        });
}
    //populate form function
    function populate(frm, data) {   
    $.each(data, function(key, value){  
        var $ctrl = $('[id='+key+']', frm);  
        switch($ctrl.attr("type"))  
        {  
            case "text" :   
            case "hidden":  
                $ctrl.val(value);   
            break;   
            case "radio" : case "checkbox":   
                $ctrl.each(function(){
                   if($(this).attr('value') == value) {  $(this).attr("checked",value); } });   
                break;  
            case "file" :
                $ctrl.parent().parent().parent().find('img').attr('src','data:image/png;charset=utf-8;base64,' +value);
                break;
            default:
            $ctrl.val(value); 
        }  
    });  
}  