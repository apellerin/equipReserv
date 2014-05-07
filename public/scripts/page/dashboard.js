$(document).ready(function () {
    //DATE TIME PICKER
    $('#startdatetime').datetimepicker();
    $('#enddatetime').datetimepicker();
    $("#startdatetime")
        .on("dp.change", function (e) {
            $('#enddatetime').data("DateTimePicker").setMinDate(e.date);
            $('#enddatetime').data("DateTimePicker").setDate(null);
            loadAvailableEquip();
        })
    $("#enddatetime").on("dp.change", function (e) {
        $('#startdatetime').data("DateTimePicker").setMaxDate(e.date);
        var endDate = $('#startdatetime').data("DateTimePicker").getDate();
        loadAvailableEquip();
    });


    //LOAD AVAILABLE EQUIPMENT TABLE
    loadAvailableEquip();

    //refresh table data on paginate
    $('.aeq-page-control')
        .click(function () {
            if ($(this).hasClass("aeq-previous")) {
                loadAvailableEquip(null, parseInt(localStorage.aeq_page) - 1, null);
            } else {
                loadAvailableEquip(null, parseInt(localStorage.aeq_page) + 1, null);
            }
        });
    //refresh data on filter change
    $('#aeq-filter').on('input', function () {
        loadAvailableEquip(null, null, $('#aeq-filter').val());
    });

});

    //loadTable function
var loadAvailableEquip = function (length, page, filter) {
    var start = $('#startdatetime').data("DateTimePicker").getDate();
    var end = $('#enddatetime').data("DateTimePicker").getDate();
    var start = start.toISOString();
    var end = end.toISOString();
    
    //set page length based on viewport size    
    if (!length) {
        if ($(window).width() < 992) { length = 5; }
        else { length = 15; }
    }
    //if page is not supplied or page is <0 make 0 and disable previous button.
    if (!page || page < 0) {
        page = 0;
        $('#aeq-previous').hide();
    } else {
        $('#aeq-previous').show();
    }
    if (!filter) { filter = "" };
    localStorage.setItem("aeq_page", page);
    $.getJSON("/reservation/getavailableequipment?length=" + length + "&page=" + page + "&filter=" + filter +
        "&start=" + start + "&end=" + end, function (result) {
            $('#aeq-body').empty();
            $.each(result, function (key, value) {
                $('#aeq-body')
                    .append(
                        "<tr><td id='equip_id' style=" + "display:none" + ">" + value.equip_id + "</td>" +
                        "<td id='type'>" + value.type_desc + "</td>" +
                        "<td id='make'>" + value.make + "</td>" +
                        "<td id='model'>" + value.model + "</td>" +
                        "<td id='avail'><span class='badge alert-info'>" + value.available + "</span></td>" +
                        "<td id ='add'>" + "<a href='#' class='btn btn-success btn-sm'>Add</a>" + "</td>" +
                        "<td id ='view'>" + "<a href='#' class='btn btn-primary btn-sm'>View</a>" + "</td>" +
                        "</tr>");
            });
            //hide next button if there are less than defined length rows.
            if ($("#aeq-list > tbody > tr").length < length) {
                $('#aeq-next').hide();
            } else {
                $('#aeq-next').show();
            }
            //if no rows are printed rerun the function with page-1
            if ($("#aeq-list > tbody > tr").length = 0) {
                loadTable(null, parseInt(localStorage.aeq - page) - 1, null);
            }
        });
}