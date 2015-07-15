var loadTRUI = function(tr) {
	updateProjectUI(tr);
	setupTRUI(tr);
	updateTasksUI(tr);
	updateTimeTypeUI(tr);
	updateManualTimeUI(tr);
	updateNotesUI(tr);
	updateTimerLabelUI(tr);
	updateLabel(tr);
}

var setupTRUI = function(tr) {
	tr.$projectJQ().on('change', function() {
		tr.currSelected = {};
		tr.updateSelectedProject();
		tr.updateTasks(tr.getSelectedProjectID(), displayLoadingTasks, function() {
			updateTasksUI(tr);
			tr.updateTimeType(tr.getSelectedProjectID(), displayLoadingTimeType, function() {
				updateTimeTypeUI(tr);
		   		tr.updateSelectedTask();
		   		tr.updateSelectedTimeType();
		   		saveStorage();
			});
		});
		// updateLabel(tr);
	});
	tr.$taskJQ().on('change', function() {
   		updateLabel(tr);
   		tr.updateSelectedTask();
   		saveStorage();
	});
	tr.$taskTypeJQ().on('change', function() {
   		updateLabel(tr);
   		tr.updateSelectedTimeType();
   		saveStorage();
	});

	tr.$notesJQ().on('change', function() {
		tr.updateNotes();
		saveStorage();
	})

	tr.$hoursJQ().on('change', function() {
		tr.updateManualTime();
		saveStorage();
	})
	tr.$minutesJQ().on('change', function() {
		tr.updateManualTime();
		saveStorage();
	});

	tr.$timerButtonJQ().on('click', function() {
		tr.switchTimer();
		saveStorage();
	});
	tr.$deleteButtonJQ().on('click', function() {
		deleteRow(tr);
		saveStorage();
	});
}

var updateProjectUI = function(tr) {
	tr.$projectJQ().empty();
	if (tr.getSelectedProjectID() == undefined) {
		tr.$projectJQ().append("<option value='' selected disabled>Project</option>");
	} else {
		tr.$projectJQ().append("<option value='' disabled>Project</option>");
	}
	var keys = Object.keys(tr.currProjects).sort(function(a, b) {
		return tr.currProjects[a].localeCompare(tr.currProjects[b]);
	});
	for (var i = 0; i < keys.length; i += 1) {
		k = keys[i];
		if (tr.getSelectedProjectID() == k) {
			tr.$projectJQ().append("<option value='" + k + "' selected>" + tr.currProjects[k]  + "</option>");
		} else {
			tr.$projectJQ().append("<option value='" + k + "'>" + tr.currProjects[k]  + "</option>");
		}
		
	}
	updateLabel(tr);
}

var displayLoadingTasks = function(tr) {
	tr.$taskJQ().empty();
	tr.$taskJQ().append("<option value='' disabled selected>Loading...</option>");
	updateLabel(tr);
}

var displayLoadingTimeType = function(tr) {
	tr.$taskTypeJQ().empty();
	tr.$taskTypeJQ().append("<option value='' disabled selected>Loading...</option>");
	updateLabel(tr);
}

var updateTasksUI = function(tr, proj_id) {
	tr.$taskJQ().empty();
	if (tr.getSelectedTaskID() == undefined) {
		tr.$taskJQ().append("<option value='' selected disabled>Task</option>");
	} else {
		tr.$taskJQ().append("<option value='' disabled>Task</option>");
	}
	var keys = Object.keys(tr.currTasks).sort(function(a, b) {
		return tr.currTasks[a].localeCompare(tr.currTasks[b]);
	});
	for (var i = 0; i < keys.length; i += 1) {
		k = keys[i];
		if (tr.getSelectedTaskID() == k) {
			tr.$taskJQ().append("<option value='" + k + "' selected> " + tr.currTasks[k]  + "</option>");
		} else {
			tr.$taskJQ().append("<option value='" + k + "'> " + tr.currTasks[k]  + "</option>");
		}
	}
	updateLabel(tr);
}

