/*var properties = {
  API_HOST: 'http://ec2-34-207-88-221.compute-1.amazonaws.com:8080',
  API_ROOT: '/MosquitoTM'
}*/
var properties = {
  API_HOST: 'http://localhost:8080/',
  API_ROOT: 'api/'
}
	function initAccordion(element) {
		var fileName = document.location.pathname.match(/[^\/]+$/)[0];
		console.log(fileName);
		var filter = element.id; //all, todo, doing, done
		
		var currentUserId = sessionStorage.getItem('userId');
		var query_url;
		
		if(fileName == 'my-projects.html'){ 
			query_url = properties.API_HOST + properties.API_ROOT + "projects/owner/" + currentUserId;
		}else if(fileName == 'all-projects.html'){
			query_url = properties.API_HOST + properties.API_ROOT + 'projects';
		}else if(fileName == 'my-work.html'){
			query_url = properties.API_HOST + properties.API_ROOT + 'tasks/workers-tasks/' + currentUserId;
		}else{
			query_url = properties.API_HOST + properties.API_ROOT + 'projects';
		}
		
		
		setStatusButtonStyleActive(element);	
		
		$.ajax({ 
		    'async': false,
		    type: 'GET', 
		    url: query_url,
		    headers: {"Authorization": sessionStorage.getItem('token')}, 
		    dataType: 'json',
		    success: function (data) {
		    	var tasks_status = $('#status-work-btn .status-btn-active').attr('id');
		    	data = filterTaskByStatus(tasks_status, data);
		         $('#accordionDiv').empty();
		        if(!Array.isArray(data) || data.length == 0){
		    		infoMsgNoTasks(fileName);
		    		return;
		    	}

		        $.each(data, function(index, element) {
		        	console.log(JSON.stringify(element));
		            $('#accordionDiv').append(
		            	generateAccordionDivContent(element)
		            );
		        });
		    },
		    error: function(xhr){
		    	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    default:
                    	infoMsgNoTasks(fileName);
                        break;
			}
		    }
		});
		reloadAccordion();
	}

	function infoMsgNoTasks(fileName){
		var info_message;
        if(fileName == 'my-work.html'){
            info_message = 'There are no tasks.';
        }else{
        	info_message = 'There are no projects.';
        }
        $("#accordionDiv").empty();
        $("#accordionDiv").append('<div class="alert alert-danger" role="alert"><strong>'+
            info_message +
        '</strong></div>');
	}

	function generateAccordionDivContent(element) {
		return '<div title="Click to expand" class="accordion row" id="' + (element.id == undefined ? element.taskId : element.id) + '">' + 
			            		'<div class="col-xs-12 col-md-6">' +
			            			'<span style="display:inline-block;">' + (element.name == undefined ? element.taskName : element.name) + '</span>' +
			            		'</div>' +
			            		 generateProgressBar(element) + 
			            		'<div class="col-xs-12 col-md-4">' + 
			            		'<button id="taskDetails-'+ (element.id == undefined ? element.taskId : element.id) +'" type="button" title="" class="btn ditails-btn taskDitails">View details</button>' +
			            		'<button data-id="'+ (element.id == undefined ? element.taskId : element.id) +'" class="btn add-task-btn" data-toggle="modal" data-target="#myTaskCreateModal">Add task <i class="fas fa-plus"></i></button>' +
			            		'</div>' +
			            		'<div class="col-md-1">' +
			            		'<i class="fas fa-trash align-bottom delete-btn" title="Click to delete" id="delete-'+ (element.id == undefined ? element.taskId : element.id) +'"></i>' +
			            		'</div>' +  
			            	'</div>' +	
			            	'<div class="panel"></div>';
	}
								
	$(document).on('click', '.taskDitails', function(event){
		event.stopImmediatePropagation();
		var taskId = event.target.id.split('-')[1];
		getTaskDetails(taskId);
	});


	function generateProgressBar(task){
		/*if(task.estimation == undefined){
			return '<div class="col-xs-12 col-md-1"></div>';
		}*/

		if(task.estimation != undefined && task.estimation.timeEstimation != undefined && task.estimation.remaining != undefined 
			&& task.estimation.timeEstimation != 0 && task.estimation.remaining != 0){
			var estimationTime = task.estimation.timeEstimation;
			var remaining = task.estimation.remaining;
			var donePersent = 100 - Math.round(remaining/estimationTime*100);
			var roundTo10done = ((donePersent % 10 > 4) ? (donePersent - donePersent % 10 + 10) : (donePersent - donePersent % 10));
			if(donePersent < 0){
				donePersent = 100;
				roundTo10done = 100;
			}
		}else{
			var donePersent = 0;
			var roundTo10done = 0;
		}
		return '<div class="col-xs-12 col-md-1"><div class="progress" data-percentage="' + roundTo10done + '">' +
									'<span class="progress-left">' +
									'<span class="progress-bar"></span></span>' +
									'<span class="progress-right">' +
									'<span class="progress-bar"></span>' + 
									'</span>' +
									'<div class="progress-value">' +
									'<div>' +
									(donePersent == 100 ? '' : donePersent + '%<br>') + 
									'<span class="progressbar-title">Done</span>' +
									
									'</div></div></div></div>';
		
	}

	$(document).on('click','.delete-btn', function(event){
			event.stopImmediatePropagation();
			var taskId = $(this).attr('id').split('-')[1];

			$.ajax({ 
				    'async': true,
				    type: 'DELETE', 
				    headers: {"Authorization": sessionStorage.getItem('token')}, 
				    url: properties.API_HOST + properties.API_ROOT + 'tasks/' + taskId, 
				    dataType: 'json',
				    success: function (data) {
				    	$('#' + taskId).remove();
				    }
				});
			
	});

	function reloadAccordion(){
		var acc = document.getElementsByClassName("accordion");
		for (var i = 0; i < acc.length; i++) {
			acc[i].setAttribute( "onClick", "getNextAccLevel(event, this)");
		}
	};

	function getNextAccLevel(event, currentAccordionDivButton){
		if(event.toElement.tagName == 'BUTTON') // if Button (not Div) was clicked
			return;

		currentAccordionDivButton.classList.toggle("active");	// add/delete "active" class
		var panel = currentAccordionDivButton.nextElementSibling; 
	    
		if(currentAccordionDivButton.classList.contains("active")) {
			$.ajax({ 
			    'async': false,
			    type: 'GET', 
			    headers: {"Authorization": sessionStorage.getItem('token')}, 
			    url: properties.API_HOST + properties.API_ROOT + 'tasks/'+ currentAccordionDivButton.id + '/sub-tasks', 
			    dataType: 'json',
			    success: function (data) {
			    	var tasks_status = $('#status-work-btn .status-btn-active').attr('id');
			    	data = filterTaskByStatus(tasks_status, data); 

			    	$.each(data, function(index, element) {
			    		console.log("Name: " + element.id + " status: " + element.status.title);
			            panel.innerHTML = panel.innerHTML +
			            	generateAccordionDivContent(element);
			        });
			    }
			});
			panel.style.maxHeight = 'none';
			reloadAccordion();
	    }
		else {
			panel.innerHTML = '';
		}
	}

	function filterTaskByStatus(statusTitle, data){
		if(statusTitle === 'all') return data;
		var filteredTasks = [];

		// for TaskMongo
		if(data.length > 0 && data[0].status == undefined){
			for(var i = 0; i < data.length; i++){
				$.ajax({ 
				    'async': false,
				    type: 'GET', 
				    headers: {"Authorization": sessionStorage.getItem('token')}, 
				    url: properties.API_HOST + properties.API_ROOT + 'tasks/'+ (data[i].id == undefined ? data[i].taskId : data[i].id), 
				    dataType: 'json',
				    success: function (task) {
				    	if(statusTitle === 'done' && task.status === 'DONE'){
				    		filteredTasks.push(data[i]);
				    	}else if(statusTitle === 'todo' && task.status === 'TODO'){
				    		filteredTasks.push(data[i]);
				    	}else if(statusTitle === 'doing' && task.status === 'DOING'){
				    		filteredTasks.push(data[i]);
				    	}
				    }
				});
			}
			return filteredTasks;
		}


		if(statusTitle === 'done'){
			for(var i = 0; i < data.length; i++){
				if(data[i].status.title === 'DONE'){
					filteredTasks.push(data[i]);
				}
			}
			return filteredTasks;
		}else if(statusTitle === 'todo'){
			for(var i = 0; i < data.length; i++){
				if(data[i].status.title === 'TODO'){
					filteredTasks.push(data[i]);
				}
			}
			return filteredTasks;
		}else if(statusTitle === 'doing'){
			for(var i = 0; i < data.length; i++){
				if(data[i].status.title === 'DOING'){
					filteredTasks.push(data[i]);
				}
			}
			return filteredTasks;
		}
		return data;
	}
	

	/*
	Details
	*/
	function getTaskDetails(taskId) {
		clearTaskDetails();
		sessionStorage['currentTaskId'] = taskId;
		$.ajax({ 
			    'async': false,
			    type: 'GET', 
			    url: properties.API_HOST + properties.API_ROOT + "tasks/" + taskId, 
			    dataType: 'json',
			    headers: {"Authorization": sessionStorage.getItem('token')},
			    success: function (data) {
			    	sessionStorage['currentEstimationId'] = data.estimation.id;
			    
			    	// Get worker
			    	console.log("MY: " + JSON.stringify(data));
			    	var worker;
			    	$.ajax({ 
					    'async': false,
					    type: 'GET', 
					    url: properties.API_HOST + properties.API_ROOT + "users/" + data.workerId, 
					    dataType: 'json',
					    headers: {"Authorization": sessionStorage.getItem('token')},
					    success: function (data) {
					    	worker = data.firstName + ' ' + data.lastName;
					 	}
					}); 

			    	var loggedTime = 0;
					$.ajax({ 
				        'async': false,
				        type: 'GET', 
				        url: properties.API_HOST + properties.API_ROOT + 'log-work/by-est/' + data.estimation.id,
				        headers: {"Authorization": sessionStorage.getItem('token')},
				        dataType: 'json',
				        success: function (data) { 
				            $.each(data, function(index, element) {
				                loggedTime+=element.logged;
				            });
				        }
				    });


			    	$('#projectDetailsModal').modal('show');
					
					$('#details-name').append(data.name);
			    	$('#details-assignee').append(worker);
			    	$('#details-estimation').append(data.estimation.timeEstimation);
			   		$('#details-logged').append(loggedTime);
			   		$('#details-priority').append(data.priority.title);
			   		$('#details-status').append(data.status.title);
			   		$('#details-remaining').append(data.estimation.remaining);		
			    },
			    error:function (xhr, ajaxOptions, thrownError){
			    	alert('Server connection error...');
			    }
			});
	}

	function clearTaskDetails() {
		$('#details-name').empty();
    	$('#details-assignee').empty();
    	$('#details-estimation').empty();
   		$('#details-logged').empty();
   		$('#details-priority').empty();
   		$('#details-status').empty();
   		$('#details-remaining').empty();
	}

	function setStatusButtonStyleActive(element) {
		var lastActiveButton = document.getElementsByClassName("status-btn-active")[0];
		if(lastActiveButton != undefined) {		
			lastActiveButton.classList.remove("status-btn-active");
		}
		$('#' + element.id).addClass('status-btn-active');
	}



