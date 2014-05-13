$(document).ready(function () {

    //Initialize Cart Timer Var
    carttimer = false;

    //Set Up the Date/Time Picker & Defaults
    $('#startdatetime').datetimepicker();
    $('#enddatetime').datetimepicker();

    var now = new moment();
    $('#startdatetime').data('DateTimePicker').setDate(now.add(1, 'day').startOf('hour'));
    $('#enddatetime').data('DateTimePicker').setDate(now.add(1, 'day').add(1, 'hour'));
    var now = new moment();
    $('#startdatetime').data('DateTimePicker').setMinDate(now.add(-1, 'day'));
    var now = new moment();
    $('#enddatetime').data('DateTimePicker').setMinDate(now.add(-1, 'day'));
    var now = new moment();

    //Register Change Listener
    $("#startdatetime")
        .on("dp.change", function (e) {
            newend = new moment($('#startdatetime').data("DateTimePicker").getDate());
            $('#enddatetime').data('DateTimePicker').setDate(newend.add(1, 'day').add(1, 'hour'));
            $.getJSON('/reservation/user/clearcart', function(result) {
                loadAvailableEquip();
            });
        });

    $("#enddatetime").on("dp.change", function (e) {
        $('#startdatetime').data("DateTimePicker").setMaxDate(e.date);
        var endDate = $('#startdatetime').data("DateTimePicker").getDate();
        $.getJSON('/reservation/user/clearcart', function(result) {
                loadAvailableEquip();
            });
    });


    //LOAD AVAILABLE EQUIPMENT TABLE
    loadAvailableEquip();
    
    //Start Cart Countown Timer Functions
    startTimer();

    //REFRESH DATA ON FILTER EDIT
    $('#aeq-filter').on('input', function () {
        loadAvailableEquip(null, null, $('#aeq-filter').val());
    });

});

//LOAD/REFRESH TABLE DATA
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
                        "<td>" + "<a href='#additem' id='additem' class='btn btn-success btn-sm aeq-add'>Add</a>" + "</td>" +
                        "<td>" + "<a href='#viewitem1' id='viewitem1' class='btn btn-primary btn-sm aeq-view'>View</a>" + "</td>" +
                        "</tr>");
            });

        //Register View & Add Button Listeners
        $('.aeq-add').on('click', function () {
            if ( $('#startinput').val() == '' || $('#startinput').val() == '' ) { 
                alertify.alert("You must set start & end date/time for your reservation."); 
            }
            else {
                var eid = $(this).parent().siblings(":first").text();
                $.post("/reservation/user/addcart",{equip_id: eid, start: start, end: end},  function (result) {
                    alertify.success("Item Added.",5000);
                    loadAvailableEquip();
                }); 
            }
        });
        loadShoppingCart();
    }); 
};

var loadShoppingCart = function() {

    $.getJSON("/reservation/user/getcartitems", function (result) {
            $('#cart-body').empty();
            $.each(result, function (key, value) {
                $('#cart-body')
                    .append(
                        "<tr><td id='type'>" + value.type_desc + "</td>" +
                        "<td id='make'>" + value.make + "</td>" +
                        "<td id='model'>" + value.model + "</td>" +
                        "<td id='inventory_id'>" + value.inventory_id + "</td>" +
                        "<td>" + "<a href='#deleteitem' id='deleteitem' class='btn btn-danger btn-sm cart-delete'>Remove</a>" + "</td>" +
                        "<td>" + "<a href='#viewitem2' id='viewitem2' class='btn btn-primary btn-sm cart-view'>View</a>" + "</td>" +
                        "</tr>");
            });
    });
}

//Set UpdateTimer function to run every second.
var startTimer = function() {
    if (! carttimer) {
        cartimer = true;
        setInterval(updateTimer,1000);
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

            if(minutes === 0 && seconds === 0) {
                $('#timer').html('5:00');
                loadAvailableEquip();
                loadShoppingCart();
            } else if (seconds < 10) {
                $('#timer').html(minutes + ':0' + seconds);
            }
            else {
                $('#timer').html(minutes + ':' + seconds);
            }
        }
    });
}

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