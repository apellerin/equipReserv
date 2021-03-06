﻿$(document).ready(function () {

    $.ajaxSetup({ cache: false });

       //Initialize Cart Timer Var
    carttimer = false;

    setUpDatePickers();
    

    //LOAD AVAILABLE EQUIPMENT TABLE
    //GET NEW DATA
    $.getJSON('/reservation/user/clearcart', function(result) {
            loadAvailableEquip();
    });
    
    //Start Cart Countown Timer Functions
    startTimer();

    //REFRESH DATA ON FILTER EDIT
    $('#aeq-filter').on('input', function () {
        loadAvailableEquip(null, null, $('#aeq-filter').val());
    });

    //SET UP CART SUBMIT
    $('#cartsubmitbtn').on("click", function() {

        alertify.confirm("Are you ready to finalize your reservation?", function (e) {
            if (e) {
                var start = $('#startdatetime').data("DateTimePicker").getDate();
                var end = $('#enddatetime').data("DateTimePicker").getDate();
                var start = start.toISOString();
                var end = end.toISOString();
                //block ui while processing
                $.blockUI(_blockobj); 

                $.post('/reservation/add',{start: start, end: end}, function (result) {
                    loadAvailableEquip();
                })
                .always(function(){
                    $.unblockUI();
                });
            } 
        });    
    });
    $('#cartcancelbtn').on("click", function () {
        $.blockUI(_blockobj);
        $.getJSON('/reservation/user/clearcart', function(result) {
                loadAvailableEquip();
        });
    });
});

//LOAD/REFRESH TABLE DATA
var loadAvailableEquip = function (length, page, filter) {
    $.blockUI(_blockobj);
    var start = $('#startdatetime').data("DateTimePicker").getDate() || moment();
    var end = $('#enddatetime').data("DateTimePicker").getDate() || moment();
    start = start.format();
    end = end.format();

    //set page length based on viewport size    
    if (!length) {
        length = 10000;
    }
    //if page is not supplied or page is <0 make 0 and disable previous button.
    if (!page || page < 0) {
        page = 0;
        $('#aeq-previous').hide();
    } 
    if (!filter) { filter = $('#aeq-filter').val() };

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
                        "<td>" + 
                        "<button id='viewitem1' class='btn btn-primary btn-xs aeq-view nojump'>View</a>" +
                        "<button id='additem' class='btn btn-success btn-xs aeq-add nojump'>Add</a>" +
                        "</td>" +
                        "</tr>");
            });

        //Register View & Add Button Listeners
        $('.aeq-add').on('click', function () {
            if ( $('#startinput').val() == '' || $('#startinput').val() == '' ) { 
                alertify.alert("You must set start & end date/time for your reservation."); 
            }
            else {
                $.blockUI(_blockobj);
                var eid = $(this).parent().siblings(":first").text();
                $.post("/reservation/user/addcart",{equip_id: eid, start: start, end: end},  function (result) {
                    loadAvailableEquip();
                }); 
            }
        });

        $('.aeq-view').on('click', function () {
            var eid = $(this).parent().siblings(':first').text();
            $.getJSON('/reservation/user/getequippic?equip_id=' + eid, function (result) {
                $('#equipViewModal #title').html(result.make + " - " + result.model);
                $('#equipViewModal #caption').html(result.model);
                $('#equipViewModal #description').html(result.description);

                if (result.image) {
                $('#equipViewModal #image').attr('src','data:image/png;charset=utf-8;base64,' + result.image);
                } else {

                    $('#equipViewModal #image').attr('src','holder.js/900x700/auto/#777:#555/text:No Image Available');
                    Holder.run();
                }

                $('#equipViewModal').modal();
            });
        });

        loadShoppingCart();
        loadReservations();
    })

    .fail( function () {
        $('#aeq-body').empty();
        alert('Failed AEQ Call');
    })
    .always( function() {
        $.unblockUI();
    });
};

var loadShoppingCart = function() {
    $.getJSON("/reservation/user/getcartitems", function (result) {
        $('#cart-body').empty();
        toggleTimer(result.length);
        $.each(result, function (key, value) {
            $('#cart-body')
                .append(
                    "<tr><td id='type'>" + value.type_desc + "</td>" +
                    "<td id='make'>" + value.make + "</td>" +
                    "<td id='model'>" + value.model + "</td>" +
                    "<td id='inventory_id'>" + value.inventory_id + "</td>" +
                    "<td>" + "<button id='deleteitem' class='btn btn-danger btn-xs cart-delete nojump'>Delete</a>" + "</td>" +
                    "</tr>");
        });

        $('.cart-delete').on("click", function() {
            var eid = $(this).parent().siblings('#inventory_id').text();
            
            $.post("/reservation/user/delcartitem", {inventory_id: eid}, function (result) {
                loadAvailableEquip();
            });
        });
    })

    .fail( function () {
        $('#cart-body').empty();
    });
}

//Set UpdateTimer function to run every second.
var startTimer = function() {
    if (! carttimer) {
        cartimer = true;
        setInterval(updateTimer,1000);
        setInterval(loadAvailableEquip,30000);
    }
    else {
        return;
    }
}

//get Max cart time 
function updateTimer() {
    $.getJSON("/reservation/user/carttimer", function(result) {
        if(result.length) {

            var maxtime = new moment(result[0].timer);
            var diff = moment().diff(maxtime);
            var timeval = 5 - moment.duration(diff).asMinutes();
            var minutes = parseInt(timeval);
            var seconds = parseInt((((300 - moment.duration(diff).asSeconds())/60)%1)*60);

            if(minutes < 1 && seconds < 1) {

                $.getJSON('/reservation/user/clearcart', function(result) {
                    loadAvailableEquip();
                });

            } else if (seconds < 10) {
                $('#timer').html(minutes + ':0' + seconds);
            }
            else {
                $('#timer').html(minutes + ':' + seconds);
            }
        }
    });
}

