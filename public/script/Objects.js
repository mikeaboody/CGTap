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
	this.notes = "";
}