var updateTimeTypeUI = function(tr, proj_id) {
	tr.$taskTypeJQ().empty();
	if (tr.getSelectedTaskTypeID() == undefined) {
		tr.$taskTypeJQ().append("<option value='' selected disabled>Billing Type</option>");
	} else {
		tr.$taskTypeJQ().append("<option value='' disabled>Billing Type</option>");
	}
	var keys = Object.keys(tr.currTaskTypes).sort(function(a, b) {
		return tr.currTaskTypes[a].localeCompare(tr.currTaskTypes[b]);
	});
	for (var i = 0; i < keys.length; i += 1) {
		k = keys[i];
		if (tr.getSelectedTaskTypeID() == k) {
			tr.$taskTypeJQ().append("<option value='" + k + "' selected> " + tr.currTaskTypes[k]  + "</option>");
		} else {
			tr.$taskTypeJQ().append("<option value='" + k + "'> " + tr.currTaskTypes[k]  + "</option>");
		}
	}
	updateLabel(tr);
}


var updateLabel = function(tr) {
	$(".welcome").html("Welcome " + master_user.first_name + "!");
	if ($(".content").is(":hidden")) {
		$(".content").show();
	}
	tr.$projectJQ().selectpicker('refresh');
	tr.$taskJQ().selectpicker('refresh');
	tr.$taskTypeJQ().selectpicker('refresh');
}

var updateManualTimeUI = function(tr) {
	var minutes = tr.getMinutes();
	var hours = tr.getHours();
	var format = minutes < 10 ? "0" + minutes : "" + minutes;
	tr.$minutesJQ().val(format);
	tr.$hoursJQ().val(hours);
	updateLabel(tr);
}

var updateNotesUI = function(tr) {
	tr.$notesJQ().val(tr.getNotes());
}

var updateTimerLabelUI = function(tr) {
	var hours = Math.floor(tr.time / (3600*1000));
	var minutes = Math.floor(tr.time / (60*1000)) % 60;
	var seconds = Math.floor(tr.time / 1000) % 60;
	var newLabel = ((hours < 10) ? ("0" + hours) : ("" + hours)) + ":"
					+ ((minutes < 10) ? ("0" + minutes) : ("" + minutes)) + ":"
					+ ((seconds < 10) ? ("0" + seconds) : ("" + seconds));
	tr.$timerLabelJQ().html(newLabel);
}

var switchTimer = function(tr) {
	var updateTimer = function() {
		current_time_tr.time += 1000;
		updateTimerLabelUI(tr);
		saveStorage();
	}

	if (tr_timer == null) { //just starting the timer
		startTimer(tr, updateTimer);
	} else { //stopping the timer
		if (current_time_tr == tr) {
			stopTimer(tr);
		} else {
			stopTimer(current_time_tr);
			startTimer(tr, updateTimer);
		}
	}
}

var startTimer = function(tr, action) {
	tr_timer = setInterval(action, 1000);
	current_time_tr = tr;
	current_time_tr.$timerButtonJQ().html("Stop");
	current_time_tr.$timerButtonJQ().toggleClass("btn-danger");
}

var stopTimer = function(tr) {
	clearInterval(tr_timer);
	tr_timer = null;
	current_time_tr = null;
	var hours = Math.floor(tr.time / (3600*1000));
	var minutes = Math.floor(tr.time / (60*1000)) % 60;
	tr.$minutesJQ().val(minutes < 10 ? "0" + minutes : "" + minutes);
	tr.$hoursJQ().val(hours);
	tr.updateManualTime();
	updateLabel(tr);
	tr.$timerButtonJQ().html("Start");
	tr.$timerButtonJQ().toggleClass("btn-danger");
}

var redirectToTimesheet = function() {
	var url = "/display?email=" + master_email;
	window.location.replace(url);
	window.location.href = url;
}

// //allow projects to be sortable

 $(function() {
    $("#time_sheet_table tbody").sortable({
		helper:fixHelper
	}).disableSelection();
 });

// }
var fixHelper = function(e, ui) {
	ui.children().each(function() {
		$(this).width($(this).width());
	});
	return ui;
};



