//This file is for scripts that should be applied to every page.

$(document).ready(function() {

	_blockobj =  { 
                    message: $('#processing'),
                    css: { 
                        top:  ($(window).height() - 100) /2 + 'px', 
                        left: ($(window).width() - 100) /2 + 'px', 
                        width: '150px', 
                        
                        opacity: .6, 
                        color: '#fff' 
                        }
                    };

	//autofocus first field with autofocus attribute
	$(this).find("[autofocus]:first").focus();

});