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
		
		var currentUserId = '';
		if(fileName == 'my-projects.html') // if not - dont use ownerId param
			var currentUserId = sessionStorage['userId'] == null ? '' : sessionStorage['userId']; //TODO get from localStorage['userId']
		console.log(sessionStorage['userId'] == null ? '' : sessionStorage['userId'])
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
		    url:/* 'json/getMyWork.json',*/properties.API_HOST + properties.API_ROOT + "tasks/workers-tasks/27" ,//+ currentUserId,  //TODO
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
		return '<div title="Click to expand" class="accordion" id="' + element.taskId + '">' + 
			            		'<span style="width:100%; display: inline-block; text-align: left; align-self: center;">' + 
			            		'<span style="display:inline-block;">' + element.taskName + '</span>' +
			            		'<button onClick="getTaskDetails('+ element.taskId +')" type="button" title="" class="btn ditails-btn">View details</button>' +
			            		'<button data-id="'+ element.taskId +'" class="btn add-task-btn" data-toggle="modal" data-target="#myTaskCreateModal">Add task <i class="fas fa-plus"></i></button>' +
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
	
	function getTaskDetails(taskId) {
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

	function getMyWork(element) {
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
				switch (xhr.status) {
                    default:
                        $("#status").removeClass('d-none');
                        $("#status").text('Something is wrong on server');
                        break;
				}
			}
		});
	});
	