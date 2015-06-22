var submit = function() {
	var submitObj_list = [];
	for (var i = 0; i < ($("#time_sheet_table tr:last").index() + 1); i += 1) {
		submitObj_list.push(createSubmitObj(i));
	}
	postSubmitObjs(submitObj_list, function() {
		alert("You have submitted your hours!");
		reset();
	});
}

var createSubmitObj = function(index) {
	var submitObj = new Submittable();
	var $current_tr = $nthTR(index);
	var minutes = ($current_tr.find('input[name="minutes"]').val() == "") ? 0 : parseInt($current_tr.find('input[name="minutes"]').val(), 10);
	var hours = ($current_tr.find('input[name="hours"]').val() == "") ? 0 : parseInt($current_tr.find('input[name="hours"]').val(), 10);
	var post_hours = hours;
	if (minutes % 15 < 6) {
		post_hours += Math.floor(minutes / 15) / 4;
	} else {
		post_hours += Math.ceil(minutes / 15) / 4;
	}
	submitObj.email = Submittable.user.email;
	submitObj.first_name = Submittable.user.first_name;
	submitObj.last_name = Submittable.user.last_name;
	submitObj.project_id = $current_tr.find(".projects select option:selected").val();
	submitObj.task_id = $current_tr.find(".tasks select option:selected").val();
	submitObj.task_type = $current_tr.find(".payment select option:selected").val();
	submitObj.hours = post_hours;
	submitObj.date = (new Date()).getTime();
	submitObj.notes = $current_tr.find(".notes textarea").val();
	if (submitObj.hours > 0) {
		return submitObj;
	} else {
		return null;
	}
}

var postSubmitObjs = function(postObjs, success) {
	var i = 0;
	var next = function() {
		if (i < postObjs.length) {
			var postObj = postObjs[i];
			i += 1;
			COMMUNICATOR.postToDatabase(postObj, function() {
				delete postObj["first_name"];
				delete postObj["last_name"];
				if (postObj["notes"] == "") {
					delete postObj["notes"];
				}
				COMMUNICATOR.postToOpenAir(postObj, next, function() {
					console.log(postObj);
					console.log("failure");
				});
			});
		} else {
			success();
		}
	}
	next();
}

var reset = function() {
	$(".content").hide();
	$(".welcome").html("Loading...");
	$("#time_sheet_table tbody").empty();
	$("#time_sheet_table tbody").append("<tr>" + $template_row.html() + "</tr>");
	loadUserData();
}

