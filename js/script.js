var properties = {
  API_HOST: 'http://ec2-34-207-88-221.compute-1.amazonaws.com:8080',
  API_ROOT: '/MosquitoTM'
}
	function initAccordion(element) {
		fileName = document.location.pathname.match(/[^\/]+$/)[0];
		console.log(fileName);
		var filter = element.id; //all, doing, done
		
		var currentUserId = '';
		if(fileName == 'my-projects.html') // if not - dont use ownerId param
			var currentUserId = localStorage['userId'] == null ? '' : localStorage['userId']; //TODO get from localStorage['userId']
		console.log(localStorage['userId'] == null ? '' : localStorage['userId'])
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
		    url: properties.API_HOST + properties.API_ROOT + "/tasks/owners?status_id=" + statusId + "&owner_id=" + currentUserId,  //TODO
		    //data: { get_param: 'value' }, 
		    dataType: 'json',
		    success: function (data) { 
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
			            		'<span style="display:inline-block; padding-top:7px">' + element.name + '</span>' +
			            		'<button onClick="getTaskDetails('+ element.id +')" type="button" title="" class="btn btn-info" style="float:right">View details</button>' +
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
			    url: properties.API_HOST + properties.API_ROOT + "/tasks/parents?parent_id=" + currentAccordionDivButton.id , 
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
			    url: properties.API_HOST + properties.API_ROOT + "/tasks/" + taskId, 
			    dataType: 'json',
			    success: function (data) { 
			    	$('#projectDetailsModal').modal('show');
					
					$('#details-name').val(data.name);
			    	$('#details-assignee').val(data.assignee);
			    	$('#details-estimation').val(data.estimation.estimation);
			   		$('#details-logged').val(data.logged);
			   		$('#details-priority').val(data.priority.title);
			   		$('#details-status').val(data.status.title);
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

	