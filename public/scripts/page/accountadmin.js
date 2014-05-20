$(document).ready( function () {

	accountform = $('accountform');
	passform = $('changepassform');

		//Form Validation & Submission
	$("input,select,textarea").not("[type=submit]").jqBootstrapValidation(
		
		{
			submitSuccess: function (accountform, event) {

				alertify.log('success!');
			},

			submitError: function () {

				alertify.log('failure!');
			}
		}
	);
});