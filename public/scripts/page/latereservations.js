$(document).ready(function() {

 //initial table load
    loadTable();
    setInterval(loadTable, 60000);

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
    $.blockUI(_blockobj);
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

    

    $.getJSON("/reservation/admin/getlate?length=" + length + "&page=" + page + "&filter=" + filter, function (result) {
        $('tbody').empty();
        $.each(result, function (key, value) {
        	var buttons;
        	//DETERMINE APPROPRIATE BUTTON ACTIONS BASED ON STATUS_ID
        	switch (value.status_id) {
                // REJECTED
                case 1 : buttons = buttonhtml.view;
                break;
                // IN PROGRESS
                case 2 : buttons = buttonhtml.view + buttonhtml.complete + buttonhtml.cancel + buttonhtml.print;
                break;
                // CANCELLED
                case 3 : buttons = buttonhtml.view;
                break;
                // COMPLETED
                case 4 : buttons = buttonhtml.view + buttonhtml.print;
                break;
                // PENDING
                case 5 : buttons = buttonhtml.view + buttonhtml.approve + buttonhtml.reject;
                break;
                // APPROVED
                case 7 : buttons = buttonhtml.view + buttonhtml.start + buttonhtml.cancel + buttonhtml.print;
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
                    buttons + "</tr>");
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

        	})
            .fail(function() {
                $('#reseq-body').empty();
            });
    	});

        $('.approveres').on("click", function() {
            var rid = $(this).parent().siblings('#reservation_id').text();

            alertify.confirm('Are you sure you want to approve this reservation?', function (e){
                if(e) {
                    $.blockUI(_blockobj);
                    approvereservation(rid, function(result){
                        if (! result) {
                            alertify.error('An error occurred.  Please retry.');
                            loadTable();
                        } else {
                            alertify.success('Reservation ' + rid + ' Approved.');
                            loadTable();
                        }
                    });
                }
            });
        });

        $('.cancelres').on("click", function() {
            var rid = $(this).parent().siblings('#reservation_id').text();

            alertify.confirm('Are you sure you want to cancel this reservation?', function (e){
                if(e) {
                    $.blockUI(_blockobj);
                    cancelreservation(rid, function(result){
                        if (! result) {
                            alertify.error('An error occurred.  Please retry.');
                            loadTable();
                        } else {
                            alertify.success('Reservation ' + rid + ' Cancelled.');
                            loadTable();
                        }
                    });
                }
            });
        });

        $('.rejectres').on("click", function() {
            var rid = $(this).parent().siblings('#reservation_id').text();

            alertify.confirm('Are you sure you want to reject this reservation?', function (e){
                if(e) {
                    $.blockUI(_blockobj);
                    rejectreservation(rid, function(result){
                        if (! result) {
                            alertify.error('An error occurred.  Please retry.');
                            loadTable();
                        } else {
                            alertify.success('Reservation ' + rid + ' Rejected.');
                            loadTable();
                        }
                    });
                }
            });
        });

        $('.completeres').on("click", function() {
            var rid = $(this).parent().siblings('#reservation_id').text();

            alertify.confirm('Are you sure you want to complete this reservation?', function (e){
                if(e) {
                    $.blockUI(_blockobj);
                    completereservation(rid, function(result){
                        if (! result) {
                            alertify.error('An error occurred.  Please retry.');
                            loadTable();
                        } else {
                            alertify.success('Reservation ' + rid + ' Completed.');
                            loadTable();
                        }
                    });
                }
            });
        });

        $('.startres').on("click", function() {
            var rid = $(this).parent().siblings('#reservation_id').text();

            alertify.confirm('Are you sure you want to start this reservation?', function (e){
                if(e) {
                    $.blockUI(_blockobj);
                    startreservation(rid, function(result){
                        if (! result) {
                            alertify.error('An error occurred.  Please retry.');
                            loadTable();
                        } else {
                            alertify.success('Reservation ' + rid + ' Started.');
                            loadTable();
                        }
                    });
                }
            });
        });

        $('.printres').on('click', function() {
            var rid = $(this).parent().siblings('#reservation_id').text();
            printreservation(rid);
        });

    })
    .fail(function() {
        $('tbody').empty();
    })
    .always(function() {
        $.unblockUI();
    });
};


//HTML MARKUP FOR ACTIONS BASED ON STATUS_ID
var buttonhtml = {
    approve: "<td><button id='approveres' class='btn btn-success btn-xs approveres actionbutton'>Approve</button></td>" ,
    reject: "<td><button id='rejectres' class='btn btn-danger btn-xs rejectres actionbutton'>Reject</button></td>",
    view: "<td><button id='viewres' class='btn btn-primary btn-xs viewres actionbutton'>View</button></td>",
    cancel: "<td><button id='cancelres' class='btn btn-danger btn-xs cancelres actionbutton'>Cancel</button></td>",
    complete: "<td><button id='completeres' class='btn btn-success btn-xs completeres actionbutton'>Complete</button></td>",
    start: "<td><button id='startres' class='btn btn-success btn-xs startres actionbutton'>Start</button></td>",
    print: "<td><button id='printres' class='btn btn-default btn-xs printres actionbutton'>Print</button></td>"
}

var approvereservation = function(id, cb){
	$.post('/reservation/admin/approvereservation',{reservation_id: id}, function(result){
        cb(result);
    });
};

var rejectreservation = function(id, cb){
	$.post('/reservation/admin/rejectreservation',{reservation_id: id}, function(result){
        cb(result);
    });
};

var cancelreservation = function(id, cb){
	$.post('/reservation/admin/cancelreservation',{reservation_id: id}, function(result){
        cb(result);
    });
};

var completereservation = function(id, cb){
	$.post('/reservation/admin/completereservation',{reservation_id: id}, function(result){
        cb(result);
    });
};

var startreservation = function(id, cb){
    $.post('/reservation/admin/startreservation',{reservation_id: id}, function(result){
        cb(result);
    });
};

var printreservation = function(id){
    var urs = document.location.href.split('/');
    var root = urs[1];
    var windowName = ' Contract';
    var url = '/reservation/admin/printcontract?reservation_id=' + id;
    window.open(url, windowName, "height=961,width=861");
};