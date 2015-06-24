var master_user = null;
var timer = null;
var time = [0];
var base = "https://cgp-api-dev.controlgroup.com";
var $template_row = null;
var current_time_index = null;

COMMUNICATOR = {
	getUser: function(success) {
		$.getJSON(base + "/employees", success);
	},
	getProjects: function(success) {
		$.getJSON(base + "/timeentry/projectlist?id=" + master_user.email, success);
	},
	getTasks: function(proj_id, success) {
		$.getJSON(base + "/timeentry/tasklist?id=" + proj_id, success);
	},
	getTimeTypes: function(proj_id, success) {
		$.getJSON(base + "/timeentry/timetypelist?id=" + proj_id, success);
	},
	postToDatabase: function(postObj, success, failure) {
		$.post("/submit", postObj, success, failure);
	},
	postToOpenAir: function(postObj, success, failure) {
		$.post(base + "/timeentry/submit", postObj, success, failure);
	}
}

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
	this.project_id = 0;
	this.hours = 0;
	this.date = 0;
	this.task_id = 0;
	this.task_type = 0;
	this.notes = "";
}

function CalendarEvent(name, description, start, end) {
	this.name = name;
	this.description = description;
	this.start = start;
	this.end = end;
}

