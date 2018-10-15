(function(){

	// ew.fn.getCurrentUser(function(user){
	// 	ew.tempUser = user;
	// 	userDetailsWrapper.innerHTML = getUserDetailsTemplate(user);
	// 	initMap(user);
	// });
	var edb = ew.database;
	var currentUserId = +location.hash.slice(1);

	edb.open(edb.name, function(db){
		db.get('Employees', 'id', currentUserId, function(user){
			userDetailsWrapper.innerHTML = getUserDetailsTemplate(user);
			initMap(user);
		});

		db.getAll('Employees', function(allUsers){
			var swAction = {
				action: 'getSubordinates',
				arguments: [currentUserId, allUsers]
			};

			navigator.serviceWorker.ready.then(function(swreg) {

				navigator.serviceWorker.addEventListener('message', function(event){
			        var arrUsers = event.data;

			        var trs = '';
					for (var i = 0; i < arrUsers.length; i++) {
						trs += `
							<tr>
								<td> 
									<img src=${arrUsers[i].avatar} width="100"/>
								</td>
								<td> 
									<h5>${arrUsers[i].firstName} ${arrUsers[i].lastName}</h5>
									<div class="badge badge-warning">${arrUsers[i].position}</div>
									<div style="font-size: 12px;">
										<i class="fa fa-envelope text-info"></i> ${arrUsers[i].email}
									</div>

									<div style="margin-top:5px;">
										<a class="" 
										   href="/pages/empl-details.html#${arrUsers[i].id}">View</a> 
									</div>
								</td>
							</tr>
						`;
					};
					employeesBody.innerHTML = trs;
					$('#dataTable').DataTable({
						columnDefs: [
					  		{ targets: 'no-sort', orderable: false }
						]
					});
			    });
				navigator.serviceWorker.controller.postMessage(JSON.stringify(swAction));

			});
		})
	});






	function getUserDetailsTemplate(user){
		return `
			<div class="col-md-4 col-xs-12 col-sm-6 col-lg-4">
				<img src="${user.avatar}" alt="Avatar ${user.userName}" class="img">
			</div>
			<div class="col-md-8 col-xs-12 col-sm-6 col-lg-8">
				<div class="container" style="border-bottom:1px solid black">
					<h2 id="userName">${user.firstName} ${user.lastName}</h2>
				</div>
				<ul class="container details list-unstyled" style="">
					<li>
						<span class="badge badge-warning">${user.position}</span>
					</li>
					<li>
						<span class="text-info"><i class="fa fas fa-envelope"></i> ${user.email}</span>
					</li>
					<li>
						<span class="${user.dender === 'Male' ? 'text-danger' : 'text-primary'}">
							<i class="fa fas fa-${user.dender === 'Male' ? 'mars' : 'venus'}"></i>
							${user.gender}
						</span>

					</li>
					<li>
						<span>${user.location.city}</span>
					</li>
				</ul>
			</div>
		`;
	}

	function getElements(){
		return {
			userDetailsWrapper: document.getElementById('userDetailsWrapper')
		}
	}
}());



function initMap(user) {
	var myLatLng = {
		lat: user.location.latitude, 
		lng: user.location.longitude
	};
	var map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng,
		zoom: 10
	});
	var marker = new google.maps.Marker({
		map: map,
		position: myLatLng,
		title: 'Hello World!'
	});
}