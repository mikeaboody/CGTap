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
   		updateTasks($(".projects select").val());
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

var updateTasks = function(proj_id) {
	$.when(
		$.getJSON(base + "/timeentry/tasklist?id=" + proj_id, function(data) {
			$(".tasks select").empty();

			for (var i = 0; i < data.length; i += 1) {
				var currTask = data[i];
				if (i == 0) {
					$(".tasks select").append("<option value='" + currTask.proj_task_id + "'> " + currTask.proj_task_nm  + "</option>");
				} else {
					$(".tasks select").append("<option value='" + currTask.proj_task_id + "'> " + currTask.proj_task_nm  + "</option>");
				}
			}
		})
	).then(function() {
		updateTimeType(proj_id);
	});
}

var updateTimeType = function(proj_id) {
	$.when(
		$.getJSON(base + "/timeentry/timetypelist?id=" + proj_id, function(data) {
			$(".payment select").empty();
			for (var i = 0; i < data.length; i += 1) {
				var currTimeType = data[i];
				//tested for in system:["Billable", "Company Holiday", "Non-Billable",
				// "Off-Hours Support", "On-Site Support", "Remote Support"]
				var includableTimeTypes = ["Billable", "Non-Billable", "Off-Hours Support", "On-Site Support", "Remote Support"];
				console.log(currTimeType.time_type_nm);
				console.log($.inArray(currTimeType.time_type_nm, includableTimeTypes));
				if ($.inArray(currTimeType.time_type_nm, includableTimeTypes) != -1) {
					if (i == 0) {
						$(".payment select").append("<option value='" + currTimeType.time_type_id + "'> " + currTimeType.time_type_nm + "</option>");
					} else {
						$(".payment select").append("<option value='" + currTimeType.time_type_id + "'> " + currTimeType.time_type_nm  + "</option>");
					}	
				}
				
			}
		})
	).then(function() {
		updateLabel();
	});
}


var updateLabel = function() {
	var minutes = ($('input[name="minutes"]').val() == "") ? 0 : parseInt($('input[name="minutes"]').val(), 10);
	var hours = ($('input[name="hours"]').val() == "") ? 0 : parseInt($('input[name="hours"]').val(), 10);
	var output = "You are submitting " + hours + ":" + ((minutes < 10) ? ("0" + minutes) : ("" + minutes))
				+ " hours for project " + $(".projects select option:selected").text() + " with task " +
				$(".tasks select option:selected").text() + " and payment type " + $(".payment select option:selected").text()
				+ "... Would you like to submit?";
	$(".output").text(output);
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

	if (timer == null) {
		timer = setInterval(updateTimer, 1000);
	} else {
		clearInterval(timer);
		timer = null;
		var hours = Math.floor(time / (3600*1000));
		var minutes = Math.floor(time / (60*1000)) % 60;
		$('input[name="minutes"]').val(minutes);
		$('input[name="hours"]').val(hours);
		updateLabel();
	}

}
