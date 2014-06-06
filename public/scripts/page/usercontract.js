$(document).ready(function() {
	var urlvars = getUrlVars();
	var rid = urlvars.reservation_id;
	$.post('/reservation/admin/getcontractdata',{reservation_id: rid}, function(results){
		var today = moment().format("LLL");
		$('#content').append("<text>" + today + "</text><br><br>" + 
			"<text>You are checking out the following equipment:</text><br><br>"
		);

		var listhtml = '<ul>';
		var products = [];
		var list = $.each(results, function (key, value) {
	
			listhtml = listhtml + "<li>" + value.make + " " + value.model + 
			" Id# " + value.inventory_id + "</li>";

		});

		listhtml = listhtml + "</ul>";
		$('#content').append(listhtml);
		$('#content').append("<br><br><text><strong>From: </strong>" + moment(results[0].reserv_start_date).format("LLL")
			 + "</text><br><text><strong>To: </strong>" +  moment(results[0].reserv_end_date).format("LLL") + 
			 "</text><br><br><br>" + "<text>I, <strong>" + results[0].first_name + " " + results[0].last_name + 
			 "</strong> realize that I am wholly responsible for the equipment during the time it is checked out \
			  and will be liable for the costs of replacement/repair if damage or theft occurs due to my negligence.<br><br>"
			  + "<text>Signed: _________________________________________________________________</text><br><br>"
			  + "<text>Print Name: _____________________________________________________________</text><br><br>"
			  + "<text>Date: ______________________________________</text><br><br>"
		);


	});

	window.print();

});


// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}