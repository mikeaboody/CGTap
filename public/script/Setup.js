var setup = function() {
	var success = function(data) {
		var personData = findEmployeeInfo(master_email, data);
		if (personData != null) {
			master_user = new User(personData[0], personData[1], personData[2]);
		}
		Submittable.user = master_user;
		loadUserData();
	}
	$template_row = $("tbody tr:nth-child(1)").clone();
	COMMUNICATOR.getUser(success);
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
    			$(".welcome").html("Welcome " + master_user.first_name + "!");
    			updateProject(0);
    			updateTasks(0, master_user.projects[0].id);
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

