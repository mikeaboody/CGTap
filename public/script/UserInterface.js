var updatePage = function() {
	$(".welcome").html("Welcome " + master_user.first_name + "!");

	$(".projects select").empty();
	for (var i = 0; i < master_user.projects.length; i += 1) {
		var currProj = master_user.projects[i];
		
		if (i == 0) {
			$(".projects select").append("<option value='" + currProj.id + "' selected>" + currProj.name  + "</option>");
		} else {
			$(".projects select").append("<option value='" + currProj.id + "'>" + currProj.name  + "</option>");
		}
	}
	$('.projects select').on('change', function() {
   		updateTasks($(this).closest("tr").index(), $(this).val());
   		updateLabel();
	});
	$('.tasks select').on('change', function() {
   		updateLabel();
	});
	$('.payment select').on('change', function() {
   		updateLabel();
	});

	$('.hours').on('change', function() {
   		updateLabel();
	});

	$('.minutes').on('change', function() {
   		updateTasks($(".projects select").val());
   		updateLabel();
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
	var minutes = ($('input[name="minutes"]').val() == "") ? 0 : parseInt($('input[name="minutes"]').val(), 10);
	var hours = ($('input[name="hours"]').val() == "") ? 0 : parseInt($('input[name="hours"]').val(), 10);
	var output = "You are submitting " + hours + ":" + ((minutes < 10) ? ("0" + minutes) : ("" + minutes))
				+ " hours for project " + $(".projects select option:selected").text() + " with task " +
				$(".tasks select option:selected").text() + " and payment type " + $(".payment select option:selected").text()
				+ "... Would you like to submit?";
	$(".output").text(output);
	if ($(".content").is(":hidden")) {
		$(".content").show();
	}
}

var switchTimer = function() {
	var updateTimer = function() {
		time += 1000;
		var hours = Math.floor(time / (3600*1000));
		var minutes = Math.floor(time / (60*1000)) % 60;
		var seconds = Math.floor(time / 1000) % 60;
		var newLabel = ((hours < 10) ? ("0" + hours) : ("" + hours)) + ":"
						+ ((minutes < 10) ? ("0" + minutes) : ("" + minutes)) + ":"
						+ ((seconds < 10) ? ("0" + seconds) : ("" + seconds));
		$(".timer label").html(newLabel);
	}

	if (timer == null) { //just starting the timer
		timer = setInterval(updateTimer, 1000);
	} else { //stopping the timer
		clearInterval(timer);
		timer = null;
		var hours = Math.floor(time / (3600*1000));
		var minutes = Math.floor(time / (60*1000)) % 60;
		$('input[name="minutes"]').val(minutes);
		$('input[name="hours"]').val(hours);
		updateLabel();
	}
	if ($("#timer_button").html() == "Start") {
		$("#timer_button").html("Stop");
	} else {
		$("#timer_button").html("Start");
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
// $("#table-responsive" ).click(function() {
//     $("#table-responsive" ).sortable();
//     $("#table-responsive" ).disableSelection();
// });

//add a row to projects
// function addRow() {
// 	var table = document.getElementById("submission");
// 	var row = table.insertRow(0);
// 	row.innerHTML = "<tr></tr>";
// }
var addRow = function() {
	var myRow = "<tr><td>C</td><td>3</td></tr>";
            $("#time_sheet_table tr:last").after(myRow);
}

// //delete a row from projects

$('#delete-row').click( function() {		
		var tableID = "submission";
		var table = document.getElementById(tableID);
		var rowCount = table.rows.length;
		console.log(rowCount);
		if(rowCount != 1) {			
			rowCount = rowCount - 1;
			table.deleteRow(rowCount);
		}			
}); 

// $('.add-row').click(function () {
//     var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
//     $TABLE.find('table').append($clone);
// });

// //delete a row from projects
// $('.delete-row').click(function () {
//     $(this).parents('tr').detach();
// });

//intitializes tooltip
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
