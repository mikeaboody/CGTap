$(document).ready(function() {
	//window.location.href.indexOf("localhost:4567") > -1
	if (typeof master_email !== "undefined" && (master_email == "mikeaboody@gmail.com" || master_email == "janine.harper@controlgroup.com" || master_email == "michael.aboody@controlgroup.com")) {
		master_email = "brian.forster@controlgroup.com";
		base = "https://cgp-dev-a-proxyapi-1k3d5yvvqgnkd-2077293011.us-east-1.elb.amazonaws.com";
	}
	setup();
});