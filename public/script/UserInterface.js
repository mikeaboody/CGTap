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
	return newLabel;
}

var switchTimer = function(tr) {
	var updateTimer = function() {
		current_time_tr.time += 1000;
		$(".bigTimerLabel h1").html(updateTimerLabelUI(tr));
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
	$(".bigTimerLabel h1").html(updateTimerLabelUI(tr));
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
	$(".bigTimerLabel h1").html("&nbsp;");
}

var redirectToTimesheet = function() {
	var url = "/display?email=" + master_email;
	window.location.replace(url);
	window.location.href = url;
}

// //allow projects to be sortable

 $(function() {
    $("#time_sheet_table tbody").sortable({
		helper:fixHelper,
		stop: function( event, ui ) {
			saveStorage();
		}
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

var addRowFromCalendar = function(calendarEvent) {
	var id = createTR();
	
	var myRow = $template_row;
	var myHTML = "<tr id=" + id + ">" + myRow.html() + "</tr>";
	if ($("#time_sheet_table tbody tr:last").index() == -1) {
		$("#time_sheet_table tbody").append(myHTML);
	} else {
		$("#time_sheet_table tbody tr:last").after(myHTML);
	}
	var total_minutes = Math.floor(calendarEvent.end.getTime() - calendarEvent.start.getTime()) / (60000);
	tr_map[id].hours = Math.floor(total_minutes / 60);
	tr_map[id].minutes = total_minutes % 60;
	tr_map[id].notes = calendarEvent.name;
	tr_map[id].updateProject();
	loadTRUI(tr_map[id]);
	saveStorage();
}

var addAllCalendarEvents = function() {
	var date_selected = $(".calendar_date .datepicker").datepicker("getDate");
	var keys = Object.keys(master_user.events).sort(function(a, b) {
		return master_user.events[a].start.getTime() - master_user.events[b].start.getTime();
	});
	for (var i = 0; i < keys.length; i += 1) {
		var k = keys[i];
		var calendarEvent = master_user.events[k];
		if (date_selected.getDate() == calendarEvent.start.getDate()) {
			addRowFromCalendar(calendarEvent);
		}
	}

}

// //delete a row from projects
var deleteRow = function(tr) {
	if (Object.keys(tr_map).length > 1) {
		if (current_time_tr == tr) {
			stopTimer(tr);
		}
		deleteTR(tr);
	} else {
		swal("Can't Delete Entry!", "You must have one or more projects on the timesheet.", "error");
	}	
}

var timeoutFailure = function() {
	swal({
		title: "Page Timed Out!",
		text: "Tap Time timed out. Try refreshing your browser (we'll try to save your progress) or try again later.",
		type: "error"
	});
	$(".welcome").html("Page Timed Out!");
}

var faultyDataFailure = function() {
	swal({
		title: "No Data Recieved!",
		text: "Tap Time didn't recieve any data from the server. Try refreshing your browser (we'll try to save your progress) or contact brian.forster@controlgroup.com if the problem persists.",
		type: "error"
	});
	$(".welcome").html("No Data Recieved!");
}

var generalNetworkFailure = function() {
	swal({
		title: "Oops!",
		text: "Tap Time experienced an error when trying to access the data. Are you sure you're on CG's wifi? If so, try refreshing your browser (we'll try to save your progress) or contact brian.forster@controlgroup.com if the problem persists.",
		type: "error"
	});
	$(".welcome").html("Oops!");
}

var unknownIfSentFailure = function() {
	setTimeout(function() {
		$(".welcome").html("Unable to Verify that Data was Sent!");
		swal({
			title: "Unable to Verify that Data was Sent!",
			text: "Tap Time didn't hear back from the database when trying to send your data to OpenAir. Please check OpenAir or refresh and view the progress bar to see if the data was correctly sent.",
			type: "error"
		});
	}, 500);	
}

var updateCalendar = function() {
	$("#event_table").empty();
	// $("#event_table").append("<thead><th>Event</th><th>Time</th></thead>");
	// $("#event_table").append("<tbody></tbody>");
	var date_selected = $(".calendar_date .datepicker").datepicker("getDate");
	var empty = true;
	// master_user.events.sort(function(a, b) {
	// 	return a.start.getTime() - b.start.getTime();
	// });
	var keys = Object.keys(master_user.events).sort(function(a, b) {
		return master_user.events[a].start.getTime() - master_user.events[b].start.getTime();
	});
	for (var i = 0; i < keys.length; i += 1) {
		var k = keys[i];
		var curr_event = master_user.events[k];
		if (date_selected.getDate() == curr_event.start.getDate()) {
			empty = false;
			var event_div = "<div id='" + k + "' draggable='true' ondragstart = 'drag(event)' class='event_div'>";
			var start_hours = curr_event.start.getHours();
			var start_minutes = (curr_event.start.getMinutes() < 10) ? ("0" + curr_event.start.getMinutes()) : ("" + curr_event.start.getMinutes());
			var start_ampm = (start_hours < 12) ? "A.M." : "P.M.";
			start_hours = (start_hours % 12 == 0) ? 12 : start_hours % 12;

			var end_hours = curr_event.end.getHours() + "";
			var end_minutes = (curr_event.end.getMinutes() < 10) ? ("0" + curr_event.end.getMinutes()) : ("" + curr_event.end.getMinutes());
			var end_ampm = (end_hours < 12) ? "A.M." : "P.M.";
			end_hours = (end_hours % 12 == 0) ? 12 : end_hours % 12;

			var time_string = start_hours + ":" + start_minutes + " " + start_ampm + " - " + end_hours + ":" + end_minutes + " " + end_ampm;

			event_div += "<div><b>" + time_string + "</b></div>";
			event_div += "<div>" + curr_event.name + "</div>";
			// if (curr_event.description != undefined) {
			// 	event_div += "<div class = 'description'>Description:<br>" + curr_event.description + "</div>";
			// }
			event_div += "<button class='btn btn-xs btn-default' aria-label='Add'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span></button></div>";
			$("#event_table").append(event_div);
		}
	}
	$(".event_div button").on("click", function() {
		var id = $(this).closest(".event_div").attr("id");
		var calendarEvent = master_user.events[id];
		addRowFromCalendar(calendarEvent);
	});

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

var drawProgressDonut = function() {
	$("#donutChart").empty();
  	donutChart.draw('#donutChart', createDonutData());
}

$('.selectpicker').selectpicker();

//intitializes tooltip
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

function allowDrop(event) {
	event.preventDefault();
}


function doDropUpdate(event) {
	event.preventDefault();
	var id = $(event.target).closest("tr").attr("id");
	var trToUpdate = tr_map[id];
	var calendarEvent = master_user.events[event.dataTransfer.getData("cal-event-data")];
	if (calendarEvent != undefined) {
		var total_minutes = Math.floor(calendarEvent.end.getTime() - calendarEvent.start.getTime()) / (60000);
		trToUpdate.minutes += total_minutes;
		trToUpdate.hours += Math.floor(trToUpdate.minutes / 60);
		trToUpdate.minutes %= 60;
		if (trToUpdate.notes != "") {
			trToUpdate.notes += ", ";
		}
		trToUpdate.notes += calendarEvent.name;
		updateManualTimeUI(trToUpdate);
		updateNotesUI(trToUpdate);
		saveStorage();
	}
}

function doDropAdd(event) {
	event.preventDefault();
	var calendarEvent = master_user.events[event.dataTransfer.getData("cal-event-data")];
	if (calendarEvent != undefined) {
		addRowFromCalendar(calendarEvent);
	}
	
}

function drag(event) {
	event.dataTransfer.setData("cal-event-data", event.target.id);

}

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