/*
Details. Add Log work
*/
 $(document).on('click', '#add-logwork-btn', function(event){
 	event.stopImmediatePropagation();
 	closeAnotherDetailsBlock('#log-work-block'); 
 	$('#log-work-block').removeClass('d-none');
 	$('#add-logwork-btn').addClass('d-none');
 });

 $(document).on('click', '#cancel-add-log-work-btn', function(event){
 	event.stopImmediatePropagation();
 	$('#log-work-block').addClass('d-none');
 	$('#add-logwork-btn').removeClass('d-none');
 });


/*
Details. Add comment
*/
$(document).on('click', '#add-comments-btn', function(event){
	event.stopImmediatePropagation();
	closeAnotherDetailsBlock('#comment-add-block'); 
 	$('#comment-add-block').removeClass('d-none');
 	$('#add-comments-btn').addClass('d-none');
});



 $(document).on('click', '#cancel-add-comment-btn', function(event){
 	event.stopImmediatePropagation();
 	$('#comment-text').val(null);
  	$('#comment-add-block').addClass('d-none');
 	$('#add-comments-btn').removeClass('d-none');
 });

$(document).on('click', '#add-comment-submit-btn', function(event){
	event.stopImmediatePropagation();
 	var comment = {
 		authorId: sessionStorage.getItem('userId'),
 		text: $('#comment-text').val(),
 		taskId: sessionStorage.getItem('currentTaskId')
 	};
 	$('#comment-text').val(null);

 	$.ajax({
        type: 'POST', 
        url: properties.API_HOST + properties.API_ROOT + 'tasks/'+ sessionStorage.getItem('currentTaskId') +'/comments',
        headers: {"Authorization": sessionStorage.getItem('token')},
        contentType: "application/json; charset=utf-8",
		crossDomain: true,
        data: JSON.stringify(comment),
        success: function (data) { 
            $('#comment-add-block').addClass('d-none');
            $('#add-comments-btn').removeClass('d-none');
        },error: function(xhr){
        	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Internal server error...Try again later.');
                        break;
			}
        }
 	});
 	
 });

