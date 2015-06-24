var updateProject = function(row_index) {
	$nthTR(row_index).find(".projects select").empty();
	for (var i = 0; i < master_user.projects.length; i += 1) {
		var currProj = master_user.projects[i];
		
		if (i == 0) {
			$nthTR(row_index).find(".projects select").append("<option value='" + currProj.id + "' selected>" + currProj.name  + "</option>");
		} else {
			$nthTR(row_index).find(".projects select").append("<option value='" + currProj.id + "'>" + currProj.name  + "</option>");
		}
	}
	$nthTR(row_index).find(".projects select").on('change', function() {
   		updateTasks($(this).closest("tr").index(), $(this).val());
   		updateLabel();
	});
	$nthTR(row_index).find(".tasks select").on('change', function() {
   		updateLabel();
	});
	$nthTR(row_index).find(".payment select").on('change', function() {
   		updateLabel();
	});

	$nthTR(row_index).find(".hours").on('change', function() {
   		updateLabel();
	});

	$nthTR(row_index).find(".minutes").on('change', function() {
   		updateLabel();
	});

	$nthTR(row_index).find(".timer_button").on('click', function() {
		switchTimer($(this).closest("tr").index());
	});
	$nthTR(row_index).find(".deleteRow button").on('click', function() {
		deleteRow($(this).closest("tr").index());
	});
}

var updateTasks = function(row_index, proj_id) {
	var success = function(data) {
		$nthTR(row_index).find(".tasks select").empty();

		for (var i = 0; i < data.length; i += 1) {
			var currTask = data[i];
			if (i == 0) {
				$nthTR(row_index).find(".tasks select").append("<option value='" + currTask.proj_task_id + "'> " + currTask.proj_task_nm  + "</option>");
			} else {
				$nthTR(row_index).find(".tasks select").append("<option value='" + currTask.proj_task_id + "'> " + currTask.proj_task_nm  + "</option>");
			}
		}
		updateTimeType(row_index, proj_id);
	}
	COMMUNICATOR.getTasks(proj_id, success);
}

var updateTimeType = function(row_index, proj_id) {
	var success = function(data) {
		$nthTR(row_index).find(".payment select").empty();
		for (var i = 0; i < data.length; i += 1) {
			var currTimeType = data[i];
			var includableTimeTypes = ["Billable", "Non-Billable", "Off-Hours Support", "On-Site Support", "Remote Support"];
			if ($.inArray(currTimeType.time_type_nm, includableTimeTypes) != -1) {
				if (i == 0) {
					$nthTR(row_index).find(".payment select").append("<option value='" + currTimeType.time_type_id + "'> " + currTimeType.time_type_nm + "</option>");
				} else {
					$nthTR(row_index).find(".payment select").append("<option value='" + currTimeType.time_type_id + "'> " + currTimeType.time_type_nm  + "</option>");
				}	
			}
		}
		updateLabel();
	}
	COMMUNICATOR.getTimeTypes(proj_id, success);
}


var updateLabel = function() {
	if ($(".content").is(":hidden")) {
		$(".content").show();
	}
	$('.selectpicker').selectpicker('refresh');
}

var switchTimer = function(row_index) {
	var updateTimer = function() {
		time[current_time_index] += 1000;
		var hours = Math.floor(time[current_time_index] / (3600*1000));
		var minutes = Math.floor(time[current_time_index] / (60*1000)) % 60;
		var seconds = Math.floor(time[current_time_index] / 1000) % 60;
		var newLabel = ((hours < 10) ? ("0" + hours) : ("" + hours)) + ":"
						+ ((minutes < 10) ? ("0" + minutes) : ("" + minutes)) + ":"
						+ ((seconds < 10) ? ("0" + seconds) : ("" + seconds));
		$nthTR(current_time_index).find(".timer label").html(newLabel);
	}

	if (timer == null) { //just starting the timer
		startTimer(row_index, updateTimer);
	} else { //stopping the timer
		if (current_time_index == row_index) {
			stopTimer(row_index);
		} else {
			stopTimer(current_time_index);
			startTimer(row_index, updateTimer);
		}
	}
}

var startTimer = function(index, action) {
	timer = setInterval(action, 1000);
	current_time_index = index;
	$nthTR(index).find(".timer_button").html("Stop");
	$nthTR(index).find(".timer_button").toggleClass("btn-danger");
}

var stopTimer = function(index) {
	clearInterval(timer);
	timer = null;
	current_time_index = null;
	var hours = Math.floor(time[index] / (3600*1000));
	var minutes = Math.floor(time[index] / (60*1000)) % 60;
	$nthTR(index).find('input[name="minutes"]').val(minutes);
	$nthTR(index).find('input[name="hours"]').val(hours);
	updateLabel();
	$nthTR(index).find(".timer_button").html("Start");
	$nthTR(index).find(".timer_button").toggleClass("btn-danger");
}

var redirectToTimesheet = function() {
	var url = "/display?email=" + master_email;
	window.location.replace(url);
	window.location.href = url;
}

var $nthTR = function(n) {
	return $("#time_sheet_table tbody tr:nth-child(" + (n + 1) + ")");
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
	var myRow = $template_row;
	var myHTML = "<tr>" + myRow.html() + "</tr>"
    $("#time_sheet_table tr:last").after(myHTML);
    var last_tr_index = $("#time_sheet_table tr:last").index();
    updateProject(last_tr_index);
    updateTasks(last_tr_index, master_user.projects[0].id);
    time.push(0);
}

// //delete a row from projects
var deleteRow = function(row_index) {
	if (($("#time_sheet_table tr:last").index() + 1) > 1) {
		time.splice(row_index, 1);
		if (current_time_index > row_index) {
			current_time_index -= 1;
		} else if (current_time_index == row_index) {
			stopTimer(row_index);
		}
		$nthTR(row_index).remove();
		updateLabel();
	} else {
		swal("You must have one or more projects on the timesheet", "", "error");
	}
	
}

$('.selectpicker').selectpicker();

//intitializes tooltip
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

