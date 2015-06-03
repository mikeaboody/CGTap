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


var randomNumber = function(start, end) { //not including end
	return Math.floor(Math.random() * (end - start) + start);
}

var randomUser;

var updateTasks = function(proj_id) {
	$.when(
		$.getJSON("https://cgp-api.controlgroup.com/timeentry/tasklist?id=" + proj_id, function(data) {
			$(".tasks").empty();
			$(".tasks").append("<select></select>");
			$(".tasks select").append("<section></section>");
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
		console.log(randomUser);
	});
}

var load = function() {
	$.when(
    	$.getJSON("https://cgp-api.controlgroup.com/employees", function(data) {
			var personObj = data[randomNumber(0, data.length)];
			randomUser = new user(personObj.first_nm, personObj.last_nm, personObj.email);
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
        			// document.write("First Name: " + randomUser.first_name + "<br>");
        			// document.write("Last Name: " + randomUser.last_name + "<br>");
        			// document.write("Email: " + randomUser.email + "<br>");
        			// document.write("<h1>Projects:</h1>");
        			// for (var i = 1; i <= randomUser.projects.length; i += 1) {
        			// 	document.write(i + ". " + randomUser.projects[i-1].name + "<br>");
        			// }
        			// //only handles first project's tasks for now
        			// document.write("<h1>Tasks of First Project</h1>");

        			
        			updatePage();
        			updateTasks(randomUser.projects[0].id);
        			console.log(randomUser);



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

	var $projects = $(".projects");
	for (var i = 0; i < randomUser.projects.length; i += 1) {
		var currProj = randomUser.projects[i];
		$projects.append("<div>");
		if (i == 0) {
			$projects.append("<input class = proj" + currProj.id + " type = 'radio' name = 'projectform' checked='checked' value = '"
				+ currProj.id + "'/>");
		} else {
			$projects.append("<input class = proj" + currProj.id + " type = 'radio' name = 'projectform' value = '"
				+ currProj.id + "'/>");
		}
		$projects.append("<label for='small'>" + (i + 1) + "</label>");
		$projects.append("<article><p>" + currProj.name + "</p></article>");
		$projects.append("</div>");
	}
	$('.projects input').on('change', function() {
   		console.log($('input[name=projectform]:checked', '.projects').val());
   		updateTasks($('input[name=projectform]:checked', '.projects').val());
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

$(document).ready(function() {
	load();
});