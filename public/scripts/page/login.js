$(document).ready(function() {
	msieversion();
	
    //initialize form validation
    $("input,select,textarea").not("[type=submit]").jqBootstrapValidation();

     //On modal set focus in first input
    $("#myModal").on('shown.bs.modal', function() {
        $(this).find("[autofocus]:first").focus();
    });

});


function msieversion() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0) {
        	var version = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
        	if(version < 11){
        		$('.loginarea').prepend('<div class="alert alert-warning alert-dismissable">' +
  					'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
  					'<strong>Warning!</strong> You are using Internet Explorer.  This site is ' +
  					'best viewed with Chrome, Safari or Firefox</div>');
        	}

        }

        else if(!!navigator.userAgent.match(/Trident.*rv\:11\./))  {
        	$('.loginarea').prepend('<div class="alert alert-warning alert-dismissable">' +
  					'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
  					'<strong>Warning!</strong> You are using Internet Explorer.  This site is ' +
  					'best viewed with Chrome, Safai or Firefox</div>');
        }     
            
        else  {
        
        }
            
}