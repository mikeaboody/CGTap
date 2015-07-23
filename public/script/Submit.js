var submit = function() {
	var TRLists = TRClassification();
	var submitTRList = TRLists[0];
	var insufficientTRList = TRLists[1];
	var emptyTRList = TRLists[2];
	if (insufficientTRList.length == 0 && submitTRList.length == 0) {
		swal({   
			title: "Timesheet Empty!",
			text: "Please fill out your timesheet before submitting.",
			type: "error"
		});
		return;
	}
	deleteTRs(emptyTRList);
	var confirmSubmit = function() {
		$(".welcome").html("Submitting...<span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span>");
		postSubmitObjs(submitTRList, function() {
			setTimeout(function() {
				$(".welcome").html("Welcome " + master_user.first_name + "!");
				swal({
					title: "You Have Sent Your Timesheet to OpenAir!",
					text: "Do you want to clear submitted entries?",
					type: "success",
					showCancelButton: true,
					confirmButtonColor: "#FF6700",
					confirmButtonText: "Yes",
					cancelButtonText: "No",
				}, function(confirmReset) {
					drawProgressDonut();
					if (confirmReset) {
						reset(TRLists);
					}
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
			table_html += "<div>These entries are incomplete and will not be sent:</div><br>";
			table_html += insufficientTable(insufficientTRList);
		}
		swal({   
			title: "Do You Want to Send to OpenAir?",   
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
		table_html = "<div>Please complete one or more entries before submitting.</div><br>";
		table_html += insufficientTable(insufficientTRList);
		swal({   
			title: "No Complete Entries!",
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
	submitObj.project_nm = tr.getSelectedProjectName();
	submitObj.project_id = tr.getSelectedProjectID()
	submitObj.task_nm = tr.getSelectedTaskName();
	submitObj.task_id = tr.getSelectedTaskID();
	submitObj.task_type_nm = tr.getSelectedTaskTypeName();
	submitObj.task_type = tr.getSelectedTaskTypeID();
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
		var proj_name = tr.getSelectedProjectName();
		var task_name = tr.getSelectedTaskName();
		var task_type_name = tr.getSelectedTaskTypeName();
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
		var proj_name = tr.getSelectedProjectName();
		var proj_id = tr.getSelectedProjectID();
		var task_name = tr.getSelectedTaskName();
		var task_id = tr.getSelectedTaskID();
		var task_type_name = tr.getSelectedTaskTypeName();
		var task_type_id = tr.getSelectedTaskTypeID();
		var converted_hours = tr.getConvertedHours();
		var hours = tr.getHours();
		var minutes = tr.getMinutes();
		var current_tr = "<tr>"
		if (proj_id == undefined) {
			current_tr += "<td align='left' class='insufficient_entry'>" + proj_name + "</td>";
		} else {
			current_tr += "<td align='left' >" + proj_name + "</td>";
		}
		if (task_id == undefined) {
			current_tr += "<td align='left' class='insufficient_entry'>" + task_name + "</td>";
		} else {
			current_tr += "<td align='left'>" + task_name + "</td>";
		}
		if (task_type_id == undefined) {
			current_tr +=  "<td align='left' class='insufficient_entry'>" + task_type_name + "</td>";
		} else {
			current_tr +=  "<td align='left'>" + task_type_name + "</td>";
		}
		if (converted_hours <= 0) {
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
		deleteRow(TRList[i]);
	}
}

var TRClassification = function() {
	var submitTRList = [];
	var insufficientTRList = [];
	var emptyTRList = [];
	for (id in tr_map) {
		var tr = tr_map[id];
		var empty = tr.getConvertedHours() <= 0 && tr.getSelectedProjectID() == undefined && tr.getSelectedTaskID() == undefined &&
				tr.getSelectedTaskTypeID() == undefined && tr.getNotes() == "" && current_time_tr != tr;
		var insufficient = tr.getConvertedHours() <= 0 || tr.getSelectedProjectID() == undefined || tr.getSelectedTaskID() == undefined ||
				tr.getSelectedTaskTypeID() == undefined;
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
			var databaseObj = cloneObject(postObj);
			currPageSubmitObjs.push(cloneObject(postObj));
			i += 1;
			delete postObj["first_name"];
			delete postObj["last_name"];
			delete postObj["project_nm"];
			delete postObj["task_nm"];
			delete postObj["task_type_nm"];
			if (postObj["notes"] == "") {
				delete postObj["notes"];
			}
			COMMUNICATOR.postToOpenAir(postObj, function() {
				COMMUNICATOR.postToDatabase(databaseObj, next);
			});	
		} else {
			success();
		}
	}
	next();
}

var cloneObject = function(obj) {
	return jQuery.extend({}, obj);
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
	if (current_time_tr != null) {
		stopTimer(current_time_tr);
	}
	var submitTRList = TRLists[0];
	var insufficientTRList = TRLists[1];
	if (insufficientTRList.length == 0) {
		addRow();
	}
	deleteTRs(submitTRList);
	saveStorage();
}

