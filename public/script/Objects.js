var master_user = null;
var tr_timer = null;
var base = "https://cgp-api.controlgroup.com";
var $template_row = null;
var tr_count = 0;
var tr_map = {};
var current_time_tr = null;

COMMUNICATOR = {
	getUser: function(success) {
		// $.getJSON(base + "/employees", success);
		$.ajax({
	        type: "GET",
	        dataType: 'json',
	        url: base + "/employees",
	        success: success,
	        timeout: 5000,
	        error: function(jqXHR, textStatus, errorThrown) {
	        	if (textStatus == "timeout") {
	        		timeoutFailure();
	        	} else {
	        		console.log(errorThrown);
	        		generalFailure();
	        	}
	        }
		});
	},
	getProjects: function(success) {
		// $.getJSON(base + "/timeentry/projectlist?id=" + master_user.email, success);
		$.ajax({
	        type: "GET",
	        dataType: 'json',
	        url: base + "/timeentry/projectlist?id=" + master_user.email,
	        success: success,
	        timeout: 5000,
	        error: function(jqXHR, textStatus, errorThrown) {
	        	if (textStatus == "timeout") {
	        		timeoutFailure();
	        	} else {
	        		generalFailure();
	        	}
	        }
		});
	},
	getTasks: function(proj_id, success) {
		// $.getJSON(base + "/timeentry/tasklist?id=" + proj_id, success);
		$.ajax({
	        type: "GET",
	        dataType: 'json',
	        url: base + "/timeentry/tasklist?id=" + proj_id,
	        success: success,
	        timeout: 5000,
	        error: function(jqXHR, textStatus, errorThrown) {
	        	if (textStatus == "timeout") {
	        		timeoutFailure();
	        	} else {
	        		generalFailure();
	        	}
	        }
		});
	},
	getTimeTypes: function(proj_id, success) {
		// $.getJSON(base + "/timeentry/timetypelist?id=" + proj_id, success);
		$.ajax({
	        type: "GET",
	        dataType: 'json',
	        url: base + "/timeentry/timetypelist?id=" + proj_id,
	        success: success,
	        timeout: 5000,
	        error: function(jqXHR, textStatus, errorThrown) {
	        	if (textStatus == "timeout") {
	        		timeoutFailure();
	        	} else {
	        		generalFailure();
	        	}
	        }
		});
	},
	postToDatabase: function(postObj, success) {
		// $.post("/submit", postObj, success, failure);
		$.ajax({
	        type: "POST",
	        data: postObj,
	        url: "/submit",
	        timeout: 5000,
	        error: function(jqXHR, textStatus, errorThrown) {
	        	jqXHR.abort();
	        	if (textStatus == "timeout") {
	        		timeoutFailure();
	        	} else {
	        		generalFailure();
	        	}
	        }
		}).done(success);
	},
	postToOpenAir: function(postObj, success) {
		// $.post(base + "/timeentry/submit", postObj, success, failure);
		$.ajax({
	        type: "POST",
	        data: postObj,
	        url: base + "/timeentry/submit",
	        timeout: 5000,
	        error: function(jqXHR, textStatus, errorThrown) {
	        	jqXHR.abort();
	        	if (textStatus == "timeout") {
	        		timeoutFailure();
	        	} else {
	        		generalFailure();
	        	}
	        }
		}).done(function() {
			success();
			console.log("SENT");
		});
	}
}

function User(first_name, last_name, email) {
	this.first_name = first_name;
	this.last_name = last_name;
	this.email = email;
	this.projects = [];
	this.events = [];
	this.setProjects = function(lst) {
		this.projects = lst;
	}

};
function Project(name, id) {
	this.name = name;
	this.id = id;
};

function Submittable() {
	this.project_nm = "";
	this.project_id = 0;
	this.hours = 0;
	this.date = 0;
	this.task_nm = "";
	this.task_id = 0;
	this.task_type_nm = "";
	this.task_type = 0;
	this.notes = "";
}

function CalendarEvent(name, description, start, end) {
	this.name = name;
	this.description = description;
	this.start = start;
	this.end = end;
}

function TableRow(id) {
	this.id = id;
	this.time = 0;
	this.$getJQuery = function() {
		return $("#time_sheet_table tbody #" + this.id);
	};
	this.updateProject = function() {
		updateProject(this);
	};
	this.updateTasks = function(proj_id) {
		updateTasks(this, proj_id);
	};
	this.updateTimeType = function(proj_id) {
		updateTimeType(this, proj_id);
	};
	this.switchTimer = function() {
		switchTimer(this);
	};
	this.createSubmitObj = function() {
		return createSubmitObj(this);
	};
	this.$projectJQ = function() {
		return this.$getJQuery().find(".projects select");
	}
	this.$taskJQ = function() {
		return this.$getJQuery().find(".tasks select");
	}
	this.$taskTypeJQ = function() {
		return this.$getJQuery().find(".payment select");
	}
	this.$notesJQ = function() {
		return this.$getJQuery().find(".notes textarea");
	}
	this.$hoursJQ = function() {
		return this.$getJQuery().find(".hours");
	}
	this.$minutesJQ = function() {
		return this.$getJQuery().find(".minutes");
	}
	this.$timerButtonJQ = function() {
		return this.$getJQuery().find(".timer_button");
	}
	this.$deleteButtonJQ = function() {
		return this.$getJQuery().find(".deleteRow button");
	}
	this.$timerLabelJQ = function() {
		return this.$getJQuery().find(".timer label");
	}
	this.getMinutes = function() {
		return (this.$minutesJQ().val() == "") ? 0 : parseInt(this.$minutesJQ().val(), 10);
	}
	this.getHours = function() {
		return (this.$hoursJQ().val() == "") ? 0 : parseInt(this.$hoursJQ().val(), 10);
	}
	this.getProjectName = function() {
		return this.$projectJQ().find("option:selected").text();
	}
	this.getProjectID = function() {
		return this.$projectJQ().find("option:selected").val();
	}
	this.getTaskName = function() {
		return this.$taskJQ().find("option:selected").text();
	}
	this.getTaskID = function() {
		return this.$taskJQ().find("option:selected").val();
	}
	this.getTaskTypeName = function() {
		return this.$taskTypeJQ().find("option:selected").text();
	}
	this.getTaskTypeID = function() {
		return this.$taskTypeJQ().find("option:selected").val();
	}
	this.getConvertedHours = function() {
		var minutes = this.getMinutes();
		var hours = this.getHours();
		var convertedHours = hours;
		if (minutes % 15 < 6) {
			convertedHours += Math.floor(minutes / 15) / 4;
		} else {
			convertedHours += Math.ceil(minutes / 15) / 4;
		}
		return convertedHours;
	}
	this.getNotes = function() {
		return this.$notesJQ().val();
	}
}

function PastTimesheet(id, project_name, task_name, time_type, hours) {
	this.id = id;
	this.project_name = project_name;
	this.task_name = task_name;
	this.time_type = time_type;
	this.hours = hours;
}

var createTR = function() {
	var newTR = new TableRow(tr_count);
	tr_map[tr_count] = newTR;
	tr_count += 1;
	return newTR.id;
}

var deleteTR = function(tr) {
	tr.$getJQuery().remove();
	delete tr_map[tr.id];
}


