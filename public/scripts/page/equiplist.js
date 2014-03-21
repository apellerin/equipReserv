$(document).ready(function() {

    //load select
    $.getJSON("/admin/equipment/type/list", function(result){
        $.each(result, function(key, value) {
            $('select').append("<option value='" + value.type_id + "'>" + value.type_desc);
        });
    });

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
        $.getJSON("/admin/equipment/list?length=" + length + "&page=" + page + "&filter=" + filter, function (result) {
            $('tbody').empty();
            $.each(result, function (key, value) {
                $('tbody')
                    .append(
                        "<tr><td id='equip_id' style=" + "display:none" + ">" + value.equip_id + "</td>" + 
                        "<td id='type'>" + value.type_id + "</td>" +
                        "<td id='make'>" + value.make + "</td>" +
                        "<td id='model'>" + value.model + "</td>" +
                        "<td id='description'>" + value.description + "</td>" +
                        "<td>" + "<a href='#' class='edit'>Edit </a>"+ "</td>" +
                        "<td>" + "<a href='#' class='delete'>Delete </a>"+ "</td>" +
                        "<td>" + "<a href='#' class = 'detail'>Inventory</a>"+ "</td>" +
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
                //get data
                $.post("/admin/equipment/delete",{equip_id: eid},  function (result) {
                    $('.alert-dismissable').remove();
                    $('#content').append(" \
                        <div class='alert alert-success alert-dismissable'> \
                        <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button> \
                        <strong>Success: </strong>Item has been deleted.</div>");

                    loadTable(length,page,filter);
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