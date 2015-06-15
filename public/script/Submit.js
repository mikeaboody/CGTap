var submit = function() {
	var minutes = ($('input[name="minutes"]').val() == "") ? 0 : parseInt($('input[name="minutes"]').val(), 10);
	var hours = ($('input[name="hours"]').val() == "") ? 0 : parseInt($('input[name="hours"]').val(), 10);
	var post_hours = hours;
	if (minutes % 15 < 6) {
		post_hours += Math.floor(minutes / 15) / 4;
	} else {
		post_hours += Math.ceil(minutes / 15) / 4;
	}
	if (post_hours > 0) {
		submitObj.proj_id = $(".projects select option:selected").val();
		submitObj.task_id = $(".tasks select option:selected").val();
		submitObj.task_type = $(".payment select option:selected").val();
		submitObj.hours = post_hours;
		submitObj.epoch_date = (new Date()).getTime();
		postRequest(submitObj);
		alert("You've submitted your hours!");
	} else {
		alert("You cannot submit time under 6 minutes!");
	}
}

var postRequest = function(submitObj) {
	var postObj = {email: submitObj.user_email, first_name: submitObj.first_name, last_name: submitObj.last_name, project_id: submitObj.proj_id, 
					hours: submitObj.hours, date: submitObj.epoch_date, task_id: submitObj.task_id, task_type: submitObj.task_type}
	var url = "/submit";
	$.post(url, postObj, function() {
		postToOpenAir();
	});
}

var postToOpenAir = function() {
	var postObj = {email: submitObj.user_email, project_id: submitObj.proj_id, hours: submitObj.hours, date: submitObj.epoch_date, 
					task_id: submitObj.task_id, task_type: submitObj.task_type}
	$.post(base + "/timeentry/submit", postObj);
}
