   var loadTable = function(length, page, filter) {
        if(!length){
            if($(window).width() < 992) {length = 10;}
                else {length = 20;}
            }
        if(!page || page<0){page = 0;}
        if(!filter){filter = null};
        localStorage.setItem("page", page);
        $.getJSON("/admin/equipment/list?length=" + length + "&page=" + page, function (result) {
            $('tbody').empty();
            $.each(result, function (key, value) {
                $('tbody')
                    .append(
                        "<tr><td>" + value.equip_id + "</td>" + 
                        "<td>" + value.type_id + "</td>" +
                        "<td>" + value.make + "</td>" +
                        "<td>" + value.model + "</td>" +
                        "<td>" + value.description + "</td>" +
                        "<td>" + "<a href='#'>Edit</a>"+ "</td>" +
                        "<td>" + "<a href='#'>Delete</a>"+ "</td>" +
                        "</tr>");
            });
        });
    }

$(document).ready(function() {

    //initial table load
    loadTable();
    //load equipment type selector
    $.getJSON("/admin/equipment/type/list", function (result) {
        $.each(result, function (key, value) {
            $('select').append("<option value='" + value.type_id + "'>" + value.type_desc);
        });
    });
    //load data table function
 
    //refresh table data on paginate
    $('li')
        .click(function(){
            if ($(this).hasClass("previous")) {
                loadTable(null,parseInt(localStorage.page) -1,null);
            } else {
                loadTable(null,parseInt(localStorage.page) +1,null);
                }
        });
});
        