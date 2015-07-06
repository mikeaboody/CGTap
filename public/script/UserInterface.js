var updateProject = function(tr) {
	tr.$getJQuery().find(".projects select").empty();
	for (var i = 0; i < master_user.projects.length; i += 1) {
		var currProj = master_user.projects[i];
		
		if (i == 0) {
			tr.$getJQuery().find(".projects select").append("<option value='" + currProj.id + "' selected>" + currProj.name  + "</option>");
		} else {
			tr.$getJQuery().find(".projects select").append("<option value='" + currProj.id + "'>" + currProj.name  + "</option>");
		}
	}
	tr.$getJQuery().find(".projects select").on('change', function() {
   		tr.updateTasks($(this).val());
   		updateLabel();
	});
	tr.$getJQuery().find(".tasks select").on('change', function() {
   		updateLabel();
	});
	tr.$getJQuery().find(".payment select").on('change', function() {
   		updateLabel();
	});

	tr.$getJQuery().find(".hours").on('change', function() {
   		updateLabel();
	});

	tr.$getJQuery().find(".minutes").on('change', function() {
		var minutes = parseInt($(this).val(), 10);
		var format = minutes < 10 ? "0" + minutes : "" + minutes;
		$(this).val(format);
   		updateLabel();
	});

	tr.$getJQuery().find(".timer_button").on('click', function() {
		tr.switchTimer();
	});
	tr.$getJQuery().find(".deleteRow button").on('click', function() {
		deleteRow(tr);
	});
}

var updateTasks = function(tr, proj_id) {
	var success = function(data) {
		tr.$getJQuery().find(".tasks select").empty();

		for (var i = 0; i < data.length; i += 1) {
			var currTask = data[i];
			if (i == 0) {
				tr.$getJQuery().find(".tasks select").append("<option value='" + currTask.proj_task_id + "'> " + currTask.proj_task_nm  + "</option>");
			} else {
				tr.$getJQuery().find(".tasks select").append("<option value='" + currTask.proj_task_id + "'> " + currTask.proj_task_nm  + "</option>");
			}
		}
		tr.updateTimeType(proj_id);
	}
	COMMUNICATOR.getTasks(proj_id, success);
}

var updateTimeType = function(tr, proj_id) {
	var success = function(data) {
		tr.$getJQuery().find(".payment select").empty();
		for (var i = 0; i < data.length; i += 1) {
			var currTimeType = data[i];
			var includableTimeTypes = ["Billable", "Non-Billable", "Off-Hours Support", "On-Site Support", "Remote Support"];
			if ($.inArray(currTimeType.time_type_nm, includableTimeTypes) != -1) {
				if (i == 0) {
					tr.$getJQuery().find(".payment select").append("<option value='" + currTimeType.time_type_id + "'> " + currTimeType.time_type_nm + "</option>");
				} else {
					tr.$getJQuery().find(".payment select").append("<option value='" + currTimeType.time_type_id + "'> " + currTimeType.time_type_nm  + "</option>");
				}	
			}
		}
		updateLabel();
	}
	COMMUNICATOR.getTimeTypes(proj_id, success);
}


var updateLabel = function() {
	$(".welcome").html("Welcome " + master_user.first_name + "!");
	if ($(".content").is(":hidden")) {
		$(".content").show();
	}
	$('.selectpicker').selectpicker('refresh');
}

var switchTimer = function(tr) {
	var updateTimer = function() {
		current_time_tr.time += 1000;
		var hours = Math.floor(current_time_tr.time / (3600*1000));
		var minutes = Math.floor(current_time_tr.time / (60*1000)) % 60;
		var seconds = Math.floor(current_time_tr.time / 1000) % 60;
		var newLabel = ((hours < 10) ? ("0" + hours) : ("" + hours)) + ":"
						+ ((minutes < 10) ? ("0" + minutes) : ("" + minutes)) + ":"
						+ ((seconds < 10) ? ("0" + seconds) : ("" + seconds));
		current_time_tr.$getJQuery().find(".timer label").html(newLabel);
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
	current_time_tr.$getJQuery().find(".timer_button").html("Stop");
	current_time_tr.$getJQuery().find(".timer_button").toggleClass("btn-danger");
}

var stopTimer = function(tr) {
	clearInterval(tr_timer);
	tr_timer = null;
	current_time_tr = null;
	var hours = Math.floor(tr.time / (3600*1000));
	var minutes = Math.floor(tr.time / (60*1000)) % 60;
	tr.$getJQuery().find('input[name="minutes"]').val(minutes < 10 ? "0" + minutes : "" + minutes);
	tr.$getJQuery().find('input[name="hours"]').val(hours);
	updateLabel();
	tr.$getJQuery().find(".timer_button").html("Start");
	tr.$getJQuery().find(".timer_button").toggleClass("btn-danger");
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



var addRow = function() {
	var id = createTR();
	var myRow = $template_row;
	var myHTML = "<tr id=" + id + ">" + myRow.html() + "</tr>";
    $("#time_sheet_table tr:last").after(myHTML);
    tr_map[id].updateProject();
    tr_map[id].updateTasks(master_user.projects[0].id);
}

// //delete a row from projects
var deleteRow = function(tr) {
	if (($("#time_sheet_table tr:last").index() + 1) > 1) {
		if (current_time_tr == tr) {
			stopTimer(tr);
		}
		deleteTR(tr);
		updateLabel();
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
	$("#event_table").append("<thead><th>Event</th><th>Description</th><th>Time</th></thead>");
	$("#event_table").append("<tbody></tbody>");
	var date_selected = $(".calendar_date .datepicker").datepicker("getDate");
	var empty = true;; 
	for (var i = 0; i < master_user.events.length; i += 1) {
		var curr_event = master_user.events[i];
		if (date_selected.getDate() == curr_event.start.getDate()) {
			empty = false;
			var tr = "<tr>";
			tr += "<td>" + curr_event.name + "</td>";
			if (curr_event.description != undefined) {
				tr += "<td>" + curr_event.description + "</td>";
			} else {
				tr += "<td>No description.</td>";
			}
			
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

var setupHashtagSearch = function() {
	eventTags = [];
	for (var i = 0; i < master_user.events.length; i += 1) {
		eventTags.push(master_user.events[i].name);
	}
	$(function() {
	    $("#events").autocomplete({
	     	source: eventTags
	    });
  	});
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

