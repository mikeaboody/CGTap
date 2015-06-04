function user(first_name, last_name, email) {
	this.first_name = first_name;
	this.last_name = last_name;
	this.email = email;
	this.projects = [];
	this.setProjects = function(lst) {
		this.projects = lst;
	}

};
function project(name, id) {
	this.name = name;
	this.id = id;
};

function submittable() {
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

var randomUser;
var submitObj;

var load = function() {
	$.when(
    	$.getJSON("https://cgp-api.controlgroup.com/employees", function(data) {
			var personObj = data[randomNumber(0, data.length)];
			randomUser = new user(personObj.first_nm, personObj.last_nm, personObj.email);
			submitObj = new submittable();
			submitObj.user_email = randomUser.email;
    	})
	).then(function() {
    	if (randomUser) {
        	$.when(
        		$.getJSON("https://cgp-api.controlgroup.com/timeentry/projectlist?id=" + randomUser.email, function(data) {
		        	var projectList = [];
		        	for(var i = 0; i < data.length; i += 1) {
		        		var currProj = data[i];
		        		var newProj = new project(currProj.proj_nm, currProj.proj_id);
		        		projectList.push(newProj);
		        	}
		        	randomUser.setProjects(projectList);
    			})
        	).then(function() {
        		if (randomUser.projects != []) {
        			updatePage();
        			updateTasks(randomUser.projects[0].id);
        			updateLabel();
    			} else {
        			document.write("failed task data");
    			}
        	});
		}
		else {
    		document.write("failed employee data");
		}
	});
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
				if (i == 0) {
					$(".payment select").append("<option value='" + currTimeType.time_type_id + "'> " + currTimeType.time_type_nm + "</option>");
				} else {
					$(".payment select").append("<option value='" + currTimeType.time_type_id + "'> " + currTimeType.time_type_nm  + "</option>");
				}
			}
		})
	).then(function() {
		// updateLabel();
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
				$(".tasks select option:selected").text() + " and payment type " + $(".payment select option:selected").text();
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
	alert(JSON.stringify(submitObj));
}

$(document).ready(function() {
	load();
});
