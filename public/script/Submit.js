var submit = function() {
	var submitObj_list = submitObjList();
	var failed = submitObj_list[1];
	submitObj_list = submitObj_list[0];
	// if (submitObj_list == null) {
	// 	swal("Insufficient!", "One of your projects has a bad field.", "error");
	// 	return;
	// }
	var confirmSubmit = function() {
		postSubmitObjs(submitObj_list, function() {
			swal({
				title: "You have submitted your hours!",
				type: "success"
			},reset);
			
		});
	}

	var date_selected = $(".submit_date .datepicker").datepicker("getDate");
	var table_html = "<div>Submitting for " + dateFormat(date_selected) + "</div><br>";
	var total_hours = totalHours(submitObj_list);
	table_html += "<div>Total time: " + total_hours[0] + " hours " + total_hours[1] + " minutes</div><br>"

	table_html += submitTable(submitObj_list);

	if (failed.length > 0) {
		table_html += "<div>Incomplete entries not to be submitted</div><br>";
		table_html += insufficientTable(failed);
		console.log("FAILED");
	}
	swal({   
		title: "Do you want to send to OpenAir?",   
		text: table_html,
		html: true,    
		showCancelButton: true,   
		confirmButtonColor: "#FF6700",   
		confirmButtonText: "Send to OpenAir",   
		cancelButtonText: "Cancel",   
		closeOnConfirm: true,   
		closeOnCancel: true }, 
		confirmSubmit
	);
}

var createSubmitObj = function(tr) {
	var submitObj = new Submittable();
	var $current_tr = tr.$getJQuery();
	var minutes = ($current_tr.find('input[name="minutes"]').val() == "") ? 0 : parseInt($current_tr.find('input[name="minutes"]').val(), 10);
	var hours = ($current_tr.find('input[name="hours"]').val() == "") ? 0 : parseInt($current_tr.find('input[name="hours"]').val(), 10);
	var post_hours = hours;
	if (minutes % 15 < 6) {
		post_hours += Math.floor(minutes / 15) / 4;
	} else {
		post_hours += Math.ceil(minutes / 15) / 4;
	}
	submitObj.raw_hours = hours;
	submitObj.raw_minutes = minutes;
	submitObj.email = Submittable.user.email;
	submitObj.first_name = Submittable.user.first_name;
	submitObj.last_name = Submittable.user.last_name;
	submitObj.project_nm = $current_tr.find(".projects select option:selected").text();
	submitObj.project_id = $current_tr.find(".projects select option:selected").val();
	submitObj.task_nm = $current_tr.find(".tasks select option:selected").text();
	submitObj.task_id = $current_tr.find(".tasks select option:selected").val();
	submitObj.task_type_nm = $current_tr.find(".payment select option:selected").text();
	submitObj.task_type = $current_tr.find(".payment select option:selected").val();
	submitObj.hours = post_hours;
	submitObj.date = $(".submit_date .datepicker").datepicker( "getDate" ).getTime();
	submitObj.notes = $current_tr.find(".notes textarea").val();
	var empty = submitObj.hours <= 0 && submitObj.project_id == "" && submitObj.task_id == "" &&
				submitObj.task_type == "" && submitObj.notes == "";
	var incomplete = submitObj.hours <= 0 || submitObj.project_id == "" || submitObj.task_id == "" ||
				submitObj.task_type == "";
	if (empty) {
		return null;
	}
	if (!incomplete) {
		return [true, submitObj];
	} else {
		return [false, submitObj];
	}
}

var submitTable = function(submitObj_list) {
	var table_html = "<table id='submit_table'class='table table-bordered'>";
	
	table_html += "<thead><tr><th>Project</th><th>Task</th><th>Billing Type</th><th>Time</th></tr></thead>";
	table_html += "<tbody>";

	for (i in submitObj_list) {
		var obj = submitObj_list[i];
		var proj_name = obj.project_nm;
		var task_name = obj.task_nm;
		var task_type_name = obj.task_type_nm;
		var hours = obj.raw_hours;
		var minutes = obj.raw_minutes;
		var current_tr = "<tr><td align='left' >" + proj_name + "</td><td align='left'>" + task_name + "</td><td align='left'>" +
							task_type_name + "</td><td align='left'>" + hours + " hours " + minutes + " minutes</td></tr>";
		table_html += current_tr;
	}
	table_html += "</tbody></table>";
	return table_html;
}

var insufficientTable = function(failed) {
	var table_html = "<table id='submit_table'class='table table-bordered'>";
	
	table_html += "<thead><tr><th>Project</th><th>Task</th><th>Billing Type</th><th>Time</th></tr></thead>";
	table_html += "<tbody>";

	for (i in failed) {
		var obj = failed[i];
		var proj_name = obj.project_nm;
		var task_name = obj.task_nm;
		var task_type_name = obj.task_type_nm;
		var hours = obj.raw_hours;
		var minutes = obj.raw_minutes;
		var current_tr = "<tr><td align='left' >" + proj_name + "</td><td align='left'>" + task_name + "</td><td align='left'>" +
							task_type_name + "</td><td align='left'>" + hours + " hours " + minutes + " minutes</td></tr>";
		table_html += current_tr;
	}
	table_html += "</tbody></table>";
	return table_html;
}

var submitObjList = function() {
	var submitObj_list = [];
	var failed = [];
	for (id in tr_map) {
		var currSubmitObj = createSubmitObj(tr_map[id]);
		if (currSubmitObj == null) {
			deleteRow(tr_map[id]);
		} else if (currSubmitObj[0]) {
			submitObj_list.push(currSubmitObj[1]);
		} else {
			failed.push(currSubmitObj[1]);
		}
	}
	return [submitObj_list, failed];
}

var postSubmitObjs = function(postObjs, success) {
	var i = 0;
	var next = function() {
		if (i < postObjs.length) {
			var postObj = postObjs[i];
			i += 1;
			delete postObj["raw_minutes"];
			delete postObj["raw_hours"];
			COMMUNICATOR.postToDatabase(postObj, function() {
				delete postObj["first_name"];
				delete postObj["last_name"];
				delete postObj["project_nm"];
				delete postObj["task_nm"];
				delete postObj["task_type_nm"];
				if (postObj["notes"] == "") {
					delete postObj["notes"];
				}
				console.log(postObj);
				COMMUNICATOR.postToOpenAir(postObj, next, function() {
					console.log(postObj);
					console.log("failure");
				});
			});
		} else {
			success();
		}
	}
	next();
}

var totalHours = function(submitObjs) {
	var total = 0;
	for (var i = 0; i < submitObjs.length; i += 1) {
		obj = submitObjs[i];
		total += obj.raw_minutes + obj.raw_hours * 60;
	}
	return [Math.floor(total / 60) + "", total % 60]
}

var reset = function() {
	$(".content").hide(1);
	$(".welcome").html("Loading...<span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span>");
	if (current_time_tr != null) {
		stopTimer(current_time_tr);
	}
	tr_map = {};
	$("#time_sheet_table tbody").empty();
	$("#time_sheet_table tbody").append("<tr>" + $template_row.html() + "</tr>");
	loadUserData();
}

