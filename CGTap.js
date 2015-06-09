var randomUser;
var master_email;
var submitObj;
var timer;
var time = 0;

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
	this.user_email = "";
	this.proj_id = "";
	this.hours = 0;
	this.epoch_date = 0;
	this.task_id = 0;
	this.task_type = 0;
}


var randomNumber = function(start, end) { //not including end
	return Math.floor(Math.random() * (end - start) + start);
}



var load = function() {
	if (randomUser) {
    	$.when(
    		$.getJSON("https://cgp-api.controlgroup.com/timeentry/projectlist?id=" + randomUser.email, function(data) {
	        	var projectList = [];
	        	for(var i = 0; i < data.length; i += 1) {
	        		var currProj = data[i];
	        		var newProj = new Project(currProj.proj_nm, currProj.proj_id);
	        		projectList.push(newProj);
	        	}
	        	randomUser.setProjects(projectList);
			})
    	).then(function() {
    		if (randomUser.projects != []) {
    			updatePage();
    			updateTasks(randomUser.projects[0].id);
			} else {
    			document.write("failed task data");
			}
    	});
	}
}

var updatePage = function() {
	$(".welcome").html("Welcome " + randomUser.first_name + "!");

	$(".projects select").empty();
	for (var i = 0; i < randomUser.projects.length; i += 1) {
		var currProj = randomUser.projects[i];
		
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
		$.getJSON("https://cgp-api.controlgroup.com/timeentry/tasklist?id=" + proj_id, function(data) {
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
		$.getJSON("https://cgp-api.controlgroup.com/timeentry/timetypelist?id=" + proj_id, function(data) {
			$(".payment select").empty();
			for (var i = 0; i < data.length; i += 1) {
				var currTimeType = data[i];
				//tested for in system:["Billable", "Company Holiday", "Non-Billable",
				// "Off-Hours Support", "On-Site Support", "Remote Support"]
				var includableTimeTypes = ["Billable", "Non-Billable", "Off-Hours Support", "On-Site Support", "Remote Support"];
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
	submitObj.proj_id = $(".projects select option:selected").val();
	submitObj.task_id = $(".tasks select option:selected").val();
	submitObj.task_type = $(".payment select option:selected").val();
	var minutes = ($('input[name="minutes"]').val() == "") ? 0 : parseInt($('input[name="minutes"]').val(), 10);
	var hours = ($('input[name="hours"]').val() == "") ? 0 : parseInt($('input[name="hours"]').val(), 10);
	var post_hours = hours;
	if (minutes % 15 < 6) {
		post_hours += Math.floor(minutes / 15) / 4;
	} else {
		post_hours += Math.ceil(minutes / 15) / 4;
	}
	submitObj.hours = post_hours;
	submitObj.epoch_date = (new Date()).getTime();
	submitObj.user_email = "paul.gasbarra@controlgroup.com"; //for now
	console.log("SUBMITTING");
	alert("You've submitted your hours!");
	postRequest(submitObj);
}

var postRequest = function(submitObj) {
	var url = "https://cgp-api-dev.controlgroup.com/timeentry/submit?email=" + submitObj.user_email + "&project_id=" + submitObj.proj_id
	 		+ "&hours=" + submitObj.hours + "&date=" + submitObj.epoch_date + "&task_id=" + submitObj.task_id
	 		+ "&task_type=" + submitObj.task_type + "&zendesk_ticket=1";
	console.log(url);
	$.post(url, function(data) {
  		console.log(data);
	});
}

var switchTimer = function() {
	var updateTimer = function() {
		//update the timer with it
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
var setup = function() {
	master_email = $(".email_info").html();
	$.getJSON("https://cgp-api.controlgroup.com/employees", function(data) {
		var personObj = null;
		for (var i = 0; i < data.length; i += 1) {
			var currEmployee = data[i]
			if (currEmployee.email.toUpperCase() == master_email.toUpperCase()) {
				personObj = currEmployee;
				break;
			}
		}
		if (personObj == null) {
			$(document).empty();
			document.write("Error, no email " + master_email);
			return;
		}
		randomUser = new User(personObj.first_nm, personObj.last_nm, personObj.email);
		submitObj = new Submittable();
		submitObj.user_email = randomUser.email;
    	load();
	});

}
$(document).on('click', '#timer_button', function () {
	switchTimer();
	$("#timer_button").toggleClass('highlight');
});

$(document).ready(function() {
	setup();
});