function toggleTimer(t) {
    if(t){
        $('.timerobject').removeClass('hidden');
    } else {

        if(! $('.timerobject').hasClass('hidden') )
            $('.timerobject').addClass('hidden');
    }
}

var loadReservations = function() {

    $.getJSON("/reservation/user/list", function (result) {
        $('#res-body').empty();
        $.each(result, function (key, value) {
            var enddate = moment(value.reserv_end_date);
            var startdate = moment(value.reserv_start_date);
            var now = new moment();
            var rowclass = null;
            var cancelbutton = '';

            if (value.status_description == 'Approved' || value.status_description == 'Pending') {
                cancelbutton = "<button id='cancelres' class='btn btn-danger btn-xs cancelres nojump'>Cancel</a>" + "</td>";
            }

            switch (true) {

                case (startdate.diff(now, 'days') == 0) : rowclass = 'info';
                break;
                case (enddate.diff(now, 'days') == 0) : rowclass = 'info';
                break;
                case (enddate.diff(now, 'days') < 0) : rowclass = 'danger';
                break;
                case (startdate.diff(now, 'days') == 1) : rowclass = 'warning';
                break;
                case (enddate.diff(now, 'days') == 1) : rowclass = 'warning';
                break;
            }
            
            $('#res-body')
                .append(
                    "<tr class='" + rowclass + "'><td id='reservation_id'>" + value.reservation_id + "</td>" +
                    "<td id='start'>" + moment(value.reserv_start_date).format("MM/DD/YYYY h:mm A") + "</td>" +
                    "<td id='end'>" + moment(value.reserv_end_date).format("MM/DD/YYYY h:mm A") + "</td>" +
                    "<td id='numitems'>" + value.item_count + "</td>" +
                    "<td id='status'>" + value.status_description + "</td>" +
                    "<td>" + "<button id='viewres' class='btn btn-primary btn-xs viewres'>View</a>" + 
                    cancelbutton +
                    "</tr>") 
        });

        $('.viewres').on("click", function() {
            var rid = $(this).parent().siblings('#reservation_id').text();

            $.getJSON("/reservation/user/getresequipment?reservation_id=" + rid, function (result) {
                $('#reseq-body').empty();
                $.each(result, function (key, value) {
                    $('#reseq-body')
                        .append(
                            "<tr><td id='type'>" + value.type_desc + "</td>" +
                            "<td id='make'>" + value.make + "</td>" +
                            "<td id='model'>" + value.model + "</td>" +
                            "<td id='inventory_id'>" + value.inventory_id + "</td>" +
                            "</tr>");
                });

                $('#resViewModal').modal();
            });
        });

        $('.cancelres').on("click", function() {
            var rid = $(this).parent().siblings('#reservation_id').text();

            alertify.confirm("Are you sure you want to cancel this reservation?", function (e) {
                if (e) {
                    $.post("/reservation/updatestatus", {reservation_id: rid, reserv_status: 3}, function (result) {
                        loadAvailableEquip();
                    });
                }
            });   
        });
    })

    .fail(function () {
        $('#res-body').empty();
    }); 
}


function setUpDatePickers() {
    //Set Up the Date/Time Picker & Defaults
    $('#startdatetime').datetimepicker();
    $('#enddatetime').datetimepicker();

    var now = new moment().startOf('minute');
    //Set Default Date Values
    $('#startdatetime').data('DateTimePicker').setDate(now.clone().add(1, 'day').add(1, 'hour').startOf('hour').startOf('minute'));
    $('#enddatetime').data('DateTimePicker').setDate(now.clone().add(2, 'day').add(1, 'hour').startOf('hour').startOf('minute'));

    //Set Min Dates for Pickers
    $('#startdatetime').data('DateTimePicker').setMinDate(now.clone().add(-1, 'day').startOf('minute'));
    $('#enddatetime').data('DateTimePicker').setMinDate(now.clone().add(-1, 'day').startOf('minute'));

    //Register Change Listeners
    $("#startdatetime")
        .on("dp.change", function (e) {

            var now = new moment().startOf('minute');

            if (moment(e.date).startOf('minute') < now) {

                $('#startdatetime').data('DateTimePicker').setDate(now.clone());
            }

            if ( $('#enddatetime').data('DateTimePicker').getDate() < e.date ) {

                $('#enddatetime').data('DateTimePicker').setDate(e.date.clone().startOf('minute').add(1, 'hour'));
            }

            //GET NEW DATA
            $.getJSON('/reservation/user/clearcart', function(result) {
                loadAvailableEquip();
            });
    });

    $("#enddatetime").on("dp.change", function (e) {

       var startdt = $('#startdatetime').data('DateTimePicker').getDate().startOf('minute');

            if (moment(e.date).startOf('minute') < startdt) {

                $('#enddatetime').data('DateTimePicker').setDate(startdt.clone().add(1, 'hour'));
            }

            if ( $('#startdatetime').data('DateTimePicker').getDate() > e.date ) {

                $('#startdatetime').data('DateTimePicker').setDate(e.date.clone().startOf('minute').add(-1, 'hour'));
            }

        //GET NEW DATA
        $.getJSON('/reservation/user/clearcart', function(result) {
                loadAvailableEquip();
            });
    });

}