/*
Display list comments
*/
 $(document).on('click', '#comments-btn', function(event){
 	event.stopImmediatePropagation();
 	closeAnotherDetailsBlock('#comment-list-block');
 	$('#comment-list-block').removeClass('d-none');
 	$('#comments-btn').addClass('d-none');
 	$('#comment-text').val(null);
 	
 	$.ajax({ 
		    type: 'GET', 
		    url: properties.API_HOST + properties.API_ROOT + "tasks/" + sessionStorage.getItem('currentTaskId') + "/comments", 
		    dataType: 'json',
		    headers: {"Authorization": sessionStorage.getItem('token')},
		    success: function (data) { 
		    	clearCommentDisplayList();
		        $.each(data, function(index, element) {
		        	var curr_user;

		        	$.ajax({
		        		'async': false,
		    			type: 'GET', 
		    			url: properties.API_HOST + properties.API_ROOT + "users/" + element.authorId, 
		    			dataType: 'json',
		    			headers: {"Authorization": sessionStorage.getItem('token')},
		    			success: function(data){
		    				curr_user = data;
		    			}
		        	});

		            $('#comment-display-area').append('<div class="row">' + 
                    						'<div class="col-md-3 font-weight-bold">' +
                    							curr_user.firstName + ' ' + curr_user.lastName +
                    						'</div>'+
                    						'<div class="col-md-9">' +
                        						'<div class="comment-body speech-bubble">' +
                            					element.text + 
                        						'</div>'+
  											'</div>' +
                						'</div>');
		        });
		    },
		    error: function(xhr){
		    	$('#comment-display-area').empty();
		    	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    case 404:
                    	$('#comments-info-block').empty();
                    	$('#comments-info-block').append('There are no comments.');
                    	break;
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Internal server error...Try again later.');
                        break;
				}
		    }
		});
 });

