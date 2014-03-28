$(document).ready(function() {

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
        if(!filter){filter = ""};
        localStorage.setItem("page", page);
        $.getJSON("/admin/users/list?length=" + length + "&page=" + page + "&filter=" + filter, function (result) {
            $('tbody').empty();
            $.each(result, function (key, value) {
                $('tbody')
                    .append(
                        "<tr><td id='user_id' style=" + "display:none" + ">" + value.user_id + "</td>" + 
                        "<td id='user_name'>" + value.user_name + "</td>" +
                        "<td id='first_name'>" + value.first_name + "</td>" +
                        "<td id='last_name'>" + value.last_name + "</td>" +
                        "<td id='email'>" + value.email + "</td>" +
                        "<td id='phone'>" + value.phone + "</td>" +
                        "<td>" + "<a href='#' class='edit', data-toggle='modal' data-target='#edituser'>Edit </a>"+ "</td>" +
                        "<td>" + "<a href='#' class='delete'>Delete </a>"+ "</td>" +
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
                var eid = $(this).parent().siblings(":first").text();
                //get data
                $.post("/admin/equipment/get",{equip_id: eid},  function (result) {
                    populate("#editequipform", result);
                });
                $('#editequipModal').modal('toggle');
            });

            //handle row delete link click events
            $('.delete').on("click", function(){
                //get equipment id for row
                var eid = $(this).parent().siblings(":first").text();
                // prompt dialog
                alertify.confirm("This item and all sub-items will be deleted.", function (e, str) {
                    // str is the input text
                    if (e) {
                        $.post("/admin/equipment/delete",{equip_id: eid},  function (result) {
                            loadTable(length,page,filter);
                        });
                    } else {
                        // user clicked "cancel"
                    }
                }, "Default Value");  
            });
            $('.detail').on("click", function(){
                //get equipment id for row
                var eid = $(this).parent().siblings(":first").text();
                $.post("/admin/equipment/item",{equip_id: eid},  function (result) {

                }); 
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