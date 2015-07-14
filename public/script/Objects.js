var master_user = null;
var tr_timer = null;
var base = "https://cgp-api.controlgroup.com";
var $template_row = null;
var tr_count = 0;
var tr_map = {};
var current_time_tr = null;

COMMUNICATOR = {
	recieveData: function(url, success, failure) {
		$.ajax({
	        type: "GET",
	        dataType: 'json',
	        url: url,
	        success: function(data, textStatus, jqXHR) {
	        	console.log(jqXHR);
	        	console.log(data);
	        	if (textStatus == "nocontent" || data == 0) {
	        		failure(jqXHR, textStatus, null);
	        	} else {
	        		success(data);
	        	}
	        },
	        timeout: 5000,
	        error: failure
		});
	},
	pushData: function(url, data, success, failure) {
		$.ajax({
	        data: data,
	        url: url,
	        timeout: 5000,
	        error: failure
		}).done(success);
	},
	getUser: function(success) {
		// $.getJSON(base + "/employees", success);
		this.recieveData(base + "/employees", success, this.requestError);
	},
	getProjects: function(success) {
		// $.getJSON(base + "/timeentry/projectlist?id=" + master_user.email, success);
		this.recieveData(base + "/timeentry/projectlist?id=" + master_user.email, success, this.requestError);
	},
	getTasks: function(proj_id, success) {
		// $.getJSON(base + "/timeentry/tasklist?id=" + proj_id, success);
		this.recieveData(base + "/timeentry/tasklist?id=" + proj_id, success, this.requestError);
	},
	getTimeTypes: function(proj_id, success) {
		// $.getJSON(base + "/timeentry/timetypelist?id=" + proj_id, success);
		this.recieveData(base + "/timeentry/timetypelist?id=" + proj_id, success, this.requestError);
	},
	postToDatabase: function(postObj, success) {
		// $.post("/submit", postObj, success, failure);
		this.pushData("/submit", postObj, success, this.requestError);
	},
	postToOpenAir: function(postObj, success) {
		// $.post(base + "/timeentry/submit", postObj, success, failure);
		this.pushData(base + "/timeentry/submit", postObj, success, this.requestError);
	},
	requestError: function(jqXHR, textStatus, errorThrown) {
		jqXHR.abort();
		if (textStatus == "timeout") {
			timeoutFailure();
		} else {
			generalFailure();
		}
	}
}

function User(first_name, last_name, email) {
	this.first_name = first_name;
	this.last_name = last_name;
	this.email = email;
	this.projects = {};
	this.events = [];
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
	this.minutes = 0;
	this.hours = 0;
	this.notes = "";
	this.currProjects = {};
	this.currTasks = {};
	this.currTaskTypes = {};
	this.currSelected = {};
	this.updateProject = function() {
		this.currProjects = master_user.projects;
	};
	this.updateTasks = function(proj_id) {
		var tr = this;
		displayLoadingTasks(this);
		var success = function(data) {
			tr.currTasks = {};
			for (var i = 0; i < data.length; i += 1) {
				tr.currTasks[data[i].proj_task_id] = data[i].proj_task_nm;
			}
			tr.updateTimeType(proj_id);
		}
		COMMUNICATOR.getTasks(proj_id, success);
		
	};
	this.updateTimeType = function(proj_id) {
		var tr = this;
		var success = function(data) {
			tr.currTaskTypes = {};
			for (var i = 0; i < data.length; i += 1) {
				var includableTimeTypes = ["Billable", "Non-Billable", "Off-Hours Support", "On-Site Support", "Remote Support"];
				if ($.inArray(data[i].time_type_nm, includableTimeTypes) != -1) {
					tr.currTaskTypes[data[i].time_type_id] = data[i].time_type_nm;
				}
			}
			tr.updateSelected();
		}
		displayLoadingTimeType(this);
		COMMUNICATOR.getTimeTypes(proj_id, success);	
	};
	this.updateManualTime = function() {
		this.minutes = (this.$minutesJQ().val() == "") ? 0 : parseInt(this.$minutesJQ().val(), 10);
		this.hours = (this.$hoursJQ().val() == "") ? 0 : parseInt(this.$hoursJQ().val(), 10);
		updateManualTime(this);
	};
	this.updateNotes = function() {
		this.notes = this.$notesJQ().val();
	}
	this.updateSelected = function() {
		if (this.$projectJQ().find("option:selected").val() != "") {
			this.currSelected["project"] = this.$projectJQ().find("option:selected").val();
		} else {
			delete this.currSelected["project"];
		}
		if (this.$taskJQ().find("option:selected").val() != "") {
			this.currSelected["task"] = this.$taskJQ().find("option:selected").val();
		} else {
			delete this.currSelected["task"];
		}
		if (this.$taskTypeJQ().find("option:selected").val() != "") {
			this.currSelected["time_type"] = this.$taskTypeJQ().find("option:selected").val();
		} else {
			delete this.currSelected["time_type"];
		}
	};
	this.switchTimer = function() {
		switchTimer(this);
	};
	this.createSubmitObj = function() {
		return createSubmitObj(this);
	};
	this.$getJQuery = function() {
		return $("#time_sheet_table tbody #" + this.id);
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
		return this.minutes;
	}
	this.getHours = function() {
		return this.hours;
	}
	this.getSelectedProjectName = function() {
		return this.currProjects[this.currSelected["project"]] || "Project";
	}
	this.getSelectedProjectID = function() {
		return this.currSelected["project"];
	}
	this.getSelectedTaskName = function() {
		return this.currTasks[this.currSelected["task"]] || "Task";
	}
	this.getSelectedTaskID = function() {
		return this.currSelected["task"];
	}
	this.getSelectedTaskTypeName = function() {
		return this.currTaskTypes[this.currSelected["time_type"]] || "Billing Type";
	}
	this.getSelectedTaskTypeID = function() {
		return this.currSelected["time_type"];
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
		return this.notes;
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


