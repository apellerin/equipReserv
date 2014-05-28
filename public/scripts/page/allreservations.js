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
        if(!filter){filter = $('#filter').val()};

        localStorage.setItem("page", page);

        $.getJSON("/reservation/admin/getall?length=" + length + "&page=" + page + "&filter=" + filter, function (result) {
            $('tbody').empty();
            $.each(result, function (key, value) {
            	var buttons;
            	//DETERMINE APPROPRIATE BUTTON ACTIONS BASED ON STATUS_ID
            	switch (value.status_id) {
            		case 1 : buttons = buttonhtml.view;
            		break;
            		case 2 : buttons = buttonhtml.view + buttonhtml.cancel;
            		break;
            		case 3 : buttons = buttonhtml.view;
            		break;
            		case 4 : buttons = buttonhtml.view;
            		break;
            		case 5 : buttons = buttonhtml.view + buttonhtml.approve + buttonhtml.reject;
            		break;
            		case 7 : buttons = buttonhtml.view + buttonhtml.cancel;
            		break;
            	}

                $('tbody')
                    .append(
                        "<tr><td id='reservation_id'>" + value.reservation_id + "</td>" + 
                        "<td id='first_name'>" + value.first_name + "</td>" +
                        "<td id='last_name'>" + value.last_name + "</td>" +
                        "<td id='reserv_start_date'>" + moment(value.reserv_start_date).format("MM/DD/YYYY h:mm A") + "</td>" +
                        "<td id='reserv_end_date'>" + moment(value.reserv_end_date).format("MM/DD/YYYY h:mm A") + "</td>" +
                        "<td id='status_description'>" + value.status_description + "</td>" +
                        "<td id='phone'>" + value.phone + "</td>" +
                        "<td id='email'>" + value.email + "</td>" +
                        "<td class='btn-group'>" + buttons + "</td>" +
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

            //ACTION BUTTON LISTENERS
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
        });
};


//HTML MARKUP FOR ACTIONS BASED ON STATUS_ID
var buttonhtml = {
    approve: "<button id='approveres' class='btn btn-success btn-xs approveres'>Approve</button>" ,
    reject: "<button id='rejectres' class='btn btn-danger btn-xs rejectres'>Reject</button>",
    view: "<button id='viewres' class='btn btn-primary btn-xs viewres'>View</button>",
    cancel: "<button id='cancelres' class='btn btn-danger btn-xs cancelres'>Cancel</button>",
    complete: "<button id='completeres' class='btn btn-success btn-xs completeres'>Complete</button>"
}

var approvereservation = function(id, cb){
	$post();
};

var rejectreservation = function(id, cb){
	$post();
};

var cancelreservation = function(id, cb){
	$post();
};

var completereservation = function(id, cb){
	$post();
};