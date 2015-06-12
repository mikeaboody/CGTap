var master_user;
var submitObj;
var timer;
var time = 0;
var base = "https://cgp-api-dev.controlgroup.com";
master_email = "brian.forster@controlgroup.com" //for now

function User(first_name, last_name, email) {
	this.first_name = first_name;
	this.last_name = last_name;
	this.email = email;
	this.projects = [];
	this.setProjects = function(lst) {
		this.projects = lst;
	}

};
function Project(name, id) {
	this.name = name;
	this.id = id;
};

function Submittable() {
	this.user_email = null;
	this.first_name = null;
	this.last_name = null;
	this.proj_id = 0;
	this.hours = 0;
	this.epoch_date = 0;
	this.task_id = 0;
	this.task_type = 0;
}

var findEmployeeInfo = function(email, data) {
	for (var i = 0; i < data.length; i += 1) {
		if (data[i].email.toLowerCase() == email.toLowerCase()) {
			return [data[i].first_nm, data[i].last_nm, email];
		}
	}
	return null;
}

var setup = function() {
	var url = base + "/employees";
	$.when(
    	$.getJSON(url, function(data) {
			var personData = findEmployeeInfo(master_email, data);
			if (personData == null) {
				return;
			}
			master_user = new User(personData[0], personData[1], personData[2]);
			submitObj = new Submittable();
			submitObj.first_name = master_user.first_name;
			submitObj.last_name = master_user.last_name;
			submitObj.user_email = master_user.email;
    	})
	).then(function() {
    	loadUserData();
	});
}

var loadUserData = function() {
	if (master_user) {
    	$.when(
    		$.getJSON(base + "/timeentry/projectlist?id=" + master_user.email, function(data) {
	        	var projectList = [];
	        	for(var i = 0; i < data.length; i += 1) {
	        		var currProj = data[i];
	        		var newProj = new Project(currProj.proj_nm, currProj.proj_id);
	        		projectList.push(newProj);
	        	}
	        	master_user.setProjects(projectList);
			})
    	).then(function() {
    		if (master_user.projects != []) {
    			updatePage();
    			updateTasks(master_user.projects[0].id);
			} else {
    			document.write("failed task data");
			}
    	});
	}
	else {
		var $disconnect = $(".disconnect");
		$(".wrapper").empty();
		$(".wrapper").append("<p>Your email " + master_email + " was is not a valid ControlGroup email. </p>")
		$(".wrapper").append($disconnect);
	}
}

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

//currently unused
var asyncDataRetrieve = function(urls) {
	var i = 0;
	result = [];
	var next = function() {
		if (i < urls.length) {
			$.getJSON(urls[i], function(data) {
				result.push(data);
				i += 1;
				next();
			});
		}
	}
	next();
	return result;
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

var submit = function() {
	var minutes = ($('input[name="minutes"]').val() == "") ? 0 : parseInt($('input[name="minutes"]').val(), 10);
	var hours = ($('input[name="hours"]').val() == "") ? 0 : parseInt($('input[name="hours"]').val(), 10);
	var post_hours = hours;
	if (minutes % 15 < 6) {
		post_hours += Math.floor(minutes / 15) / 4;
	} else {
		post_hours += Math.ceil(minutes / 15) / 4;
	}
	if (post_hours > 0) {
		submitObj.proj_id = $(".projects select option:selected").val();
		submitObj.task_id = $(".tasks select option:selected").val();
		submitObj.task_type = $(".payment select option:selected").val();
		submitObj.hours = post_hours;
		submitObj.epoch_date = (new Date()).getTime();
		postRequest(submitObj);
		alert("You've submitted your hours!");
	} else {
		alert("You cannot submit time under 6 minutes!");
	}
}

var postRequest = function(submitObj) {
	var postObj = {email: submitObj.user_email, first_name: submitObj.first_name, last_name: submitObj.last_name, project_id: submitObj.proj_id, 
					hours: submitObj.hours, date: submitObj.epoch_date, task_id: submitObj.task_id, task_type: submitObj.task_type, zendesk_ticket: 1}
	var url = "/submit";
	$.post(url, postObj, function() {
		postToOpenAir();
	});
}

var postToOpenAir = function() {
	var postObj = {email: submitObj.user_email, project_id: submitObj.proj_id, hours: submitObj.hours, date: submitObj.epoch_date, 
					task_id: submitObj.task_id, task_type: submitObj.task_type, zendesk_ticket: 1}
	$.post(base + "/timeentry/submit", postObj);
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
$(document).on('click', '#timer_button', function () {
	switchTimer();
	$("#timer_button").toggleClass('highlight');
});
$(document).ready(function() {
	setup();
});
