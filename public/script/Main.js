$(document).on('click', '#timer_button', function () {
	switchTimer();
	$("#timer_button").toggleClass('highlight');
});
$(document).ready(function() {
	setup();
});