/* Add log work*/
$(document).on('click', '#add-logwork-submit-btn', function(event){
	event.stopImmediatePropagation();
 	var logwork = {
		  "description": $("#logwork-description").val(),
		  "estimationId": sessionStorage.getItem('currentEstimationId'),
		  "id": null,
		  "lastUpdate": null,
		  "logged": $("#logged-time").val(),
		  "userId": sessionStorage.getItem('userId')
 	};
 	console.log("Logwork: " + JSON.stringify(logwork));
 	$.ajax({
        type: 'POST', 
        url: properties.API_HOST + properties.API_ROOT + 'log-work/' + sessionStorage.getItem('currentEstimationId') + '/log-works/' + $('#remaining-time').val(),
        headers: {"Authorization": sessionStorage.getItem('token')},
        contentType: "application/json; charset=utf-8",
		crossDomain: true,
        data: JSON.stringify(logwork),
        success: function (data) {
        	$('#details-remaining').text($('#remaining-time').val());
			$('#details-logged').text(parseInt($('#details-logged').text()) + parseInt($('#logged-time').val()));
			alert($('#details-logged').val() + $('#logged-time').val());

            $('#log-work-block').addClass('d-none');
            $('#add-logwork-btn').removeClass('d-none');
            // clean
            $('#logwork-description').val(null);
            $('#logged-time').val(null);
            $('#remaining-time').val(null);
        },error: function(xhr){
        	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Internal server error...Try again later.');
                        break;
				}
        }
 	});
 	
 });


