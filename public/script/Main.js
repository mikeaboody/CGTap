$(document).ready(function() {
	if ($.inArray(master_email.toLowerCase(), developerEmails) != -1) {
		master_email = "brian.forster@controlgroup.com";
		base = "https://cgp-api-dev.controlgroup.com";
	}
	setup();
});
