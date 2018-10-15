fetch(ew.apis.employees).then(function(res){
	return res.json()
		.then(function(arrUsers){

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
});