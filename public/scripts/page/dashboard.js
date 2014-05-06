$(function () {
    $('#startdatetime').datetimepicker();
    $('#enddatetime').datetimepicker();
    $("#startdatetime")
        .on("dp.change", function (e) {
            $('#enddatetime').data("DateTimePicker").setMinDate(e.date);
            $('#enddatetime').data("DateTimePicker").setDate(null);
        })
    $("#enddatetime").on("dp.change", function (e) {
        $('#startdatetime').data("DateTimePicker").setMaxDate(e.date);
            var endDate = $('#startdatetime').data("DateTimePicker").getDate();
    });

});