var addRow = function(tr) {
	var id;
	if (tr != undefined) {
		id = createTR(tr);
	} else {
		id = createTR();
	}
	
	var myRow = $template_row;
	var myHTML = "<tr id=" + id + ">" + myRow.html() + "</tr>";
	if ($("#time_sheet_table tbody tr:last").index() == -1) {
		console.log("hi");
		$("#time_sheet_table tbody").append(myHTML);
	} else {
		$("#time_sheet_table tbody tr:last").after(myHTML);
	}
	if (tr == undefined) {
		tr_map[id].updateProject();
	    updateProjectUI(tr_map[id]);
	    setupTRUI(tr_map[id]);
	} else {
		loadTRUI(tr);
	}
    
    // tr_map[id].updateTasks(master_user.projects[0].id);
}

// //delete a row from projects
var deleteRow = function(tr) {
	if (($("#time_sheet_table tbody tr:last").index() + 1) > 1) {
		if (current_time_tr == tr) {
			stopTimer(tr);
		}
		deleteTR(tr);
	} else {
		swal("You must have one or more projects on the timesheet", "", "error");
	}	
}

var timeoutFailure = function() {
	swal({
		title: "Page Timed Out. Please try again later.",
		type: "error"
	});
	$(".welcome").html("Timed out.");
}

var generalFailure = function() {
	swal({
		title: "Something went wrong. Please try again later.",
		type: "error"
	});
	$(".welcome").html("Something went wrong.");
}

var updateCalendar = function() {
	$("#event_table").empty();
	$("#event_table").append("<thead><th>Event</th><th>Time</th></thead>");
	$("#event_table").append("<tbody></tbody>");
	var date_selected = $(".calendar_date .datepicker").datepicker("getDate");
	var empty = true;; 
	for (var i = 0; i < master_user.events.length; i += 1) {
		var curr_event = master_user.events[i];
		if (date_selected.getDate() == curr_event.start.getDate()) {
			empty = false;
			var tr = "<tr>";
			tr += "<td>" + curr_event.name + "</td>";
			var start_hours = curr_event.start.getHours();
			var start_minutes = (curr_event.start.getMinutes() < 10) ? ("0" + curr_event.start.getMinutes()) : ("" + curr_event.start.getMinutes());
			var start_ampm = (start_hours < 12) ? "A.M." : "P.M.";
			start_hours = (start_hours % 12 == 0) ? 12 : start_hours % 12;

			var end_hours = curr_event.end.getHours() + "";
			var end_minutes = (curr_event.end.getMinutes() < 10) ? ("0" + curr_event.end.getMinutes()) : ("" + curr_event.end.getMinutes());
			var end_ampm = (end_hours < 12) ? "A.M." : "P.M.";
			end_hours = (end_hours % 12 == 0) ? 12 : end_hours % 12;

			var time_string = start_hours + ":" + start_minutes + " " + start_ampm + " - " + end_hours + ":" + end_minutes + " " + end_ampm;

			tr += "<td>" + time_string + "</td>";
			tr += "</tr>";
			$("#event_table tbody").append(tr);
		}
	}
	if (empty) {
		$("#event_table").empty();
		$("#event_table").append("<h5>No calendar events.</h5>");
	}
	// if (master_user.events.length == 0) {
	// 	$(".today").append("<h5>No events today on Google Calendar.</h5>");
	// }
}

var dateFormat = function(date) {
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
					"October", "November", "December"];
	return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate();
}

$('.selectpicker').selectpicker();

//intitializes tooltip
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

$(function() {
	$( ".datepicker" ).datepicker({ 
		minDate: -7, 
		maxDate: "+0M +0D", 
		showOn: "both", 
		defaultDate: +0,
		buttonImageOnly: true, 
		buttonImage: 'jquery-ui-1.11.4.custom/images/ui-icon-calendar.gif',
		dateFormat: 'DD, MM d'
	});
	$(".datepicker").datepicker('setDate', new Date());
});

