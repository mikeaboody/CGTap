var setup = function() {
	var success = function(data) {
		var personData = findEmployeeInfo(master_email, data);
		if (personData != null) {
			master_user = new User(personData[0], personData[1], personData[2], personData[3]);
		} else {
			loadUserData();
			return;
		}
		Submittable.user = master_user;
		loadCalendarEvents();
		updateCalendar();
		setupJQuery();
		loadUserData();
	}
	$template_row = $("#time_sheet_table tbody tr:nth-child(1)").clone();
	COMMUNICATOR.getUser(success);
}

var setupJQuery = function() {
	$(".calendar_date input").on("change", function() {
			updateCalendar();
	});
	$(".addRow button").on("click", function() {
		addRow();
		saveStorage();
	});
	$('#nav-expander').on('click',function(e){
      e.preventDefault();
      $('body').toggleClass('nav-expanded');
      $('body').find('.content').toggleClass('shrink');
      $('body').find('.navbar').toggleClass('navshrink');
      $(".addRowFromCalendar").toggle();
      $(".panel-body .addallbtn").toggle();
    });
    $('#nav-close').on('click',function(e){
      e.preventDefault();
      $('body').removeClass('nav-expanded');
      $('body').find('.content').removeClass('shrink');
      $('body').find('.navbar').removeClass('navshrink');
      $(".addRowFromCalendar").hide();
      $(".panel-body .addallbtn").hide();
    });
    $(".submit_date input").on("change", function() {
    	$("#donut-chart").empty();
  		donutChart.draw('#donut-chart', createData());
    });
   //  $("#donut-chart").empty();
  	// donutChart.draw('#donut-chart', createData());
    $("#donut-chart").empty();
  	donutChart.draw('#donut-chart', createData());

}


var loadCalendarEvents = function() {
	var items = event_json["items"];
	for (var i = 0; i < items.length; i += 1) {
		var curr_event = items[i];
		if (curr_event["status"] != "cancelled") {
			master_user.events["cal-event-" + curr_event["id"]] = new CalendarEvent(curr_event["summary"], curr_event["description"], new Date(curr_event["start"]["dateTime"]), new Date(curr_event["end"]["dateTime"]));
		}
	}
}

var findEmployeeInfo = function(email, data) {
	for (var i = 0; i < data.length; i += 1) {
		if (data[i].email.toLowerCase() == email.toLowerCase()) {
			return [data[i].first_nm, data[i].last_nm, email, data[i].emp_id];
		}
	}
	return null;
}

var loadUserData = function() {
	if (master_user) {
    	var success = function(data) {
        	var unincluded_stage_names = ["pending closure", "complete", "canceled"];
        	for(var i = 0; i < data.length; i += 1) {
        		var currProj = data[i];
        		if ($.inArray(currProj.proj_stage_nm.toLowerCase(), unincluded_stage_names) == -1) {
        			master_user.projects[currProj.proj_id] = currProj.proj_nm;
        		}
        	}
        	storageVarName = "tap-id{" + master_user.id + "}-storage-data";
    		if (master_user.projects != {}) {
    			if(typeof(Storage) !== "undefined" && verifyValidStorage()) {
    				$("#time_sheet_table tbody").empty();
					var storageObj = JSON.parse(window.localStorage[storageVarName]);
					tr_count = storageObj.tr_count;
					if (storageObj.tr_map_keys != undefined) {
						tr_map_keys = storageObj.tr_map_keys
					} else {
						tr_map_keys = Object.keys(storageObj.tr_map);
					}
					console.log(tr_map_keys);
					for (var i = 0; i < tr_map_keys.length; i += 1) {
						var k = tr_map_keys[i];
						var oldTR = storageObj.tr_map[k];
						var newTR = new TableRow(k);
						newTR.time = oldTR.time;
						newTR.minutes = oldTR.minutes;
						newTR.hours = oldTR.hours;
						newTR.notes = oldTR.notes;
						newTR.currProjects = oldTR.currProjects;
						newTR.currTasks = oldTR.currTasks;
						newTR.currTaskTypes = oldTR.currTaskTypes;
						newTR.currSelected = oldTR.currSelected;
						// tr_map[k] = newTR;
						addRow(newTR);
					}
				} else {
	    			var first_tr = tr_map[createTR()];
	    			$("#time_sheet_table tbody tr:nth-child(1)").attr("id", first_tr.id);
	    			first_tr.updateProject();
	    			updateProjectUI(first_tr);
	    			setupTRUI(first_tr);
				}
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

var saveStorage = function() {
	var keys = [];
	for (var i = 0; i < ($("#time_sheet_table tbody tr:last").index() + 1); i += 1) {
		keys.push($("#time_sheet_table tbody tr:nth-child(" + (i + 1) + ")").attr("id"));
	}
	var obj = {
		tr_count: tr_count,
		tr_map: tr_map,
		tr_map_keys: keys
	};
	localStorage.setItem(storageVarName, JSON.stringify(obj));
}

var verifyValidStorage = function() {
	if (window.localStorage[storageVarName] != undefined) {
		var storageObj = JSON.parse(window.localStorage[storageVarName]);
		if (storageObj["tr_count"] != undefined && storageObj["tr_map"] != undefined && storageObj["tr_map_keys"] != undefined) {
			return true;
		}
	}
	window.localStorage.removeItem(storageVarName);
	return  false;
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
