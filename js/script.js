/*var properties = {
  API_HOST: 'http://ec2-34-207-88-221.compute-1.amazonaws.com:8080',
  API_ROOT: '/MosquitoTM'
}*/
var properties = {
  API_HOST: 'http://localhost:8080/',
  API_ROOT: 'api/'
}
	function initAccordion(element) {
		fileName = document.location.pathname.match(/[^\/]+$/)[0];
		console.log(fileName);
		var filter = element.id; //all, doing, done
		
		var currentUserId = sessionStorage.getItem('userId');
		var query_url;
		
		if(fileName == 'my-projects.html'){ 
			query_url = properties.API_HOST + properties.API_ROOT + "projects/owner/27";//+ currentUserId,  //TODO
		}else if(fileName == 'all-projects.html'){
			query_url = properties.API_HOST + properties.API_ROOT + 'projects';
		}else if(fileName == 'my-work.html'){
			query_url = properties.API_HOST + properties.API_ROOT + 'tasks/workers-tasks/27' // + TODO: currentUserId;
		}else{
			query_url = properties.API_HOST + properties.API_ROOT + 'projects';
		}
		
		
		setStatusButtonStyleActive(element);
		console.log(filter);		
		
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
		        $.each(data, function(index, element) {
		            $('#accordionDiv').append(
		            	generateAccordionDivContent(element)
		            );
		        });
		    }
		});
		reloadAccordion();
	}

	function generateAccordionDivContent(element) {
		return '<div title="Click to expand" class="accordion" id="' + (element.id == undefined ? element.taskId : element.id) + '">' + 
			            		'<span style="width:100%; display: inline-block; text-align: left; align-self: center;">' + 
			            		'<span style="display:inline-block;">' + (element.name == undefined ? element.taskName : element.name) + '</span>' +
			            		'<button onClick="getTaskDetails('+ (element.id == undefined ? element.taskId : element.id) +')" type="button" title="" class="btn ditails-btn">View details</button>' +
			            		'<button data-id="'+ (element.id == undefined ? element.taskId : element.id) +'" class="btn add-task-btn" data-toggle="modal" data-target="#myTaskCreateModal">Add task <i class="fas fa-plus"></i></button>' +
			            		'</span>' + 
			            	'</div>' +	
			            	'<div class="panel"></div>';
	}

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
			    		console.log("Name: " + element.id + " status: " + element.statusDto.title);
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
		if(data.length > 0 && data[0].statusDto == undefined){
			for(var i = 0; i < data.length; i++){
				$.ajax({ 
				    'async': false,
				    type: 'GET', 
				    headers: {"Authorization": sessionStorage.getItem('token')}, 
				    url: properties.API_HOST + properties.API_ROOT + 'tasks/'+ (data[i].id == undefined ? data[i].taskId : data[i].id), 
				    dataType: 'json',
				    success: function (task) {
				    	if(statusTitle === 'done' && task.status == 'DONE'){
				    		filteredTasks.push(data[i]);
				    	}else if(statusTitle != 'done' && task.status != 'DONE'){
				    		filteredTasks.push(data[i]);
				    	}
				    }
				});
			}
			return filteredTasks;
		}


		if(statusTitle === 'done'){
			for(var i = 0; i < data.length; i++){
				if(data[i].statusDto.title === 'DONE'){
					filteredTasks.push(data[i]);
				}
			}
			return filteredTasks;
		}else if(statusTitle != 'done'){
			for(var i = 0; i < data.length; i++){
				if(data[i].statusDto.title != 'DONE'){
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
			    	sessionStorage['currentEstimationId'] = data.estimation;
			    	// Get worker
			    	var worker;
			    	$.ajax({ 
					    'async': false,
					    type: 'GET', 
					    url: properties.API_HOST + properties.API_ROOT + "users/" + data.worker, 
					    dataType: 'json',
					    headers: {"Authorization": sessionStorage.getItem('token')},
					    success: function (data) {
					    	worker = data.firstName + ' ' + data.lastName;
					 	}
					}); 

			    	$('#projectDetailsModal').modal('show');
					
					$('#details-name').append(data.name);
			    	$('#details-assignee').append(worker);
			    	$('#details-estimation').append(data.estimation.estimation);
			   		$('#details-logged').append(data.logged);
			   		$('#details-priority').append(data.priority);
			   		$('#details-status').append(data.status);
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

	/*function getMyWork(element) {
		console.log(element.id);
		
		setStatusButtonStyleActive(element);
		$('#myWork').html(ajaxGetMyWork(element.id));
	}

	function ajaxGetMyWork(status) {
		var statusId = '';
		switch(status){
			case 'all' : statusId = '';
				break;
			case 'doing' : statusId = 2;
				break;
			case 'done' : statusId = 3;
				break;
		}
		var currentUserId = localStorage['userId'] == null ? '' : localStorage['userId']; //TODO get from localStorage['userId']
		$('#myWork').empty();
		$.ajax({ 
		    'async': false,
		    type: 'GET', 
		    url: properties.API_HOST + properties.API_ROOT + "/tasks/workers?status_id=" + statusId + "&worker_id=" + currentUserId,  //TODO
		    //data: { get_param: 'value' }, 
		    dataType: 'json',
		    success: function (data) { 
		        $.each(data, function(index, element) {
		            $('#myWork').append(

							'<div class="accordion" style="cursor: default;" id="' + element.id + '">' + 
			            		'<span style="width:100%; display: inline-block; text-align: left; align-self: center;">' + 
			            		'<span style="display:inline-block; padding-top:7px">' + element.name + '</span>' +
			            		'<button onClick="getTaskDetails('+ element.id +')" type="button" title="" class="btn btn-info" style="float:right">View details</button>' +
			            		'</span>' + 
			            	'</div>'
		            );
		        });
		    }
		});
	}
*/

/*
Details. Add Log work
*/
 $(document).on('click', '#add-logwork-btn', function(){
 	closeAnotherDetailsBlock('#add-logwork-btn');
 	$('#log-work-block').removeClass('d-none');
 	$('#add-logwork-btn').addClass('d-none');
 });

 $(document).on('click', '#cancel-add-log-work-btn', function(){
 	$('#log-work-block').addClass('d-none');
 	$('#add-logwork-btn').removeClass('d-none');
 });


/*
Details. Add comment
*/
$(document).on('click', '#add-comments-btn', function(){
	closeAnotherDetailsBlock('#add-comments-btn');
 	$('#comment-add-block').removeClass('d-none');
 	$('#add-comments-btn').addClass('d-none');
});



 $(document).on('click', '#cancel-add-comment-btn', function(){
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
 	
 	$.ajax({
 		'async': false,
        type: 'POST', 
        url: properties.API_HOST + properties.API_ROOT + 'tasks/'+ sessionStorage.getItem('currentTaskId') +'/comments',
        headers: {"Authorization": sessionStorage.getItem('token')},
        contentType: "application/json; charset=utf-8",
		crossDomain: true,
        data: JSON.stringify(comment),
        success: function (data) { 
            $('#comment-add-block').addClass('d-none');
            $('#add-comments-btn').removeClass('d-none');
            // clean
            $('#comment-text').val(null);
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
 $(document).on('click', '#comments-btn', function(){
 	closeAnotherDetailsBlock('#comments-btn');
 	$('#comment-list-block').removeClass('d-none');
 	$('#comments-btn').addClass('d-none');
 	
 	$.ajax({ 
		    'async': false,
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
 	alert(
 		logwork.description + "\n" +
		logwork.estimationId  + "\n" +
		logwork.logged  + "\n" +
		logwork.userId
 		);
 	$.ajax({
 		'async': false,
        type: 'POST', 
        url: properties.API_HOST + properties.API_ROOT + 'log-work/' + sessionStorage.getItem('currentTaskId') + '/log-works/' + $('#remaining-time').val(),
        headers: {"Authorization": sessionStorage.getItem('token')},
        contentType: "application/json; charset=utf-8",
		crossDomain: true,
        data: JSON.stringify(logwork),
        success: function (data) {
        	alert('Succuss add logwork'); 
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


 $(document).on('click', '#close-comment-list-btn', function(){
 	clearCommentDisplayList();
 	$('#comment-list-block').addClass('d-none');
 	$('#comments-btn').removeClass('d-none');
 });

 function clearCommentDisplayList(){
 	$('#comments-info-block').empty();
 	$('#comment-display-area').empty();
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

  $('#comment-add-block').addClass('d-none');
  $('#comment-list-block').addClass('d-none');
  $('#log-work-block').addClass('d-none');
  $('#comment-add-block').addClass('d-none');

  $('#comments-btn').removeClass('d-none');
  $('#log-works-btn').removeClass('d-none');
  $('#add-comments-btn').removeClass('d-none');
  $('#add-logwork-btn').removeClass('d-none');
});

// Close another details block
function closeAnotherDetailsBlock(blockName){
	var blockList = ['#log-work-list', '#log-work-block', '#comment-add-block', '#comment-list-block'];
	if(blockList[0] != blockName){
		$('#log-work-block').addClass('d-none');
		$('#add-logwork-btn').removeClass('d-none');

		$('#comment-add-block').addClass('d-none');
		$('#add-comments-btn').removeClass('d-none');

		$('#comment-list-block').addClass('d-none');
		$('#comments-btn').removeClass('d-none');
	}else if(blockList[1] != blockName){
		$('#log-work-list').addClass('d-none');
		$('#log-works-btn').removeClass('d-none');

		$('#comment-add-block').addClass('d-none');
		$('#add-comments-btn').removeClass('d-none');

		$('#comment-list-block').addClass('d-none');
		$('#comments-btn').removeClass('d-none');
	}else if(blockList[2] != blockName){
		$('#log-work-list').addClass('d-none');
		$('#log-works-btn').removeClass('d-none');

		$('#log-work-block').addClass('d-none');
		$('#add-logwork-btn').removeClass('d-none');

		$('#comment-list-block').addClass('d-none');
		$('#comments-btn').removeClass('d-none');
	}else if(blockList[3] != blockName){
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
    	'async': false,
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
    	'async': false,
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
  $('#task-specializations').change(function(){
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

  $("#add-task-submit").click(function(event) {
	var task = {
			ownerId: sessionStorage.getItem('userId'),
			parentId: $('#add-task-parentId').val(),
			name: $('#add-task-name').val(),
			priorityId: $('#add-task-priority-select').children(":selected").attr("id").split('-')[1],
            estimation: $('#add-task-estimation').val(),
            workerId: $('#task-assign-to').children(':selected').attr('id').split('-')[1],
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
		    	window.location.href = 'my-projects.html';
		    },
		    error:function (xhr, ajaxOptions, thrownError){
		    	// For test. Move to success callback function
		    	$('#'+task.parentId).next().append(generateAccordionDivContent(task));
				
				switch (xhr.status) {
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Something is wrong on server');
                        break;
				}
			}
		});
	});
	