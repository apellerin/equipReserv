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
                        "<td>" + "<a href='#add' id='add' class='btn btn-success btn-sm'>Add</a>" + "</td>" +
                        "<td>" + "<a href='#view' id='view' class='btn btn-primary btn-sm'>View</a>" + "</td>" +
                        "</tr>");
            });

            //if no rows are printed rerun the function with page-1
            if ($("#aeq-list > tbody > tr").length = 0) {
                loadTable(null, parseInt(localStorage.aeq - page) - 1, null);
            }

            //Register View & Add Button Listeners
            $('.btn').on('click', function () {
                alert('I got clicked yo!');
            });
        });
}