/*Display list logworks*/
$(document).on('click', '#log-works-btn', function(event){
	event.stopImmediatePropagation();
	closeAnotherDetailsBlock('#log-work-list');
	cleanLogworkDisplayList();
	$('#log-work-list').removeClass('d-none');
	$('#log-works-btn').addClass('d-none');

	$.ajax({ 
		    type: 'GET', 
		    url: properties.API_HOST + properties.API_ROOT + "log-work/by-est/" + sessionStorage.getItem('currentEstimationId'), 
		    dataType: 'json',
		    headers: {"Authorization": sessionStorage.getItem('token')},
		    success: function (data) {
		    	if(data == undefined || data.length == 0){
		    		$('#logwork-display-area').append('<p class="text-danger text-center">There are no logworks.</p>');
		    		return;
		    	} 
		        $.each(data, function(index, element) {
		        	
		        	console.log("Log WORK: " + JSON.stringify(element));
		        	var date = element.lastUpdate 
		            $('#logwork-display-area').append('<div class="row">' + 
                    						'<div class="col-md-3 small font-italic">' +
                    							date.dayOfMonth + '-' + (date.monthValue<10 ? '0'+date.monthValue : date.monthValue) + '-' + date.year + '<br>' +
                    							(date.hour) + ':' + (date.minute < 10 ? '0'+date.minute : date.minute) + ':' + 
                    							(date.second<10 ? '0'+date.second : date.second) +
                    						'</div>'+

                    						'<div class="col-md-9">' +
                        						'<p>' + element.description + '</p>' +
                        						'<p class="font-weight-bold">Logged time: ' + element.logged + '</p>' +
  											'</div>' +
                						'</div><hr class="details-line">  ');
		        });
		    },
		    error: function(xhr){
		    	$('#logwork-display-area').empty();
		    	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    default:
                    	$('#logwork-display-area').append('<p class="text-danger text-center">There are no logworks.</p>');
                    	break;
                    /*default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Internal server error...Try again later.');
                        break;*/
				}
		    }
		});

});


 $(document).on('click', '#close-comment-list-btn', function(event){
 	event.stopImmediatePropagation();
 	clearCommentDisplayList();
 	$('#comment-list-block').addClass('d-none');
 	$('#comments-btn').removeClass('d-none');
 });

 $(document).on('click', '#close-logwork-list-btn', function(event){
 	event.stopImmediatePropagation();
 	cleanLogworkDisplayList();
 	$('#log-work-list').addClass('d-none');
 	$('#log-works-btn').removeClass('d-none');
 });

 function clearCommentDisplayList(){
 	$('#comments-info-block').empty();
 	$('#comment-display-area').empty();
 }
 function cleanLogworkDisplayList(){
 	$('#logwork-display-area').empty();
 	$('#logwork-info-block').empty();
 }
 function clearAddComment(){
 	$('#comment-text').val(null);
 }
 function clearAddLogwork(){
 	$('#logged-time').val(null);
 	$('#remaining-time').val(null);
 }

