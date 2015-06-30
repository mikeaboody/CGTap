var setup = function() {
	var success = function(data) {
		var personData = findEmployeeInfo(master_email, data);
		if (personData != null) {
			master_user = new User(personData[0], personData[1], personData[2]);
		} else {
			loadUserData();
			return;
		}
		Submittable.user = master_user;
		loadCalendarEvents();
		showCalendar();
		setupHashtagSearch();
		loadUserData();
	}
	$template_row = $("#time_sheet_table tbody tr:nth-child(1)").clone();
	COMMUNICATOR.getUser(success);
}

var loadCalendarEvents = function() {
	var items = event_json["items"];
	for (var i = 0; i < items.length; i += 1) {
		var curr_event = items[i];
		if (curr_event["status"] != "cancelled") {
			master_user.events.push(new CalendarEvent(curr_event["summary"], curr_event["description"], new Date(curr_event["start"]["dateTime"]), new Date(curr_event["end"]["dateTime"])));
		}
	}
}

var findEmployeeInfo = function(email, data) {
	for (var i = 0; i < data.length; i += 1) {
		if (data[i].email.toLowerCase() == email.toLowerCase()) {
			return [data[i].first_nm, data[i].last_nm, email];
		}
	}
	return null;
}

var loadUserData = function() {
	if (master_user) {
    	var success = function(data) {
        	var projectList = [];
        	var unincluded_stage_names = ["pending closure", "complete", "canceled"];
        	for(var i = 0; i < data.length; i += 1) {
        		var currProj = data[i];
        		if ($.inArray(currProj.proj_stage_nm.toLowerCase(), unincluded_stage_names) == -1) {
        			var newProj = new Project(currProj.proj_nm, currProj.proj_id);
        			projectList.push(newProj);
        		}
        	}
        	master_user.setProjects(projectList);
    		if (master_user.projects != []) {
    			createTR();
    			//assumes only one key in the tr_map
    			var first_tr = tr_map[Object.keys(tr_map)[0]];
    			$("#time_sheet_table tbody tr:nth-child(1)").attr("id", "" + first_tr.id);
    			first_tr.updateProject();
    			first_tr.updateTasks(master_user.projects[0].id);
			} else {
    			document.write("failed task data");
			}
		};
		COMMUNICATOR.getProjects(success);
	}
	else {
		$(".welcome").html("Invalid Control Group Email");
		$(".content").empty();
		$(".content").append("<p>Your email " + master_email + " is not a valid ControlGroup email. </p>");
		$(".content").show();
	}
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
