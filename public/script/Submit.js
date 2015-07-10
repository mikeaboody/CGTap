var submit = function() {
	var TRLists = TRClassification();
	var submitTRList = TRLists[0];
	var insufficientTRList = TRLists[1];
	var emptyTRList = TRLists[2];
	if (insufficientTRList.length == 0 && submitTRList.length == 0) {
		swal({   
			title: "Timesheet empty",
			text: "Please fill out your timesheet before submitting.",
			type: "error"
		});
		return;
	}
	deleteTRs(emptyTRList);
	
	// if (submitObj_list == null) {
	// 	swal("Insufficient!", "One of your projects has a bad field.", "error");
	// 	return;
	// }
	var confirmSubmit = function() {
		postSubmitObjs(submitTRList, function() {
			setTimeout(function() {
				swal({
					title: "You have submitted your hours!",
					type: "success"
				}, function() {
					reset(TRLists);
				});
			}, 500);
		});
	}

	var date_selected = $(".submit_date .datepicker").datepicker("getDate");
	var table_html = "<div>Submitting for " + dateFormat(date_selected) + "</div><br>";
	if (submitTRList.length > 0) {
		var total_hours = totalHours(submitTRList);
		table_html += "<div>Total time: " + total_hours[0] + " hours " + total_hours[1] + " minutes</div><br>";
		table_html += submitTable(submitTRList);
		if (insufficientTRList.length > 0) {
			table_html += "<div>Incomplete entries not to be submitted</div><br>";
			table_html += insufficientTable(insufficientTRList);
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
	} else {
		table_html = "<div>Incomplete entries not to be submitted</div><br>";
		table_html += insufficientTable(insufficientTRList);
		swal({   
			title: "No complete entries",
			type: "error",   
			text: table_html,
			html: true
		});
	}
	
	
}

var createSubmitObj = function(tr) {
	var submitObj = new Submittable();
	submitObj.email = Submittable.user.email;
	submitObj.first_name = Submittable.user.first_name;
	submitObj.last_name = Submittable.user.last_name;
	submitObj.project_nm = tr.getProjectName();
	submitObj.project_id = tr.getProjectID()
	submitObj.task_nm = tr.getTaskName();
	submitObj.task_id = tr.getTaskID();
	submitObj.task_type_nm = tr.getTaskTypeName();
	submitObj.task_type = tr.getTaskTypeID();
	submitObj.hours = tr.getConvertedHours();
	submitObj.date = $(".submit_date .datepicker").datepicker( "getDate" ).getTime();
	submitObj.notes = tr.getNotes();
	return submitObj;
}

var submitTable = function(submitTRList) {
	var table_html = "<table id='submit_table'class='table table-bordered'>";
	
	table_html += "<thead><tr><th>Project</th><th>Task</th><th>Billing Type</th><th>Time</th></tr></thead>";
	table_html += "<tbody>";

	for (i in submitTRList) {
		var tr = submitTRList[i];
		var proj_name = tr.getProjectName();
		var task_name = tr.getTaskName();
		var task_type_name = tr.getTaskTypeName();
		var hours = tr.getHours();
		var minutes = tr.getMinutes();
		var current_tr = "<tr><td align='left' >" + proj_name + "</td><td align='left'>" + task_name + "</td><td align='left'>" +
							task_type_name + "</td><td align='left'>" + hours + " hours " + minutes + " minutes</td></tr>";
		table_html += current_tr;
	}
	table_html += "</tbody></table>";
	return table_html;
}

var insufficientTable = function(insufficientTRList) {
	var table_html = "<table id='submit_table'class='table table-bordered'>";
	
	table_html += "<thead><tr><th>Project</th><th>Task</th><th>Billing Type</th><th>Time</th></tr></thead>";
	table_html += "<tbody>";

	for (i in insufficientTRList) {
		var tr = insufficientTRList[i]
		var proj_name = tr.getProjectName();
		var proj_id = tr.getProjectID();
		var task_name = tr.getTaskName();
		var task_id = tr.getTaskID();
		var task_type_name = tr.getTaskTypeName();
		var task_type_id = tr.getTaskTypeID();
		var hours = tr.getHours();
		var minutes = tr.getMinutes();
		// var incomplete = submitObj.hours <= 0 || submitObj.project_id == "" || submitObj.task_id == "" ||
		// 		submitObj.task_type == "";
		var current_tr = "<tr>"
		if (proj_id == "") {
			current_tr += "<td align='left' class='insufficient_entry'>" + proj_name + "</td>";
		} else {
			current_tr += "<td align='left' >" + proj_name + "</td>";
		}
		if (task_id == "") {
			current_tr += "<td align='left' class='insufficient_entry'>" + task_name + "</td>";
		} else {
			current_tr += "<td align='left'>" + task_name + "</td>";
		}
		if (task_type_id == "") {
			current_tr +=  "<td align='left' class='insufficient_entry'>" + task_type_name + "</td>";
		} else {
			current_tr +=  "<td align='left'>" + task_type_name + "</td>";
		}
		if (hours <= 0) {
			current_tr += "<td align='left' class='insufficient_entry'>" + hours + " hours " + minutes + " minutes</td>";
		} else {
			current_tr += "<td align='left'>" + hours + " hours " + minutes + " minutes</td>";
		}
		current_tr += "</tr>";
		table_html += current_tr;
	}
	table_html += "</tbody></table>";
	return table_html;
}

var deleteTRs = function(TRList) {
	for (i in TRList) {
		console.log(TRList[i]);
		deleteRow(TRList[i]);
	}
}
//instead of returning good and bad submit objs, returns good and bad TR's
var TRClassification = function() {
	//move the checking into here from createSubmitObj
	var submitTRList = [];
	var insufficientTRList = [];
	var emptyTRList = [];
	for (id in tr_map) {
		var tr = tr_map[id];
		var empty = tr.getConvertedHours() <= 0 && tr.getProjectID() == "" && tr.getTaskID() == "" &&
				tr.getTaskTypeID() == "" && tr.getNotes() == "";
		var insufficient = tr.getConvertedHours() <= 0 || tr.getProjectID() == "" || tr.getTaskID() == "" ||
				tr.getTaskTypeID() == "";
		if (empty) {
			emptyTRList.push(tr);
		} else if (insufficient) {
			insufficientTRList.push(tr);
		} else {
			submitTRList.push(tr);
		}
	}
	return [submitTRList, insufficientTRList, emptyTRList];
}

var postSubmitObjs = function(submitTRList, success) {
	var i = 0;
	var next = function() {
		if (i < submitTRList.length) {
			var postObj = submitTRList[i].createSubmitObj();
			i += 1;
			COMMUNICATOR.postToDatabase(postObj, function() {
				delete postObj["first_name"];
				delete postObj["last_name"];
				delete postObj["project_nm"];
				delete postObj["task_nm"];
				delete postObj["task_type_nm"];
				if (postObj["notes"] == "") {
					delete postObj["notes"];
				}
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

var totalHours = function(submitTRList) {
	var total = 0;
	for (var i = 0; i < submitTRList.length; i += 1) {
		var tr = submitTRList[i];
		total += tr.getMinutes() + tr.getHours() * 60;
	}
	return [Math.floor(total / 60) + "", total % 60]
}

var reset = function(TRLists) {
	// $(".content").hide(1);
	// $(".welcome").html("Loading...<span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span>");
	if (current_time_tr != null) {
		stopTimer(current_time_tr);
	}
	var submitTRList = TRLists[0];
	var insufficientTRList = TRLists[1];
	if (insufficientTRList.length == 0) {
		addRow();
	}
	deleteTRs(submitTRList);
	// tr_map = {};
	// $("#time_sheet_table tbody").empty();
	// $("#time_sheet_table tbody").append("<tr>" + $template_row.html() + "</tr>");
	// loadUserData();
}