/*Clear modal task-details when it close*/
$(document).on('hidden.bs.modal','#projectDetailsModal', function () {
  clearCommentDisplayList();
  clearAddComment();
  clearAddLogwork();
  cleanLogworkDisplayList();

  $('#comment-add-block').addClass('d-none');
  $('#comment-list-block').addClass('d-none');
  $('#log-work-list').addClass('d-none');
  $('#comment-add-block').addClass('d-none');

  $('#comments-btn').removeClass('d-none');
  $('#log-works-btn').removeClass('d-none');
  $('#add-comments-btn').removeClass('d-none');
  $('#add-logwork-btn').removeClass('d-none');
});

// Close another details block
function closeAnotherDetailsBlock(blockName){
	var blockList = ['#log-work-list', '#log-work-block', '#comment-add-block', '#comment-list-block'];
	if(blockList[0] == blockName){
		$('#log-work-block').addClass('d-none');
		$('#add-logwork-btn').removeClass('d-none');

		$('#comment-add-block').addClass('d-none');
		$('#add-comments-btn').removeClass('d-none');

		$('#comment-list-block').addClass('d-none');
		$('#comments-btn').removeClass('d-none');
	}else if(blockList[1] == blockName){
		$('#log-work-list').addClass('d-none');
		$('#log-works-btn').removeClass('d-none');

		$('#comment-add-block').addClass('d-none');
		$('#add-comments-btn').removeClass('d-none');

		$('#comment-list-block').addClass('d-none');
		$('#comments-btn').removeClass('d-none');
	}else if(blockList[2] == blockName){
		$('#log-work-list').addClass('d-none');
		$('#log-works-btn').removeClass('d-none');

		$('#log-work-block').addClass('d-none');
		$('#add-logwork-btn').removeClass('d-none');

		$('#comment-list-block').addClass('d-none');
		$('#comments-btn').removeClass('d-none');
	}else if(blockList[3] == blockName){
		$('#log-work-list').addClass('d-none');
		$('#log-works-btn').removeClass('d-none');

		$('#log-work-block').addClass('d-none');
		$('#add-logwork-btn').removeClass('d-none');

		$('#comment-add-block').addClass('d-none');
		$('#add-comments-btn').removeClass('d-none');
	} 
}


