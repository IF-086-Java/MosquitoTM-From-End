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
		
		if(fileName == 'my-projects.html'){ // if not - dont use ownerId param
			query_url = properties.API_HOST + properties.API_ROOT + "projects/owner/27";//+ currentUserId,  //TODO
		}else if(fileName == 'all-projects.html'){
			query_url = properties.API_HOST + properties.API_ROOT + 'projects';
		}else if(fileName == 'my-work.html'){
			query_url = properties.API_HOST + properties.API_ROOT + 'tasks/workers-tasks/27' // + TODO: currentUserId;
		}else{
			query_url = properties.API_HOST + properties.API_ROOT + 'projects';
		}
		
		var statusId = '';
		switch(filter){
			case 'all' : statusId = '';
				break;
			case 'doing' : statusId = 2;
				break;
			case 'done' : statusId = 3;
				break;
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
		    	console.log("Success: " + data);
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
		return '<div title="Click to expand" class="accordion" id="' + element.id + '">' + 
			            		'<span style="width:100%; display: inline-block; text-align: left; align-self: center;">' + 
			            		'<span style="display:inline-block;">' + element.name + '</span>' +
			            		'<button onClick="getTaskDetails('+ element.id +')" type="button" title="" class="btn ditails-btn">View details</button>' +
			            		'<button data-id="'+ element.id +'" class="btn add-task-btn" data-toggle="modal" data-target="#myTaskCreateModal">Add task <i class="fas fa-plus"></i></button>' +
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
			    	$.each(data, function(index, element) {
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
	

	/*
	Details
	*/
	function getTaskDetails(taskId) {
		sessionStorage['currentTaskId'] = taskId;
		$.ajax({ 
			    'async': false,
			    type: 'GET', 
			    url: properties.API_HOST + properties.API_ROOT + "tasks/" + taskId, 
			    dataType: 'json',
			    headers: {"Authorization": sessionStorage.getItem('token')},
			    success: function (data) {

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
					
					$('#details-name').val(data.name);
			    	$('#details-assignee').val(worker);
			    	$('#details-estimation').val(data.estimation.estimation);
			   		$('#details-logged').val(data.logged);
			   		$('#details-priority').val(data.priority);
			   		$('#details-status').val(data.status);
			   		$('#details-remaining').val(data.estimation.remaining);		
			    },
			    error:function (xhr, ajaxOptions, thrownError){
			    	//TODO
			    	alert('Server connection error...');
			    }
			});
	}

	function clearTaskDetails() {
		$('#details-name').val(null);
    	$('#details-assignee').val(null);
    	$('#details-estimation').val(null);
   		$('#details-logged').val(null);
   		$('#details-priority').val(null);
   		$('#details-status').val(null);
   		$('#details-remaining').val(null);
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
  	$('#comment-add-block').addClass('d-none');
 	$('#add-comments-btn').removeClass('d-none');
 });

$(document).on('click', '#add-comment-submit-btn', function(){
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
	