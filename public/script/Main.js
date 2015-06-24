$(document).ready(function() {
	if (typeof master_email !== "undefined" && (master_email == "mikeaboody@gmail.com" || "janine.harper@controlgroup.com") && window.location.href.indexOf("localhost:4567") > -1) {
		master_email = "brian.forster@controlgroup.com";
		base = "https://cgp-api-dev.controlgroup.com";
	}
	setup();
});