/*
Add sub-task
*/
$.ajax({ 
        'async': false,
        type: 'GET', 
        url: properties.API_HOST + properties.API_ROOT + 'priorities',
        headers: {"Authorization": sessionStorage.getItem('token')},
        dataType: 'json',
        success: function (data) { 
            $('#add-task-priority-select').empty();
            $.each(data, function(index, element) {
                $('#add-task-priority-select').append(
                  '<option id="taskPriorityId-'+element.id+'">' + element.title + '</option>'
                );
            });
        },error: function(xhr){
        	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Internal server error...Try again later.');
                        break;
				}
        }
    });

    //specializations
    $.ajax({
    	type: 'GET',
    	url: properties.API_HOST + properties.API_ROOT + 'specializations',
    	headers: {"Authorization": sessionStorage.getItem('token')},
    	dataType: 'json',
    	success: function(data){
    		$('#task-specializations').empty();
    		$('#task-specializations').append('<option id="task_specialization-all">All</option>');
    		$.each(data, function(index, element){
    			$('#task-specializations').append('<option id="task_specialization_id-' + element.id + '">' + element.title + '</option>');
    		});
    	},error: function(xhr){
        	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Internal server error...Try again later.');
                        break;
				}
        }
    });

    //users
    $.ajax({
    	type: 'GET',
    	url: properties.API_HOST + properties.API_ROOT + 'users',
    	headers: {"Authorization": sessionStorage.getItem('token')},
    	dataType: 'json',
    	success: function(data) {
    		$('#task-assign-to').empty();
    		$.each(data, function(index, element){
    			$("#task-assign-to").append('<option id="task_user-' + element.id + '">' + element.firstName + ' ' + element.lastName + '</option>');
    		});
    	},error: function(xhr){
        	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Internal server error...Try again later.');
                        break;
				}
        }
    });

 

  // if user choose specialization -> display all potential asignees with this specialization
  $('#task-specializations').change(function(event){
  	event.stopImmediatePropagation();
  	var specializationId = $('#task-specializations').children(':selected').attr('id').split('-')[1];
  	var urlUserBySpecializationId = 'users/specializations/' + specializationId;
  	if(specializationId === 'all'){
  		urlUserBySpecializationId = 'users';
  	}
  	$.ajax({
    	'async': false,
    	type: 'GET',
    	url: properties.API_HOST + properties.API_ROOT + urlUserBySpecializationId,
    	headers: {"Authorization": sessionStorage.getItem('token')},
    	dataType: 'json',
    	success: function(data) {
    		$('#task-assign-to').empty();
    		$.each(data, function(index, element){
    			$("#task-assign-to").append('<option id="task_workerId-' + element.id + '">' + element.firstName + ' ' + element.lastName + '</option>');
    		});
    	},error: function(xhr){
        	switch (xhr.status) {
					case 401:
						window.location.href = 'login.html';
                        break;
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Internal server error...Try again later.');
                        break;
				}
        }
    });
  });


  $( "#add-task-submit").on('click', function(event) {
  	event.stopImmediatePropagation();
	var task = {
			ownerId: sessionStorage.getItem('userId'),
			parentId: $('#add-task-parentId').val(),
			name: $('#add-task-name').val(),
			statusId: null,
			priorityId: $('#add-task-priority-select').children(":selected").attr("id").split('-')[1],
            estimationTime: $('#add-task-estimation').val(),
            workerId: $('#task-assign-to').children(':selected').attr('id').split('-')[1],
		}

		if(!isAddTaskDataValid(task)){
            $('#status-add-task').removeClass('d-none');
            $('#status-add-task').empty();
            $('#status-add-task').append('You have entered invalid data.'); 
            return;
        }
		console.log(JSON.stringify(task));
        
		$.ajax({
		    type: "POST",
		    url: properties.API_HOST + properties.API_ROOT + "tasks",
		    headers: {"Authorization": sessionStorage.getItem('token')},
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    data: JSON.stringify(task),
		    success: function(data){
		    	$('#add-task-name').val(null);
		    	$('#add-task-estimation').val(null);
		    	$('#status-add-task').empty();
		    	$('#status-add-task').removeClass('d-none');
		    	$("#status-add-task").text('You have successfully created a new task.');
		    	$('#'+task.parentId).next().append(generateAccordionDivContent(task));
		    },
		    error:function (xhr, ajaxOptions, thrownError){
				switch (xhr.status) {
					case 400:
						$("#status-add-task").empty();
                        $("#status-add-task").removeClass('d-none');
                        $("#status-add-task").text('You have entered invalid data.');
                    default:
                    	$("#status-add-task").empty();
                        $("#status-add-task").removeClass('d-none');
                        $("#status-add-task").text('Internal server error...Try again later.');
                        break;
				}
			}
		});
	});

function isAddTaskDataValid(task){
    var name = task.name;
    var time = task.estimationTime;
    if(name == undefined || $.trim(name) === '') return false;
    if(time == undefined || time <= 0) return false;
    return true;
  }

$(document).on('hidden.bs.modal','#myTaskCreateModal', function (){
	$('#add-task-name').val(null);
	$('#add-task-estimation').val(null);
	$('#status-add-task').empty();
	$('#status-add-task').addClass('d-none');
});	