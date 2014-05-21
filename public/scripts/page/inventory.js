$(document).ready(function() {

    //Hide pagination
    $('.previous').hide();
    $('.next').hide();
    localStorage.setItem("page",0);
    loadTable(null, 0, null);
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
    //Add hidden field with equip_id to add inventory modal
    var equip_id = getParameterByName("eid");
    $('#equip_id').val(equip_id);
});

//Get Parameters from querystring
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//loadTable function
loadTable = function(length, page, filter) {
    //get EID from querystring
    var equip_id = getParameterByName("eid");
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
        if(!filter){filter = "";}
        localStorage.setItem("page", page);
        $.getJSON("/admin/equipment/item/inventory?eid=" + equip_id +"&length=" + length + "&page=" + page + "&filter=" + filter, function (result) {
            $('tbody').empty();
            $.each(result, function (key, value) {
                $('tbody')
                    .append(
                        "<tr><td id='make'>" + value.make + "</td>" + 
                        "<td id='model'>" + value.model + "</td>" +
                        "<td id='inventory_id'>" + value.inventory_id + "</td>" +
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

            //handle row delete link click events
            $('.delete').on("click", function(){
                //get equipment id for row
                var inventory_id = $(this).parent().siblings('#inventory_id').text();
                // prompt dialog
                alertify.confirm("You are about to delete this item.", function (e, str) {
                    // str is the input text
                    if (e) {
                        $.post("/admin/equipment/item/delete",{inventory_id: inventory_id},  function (result) {
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