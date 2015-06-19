var submit = function() {
	var submitObj = new Submittable();
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
		submitObj.notes = $(".notes textarea").val();
		var postObj = {email: Submittable.user.email, first_name: Submittable.user.first_name, last_name: Submittable.user.last_name, project_id: submitObj.proj_id, 
						hours: submitObj.hours, date: submitObj.epoch_date, task_id: submitObj.task_id, task_type: submitObj.task_type, notes: submitObj.notes}
		var success = function() {
			postToOpenAir(postObj);
		}
		COMMUNICATOR.postToDatabase(postObj, success);
	} else {
		alert("You cannot submit time under 6 minutes!");
	}
}

var createSubmitObj = function(index) {
	var submitObj = new Submittable();
	var $current_tr = $nthTR(index);
	var minutes = ($current_tr.find('input[name="minutes"]').val() == "") ? 0 : parseInt($current_tr.find('input[name="minutes"]').val(), 10);
	var hours = ($('input[name="hours"]').val() == "") ? 0 : parseInt($current_tr.find('input[name="minutes"]').val(), 10);
	var post_hours = hours;
	if (minutes % 15 < 6) {
		post_hours += Math.floor(minutes / 15) / 4;
	} else {
		post_hours += Math.ceil(minutes / 15) / 4;
	}
	submitObj.proj_id = $current_tr.find(".projects select option:selected").val();
	submitObj.task_id = $current_tr.find(".tasks select option:selected").val();
	submitObj.task_type = $current_tr.find(".payment select option:selected").val();
	submitObj.hours = post_hours;
	submitObj.epoch_date = (new Date()).getTime();
	submitObj.notes = $current_tr.find(".notes textarea").val();
	return submitObj;
}
var postToOpenAir = function(postObj) {
	delete postObj["first_name"];
	delete postObj["last_name"];
	COMMUNICATOR.postToOpenAir(postObj, function() {
		alert("You've submitted your hours!");
	});
	
}
