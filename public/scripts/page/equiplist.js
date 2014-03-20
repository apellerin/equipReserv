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
                        "<tr><td style=" + "display:none" + ">" + value.equip_id + "</td>" + 
                        "<td>" + value.type_id + "</td>" +
                        "<td>" + value.make + "</td>" +
                        "<td>" + value.model + "</td>" +
                        "<td>" + value.description + "</td>" +
                        "<td>" + "<a href='#'>Edit </a>"+ "</td>" +
                        "<td>" + "<a href='#'>Delete </a>"+ "</td>" +
                        "<td>" + "<a href='#'>Inventory</a>"+ "</td>" +
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
        });
    }

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
        