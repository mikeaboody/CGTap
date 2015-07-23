var master_user = null;
var tr_timer = null;
var base = "https://cgp-api.controlgroup.com";
var $template_row = null;
var tr_count = 0;
var tr_map = {};
var current_time_tr = null;
var storageVarName = null;

COMMUNICATOR = {
	attempts: 0,
	timeout: 5000,
	recieveData: function(url, success) {
		console.log("CALLED: " + url);
		this.attempts += 1;
		communicator = this;
		$.ajax({
	        type: "GET",
	        dataType: 'json',
	        url: url,
	        success: function(data, textStatus, jqXHR) {
	        	console.log(jqXHR);
	        	console.log(data);
	        	if (data == 0) {
	        		communicator.requestError(jqXHR, "noapidata", null, {url: url, success: success});
	        	}
	        	else if (textStatus == "nocontent") {
	        		communicator.requestError(jqXHR, "timeout", null, {url: url, success: success});
	        	} else {
	        		communicator.attempts = 0;
	        		success(data);
	        	}
	        },
	        timeout: communicator.timeout,
	        error: function(jqXHR, textStatus, errorThrown) {
	        	communicator.requestError(jqXHR, textStatus, errorThrown, {url: url, success: success});
	        }
	        
		});
	},
	pushData: function(url, data, success) {
		console.log("CALLED: " + url);
		communicator = this;
		$.ajax({
	        data: data,
	        url: url,
	        timeout: communicator.timeout,
	        error: function(jqXHR, textStatus, errorThrown) {
	        	communicator.pushError(jqXHR, textStatus, errorThrown);
	        }
		}).done(function(data) {
			success(data);
		});
	},
	getUser: function(success) {
		this.recieveData(base + "/employees", success);
	},
	getProjects: function(success) {
		this.recieveData(base + "/timeentry/projectlist?id=" + master_user.email, success);
	},
	getTasks: function(proj_id, success) {
		this.recieveData(base + "/timeentry/tasklist?id=" + proj_id, success);
	},
	getTimeTypes: function(proj_id, success) {
		this.recieveData(base + "/timeentry/timetypelist?id=" + proj_id, success);
	},
	postToDatabase: function(postObj, success) {
		this.pushData("/submit", postObj, success);
	},
	postToOpenAir: function(postObj, success) {
		this.pushData(base + "/timeentry/submit", postObj, success);
	},
	requestError: function(jqXHR, textStatus, errorThrown, retryObj) {
		if (this.attempts > 1) {
			this.attempts = 0;
			jqXHR.abort();
			if (textStatus == "noapidata") {
				faultyDataFailure();
			}
			else if (textStatus == "timeout") {
				timeoutFailure();
			} else {
				generalNetworkFailure();
			}
		} else {
			this.recieveData(retryObj.url, retryObj.success);
		}
	},
	pushError: function(jqXHR, textStatus, errorThrown) {
		jqXHR.abort();
		unknownIfSentFailure();
	}
}

function User(first_name, last_name, email, id) {
	this.first_name = first_name;
	this.last_name = last_name;
	this.email = email;
	this.projects = {};
	this.events = {};
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
	this.updateTasks = function(proj_id, loading, success) {
		if (loading != undefined) {
			loading(this);
		}
		var tr = this;
		var afterRequest = function(data) {
			tr.currTasks = {};
			for (var i = 0; i < data.length; i += 1) {
				if (data[i].phase_task_nm != undefined) {
					tr.currTasks[data[i].proj_task_id] = data[i].phase_task_nm;
				} else {
					tr.currTasks[data[i].proj_task_id] = data[i].proj_task_nm;
				}	
			}
			if (success != undefined) {
				success();
			}
		}
		COMMUNICATOR.getTasks(proj_id, afterRequest);
		
	};
	this.updateTimeType = function(proj_id, loading, success) {
		if (loading != undefined) {
			loading(this);
		}
		var tr = this;
		var afterRequest = function(data) {
			tr.currTaskTypes = {};
			for (var i = 0; i < data.length; i += 1) {
				var includableTimeTypes = ["Billable", "Non-Billable", "Off-Hours Support", "On-Site Support", "Remote Support"];
				if ($.inArray(data[i].time_type_nm, includableTimeTypes) != -1) {
					tr.currTaskTypes[data[i].time_type_id] = data[i].time_type_nm;
				}
			}
			if (success != undefined) {
				success();
			}
		}
		COMMUNICATOR.getTimeTypes(proj_id, afterRequest);	
	};
	this.updateManualTime = function() {
		this.minutes = (this.$minutesJQ().val() == "") ? 0 : parseInt(this.$minutesJQ().val(), 10);
		this.hours = (this.$hoursJQ().val() == "") ? 0 : parseInt(this.$hoursJQ().val(), 10);
		updateManualTimeUI(this);
	};
	this.updateNotes = function() {
		this.notes = this.$notesJQ().val();
	}
	this.updateSelectedProject = function() {
		if (this.$projectJQ().find("option:selected").val() != "") {
			this.currSelected["project"] = this.$projectJQ().find("option:selected").val();
		} else {
			delete this.currSelected["project"];
		}
	};
	this.updateSelectedTask = function() {
		if (this.$taskJQ().find("option:selected").val() != "") {
			this.currSelected["task"] = this.$taskJQ().find("option:selected").val();
		} else {
			delete this.currSelected["task"];
		}
	};
	this.updateSelectedTimeType = function() {
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

function PastEntry(id, project_name, task_name, time_type, hours, date) {
	this.id = id;
	this.project_name = project_name;
	this.task_name = task_name;
	this.time_type = time_type;
	this.hours = hours;
	this.date = date;
}

var createTR = function(tr) {
	if (tr == undefined) {
		var newTR = new TableRow(tr_count + "");
		tr_map[tr_count] = newTR;
		tr_count += 1;
		return newTR.id;
	} else {
		var newTR = tr;
		tr_map[newTR.id] = newTR;
		return newTR.id;
	}	
}

var deleteTR = function(tr) {
	tr.$getJQuery().remove();
	delete tr_map[tr.id];
}


