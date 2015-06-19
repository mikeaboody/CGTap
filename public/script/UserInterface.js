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
			//tested for in system:["Billable", "Company Holiday", "Non-Billable",
			// "Off-Hours Support", "On-Site Support", "Remote Support"]
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
	var minutes = 0;
	var hours = 0;
	$('input[name="minutes"]').each(function() {
		minutes += (($(this).val() == "") ? 0 : parseInt($(this).val(), 10));
	});
	$('input[name="hours"').each(function() {
		hours += ($(this).val() == "") ? 0 : parseInt($(this).val(), 10);
	})
	while (minutes >= 60) {
		hours += 1;
		minutes -= 60;
	}
	// var minutes = ($('input[name="minutes"]').val() == "") ? 0 : parseInt($('input[name="minutes"]').val(), 10);
	// var hours = ($('input[name="hours"]').val() == "") ? 0 : parseInt($('input[name="hours"]').val(), 10);
	var output = "You are submitting " + hours + ":" + ((minutes < 10) ? ("0" + minutes) : ("" + minutes))
				+ " hours for project " + $(".projects select option:selected").text() + " with task " +
				$(".tasks select option:selected").text() + " and payment type " + $(".payment select option:selected").text()
				+ "... Would you like to submit?";
	$(".output").text(output);
	if ($(".content").is(":hidden")) {
		$(".content").show();
	}
}

var switchTimer = function(row_index) {
	var updateTimer = function() {
		time[row_index] += 1000;
		var hours = Math.floor(time[row_index] / (3600*1000));
		var minutes = Math.floor(time[row_index] / (60*1000)) % 60;
		var seconds = Math.floor(time[row_index] / 1000) % 60;
		var newLabel = ((hours < 10) ? ("0" + hours) : ("" + hours)) + ":"
						+ ((minutes < 10) ? ("0" + minutes) : ("" + minutes)) + ":"
						+ ((seconds < 10) ? ("0" + seconds) : ("" + seconds));
		$nthTR(row_index).find(".timer label").html(newLabel);
	}

	if (timer[row_index] == null) { //just starting the timer
		timer[row_index] = setInterval(updateTimer, 1000);
	} else { //stopping the timer
		clearInterval(timer[row_index]);
		timer[row_index] = null;
		var hours = Math.floor(time[row_index] / (3600*1000));
		var minutes = Math.floor(time[row_index] / (60*1000)) % 60;
		$nthTR(row_index).find('input[name="minutes"]').val(minutes);
		$nthTR(row_index).find('input[name="hours"]').val(hours);
		updateLabel();
	}
	if ($nthTR(row_index).find(".timer_button").html() == "Start") {
		$nthTR(row_index).find(".timer_button").html("Stop");
	} else {
		$nthTR(row_index).find(".timer_button").html("Start");
	}

}

var redirectToTimesheet = function() {
	var url = "/display?email=" + master_email;
	window.location.replace(url);
	window.location.href = url;
}

var $nthTR = function(n) {
	return $("tbody tr:nth-child(" + (n + 1) + ")");
}

// //allow projects to be sortable
$("#table-responsive" ).click(function() {
    $("#table-responsive" ).sortable();
    $("#table-responsive" ).disableSelection();
});


var addRow = function() {
	var myRow = $template_row;
	var myHTML = "<tr>" + myRow.html() + "</tr>"
    $("#time_sheet_table tr:last").after(myHTML);
    var last_tr_index = $("#time_sheet_table tr:last").index();
    updateProject(last_tr_index);
    updateTasks(last_tr_index, master_user.projects[0].id);
    time.push(0);
    timer.push(null);
}

// //delete a row from projects
var deleteRow = function(row_index) {
	if (($("#time_sheet_table tr:last").index() + 1) > 1) {
		time.splice(row_index, 1);
		clearInterval(timer[row_index]);
		timer.splice(row_index, 1);
		// $nthTR(row_index).find(".deleteRow button").off('click');
		$nthTR(row_index).remove();
		updateLabel();
	} else {
		alert("You must have one or more projects on the timesheet");
	}
	
}







//intitializes tooltip
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
