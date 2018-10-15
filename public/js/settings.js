(function(){
	var _e = getElements();
	var edb = ew.database;

	ew.fn.getCurrentUser(function(user){
		setOptions(user);
	});

	btnSaveSettings.addEventListener('click', function(event){
		var id = +_e.inputSelectUser.value;
		ew.fn.setCurrentUser(id, function() {
			document.body.dispatchEvent(new CustomEvent('userChanged'));
			location.reload();
		});
	});

	function setOptions(currentUser) {

		edb.open(edb.name, function(db){
			db.getAll('Employees', function(emplArray) {
				if(emplArray) { 
					var options = '';
					for (var i = 0; i < emplArray.length; i++) {
						var selected = currentUser.id === emplArray[i].id ? 'selected' : '';
						options += `
							<option value="${emplArray[i].id}" 
									${selected}>
									${emplArray[i].firstName} ${emplArray[i].lastName}
							</option>
						`;
					}
					_e.inputSelectUser.innerHTML = options;
				}
			});
		});
	}

	_e.inputCheckboxNotif.addEventListener('click', function(event){
		if(event.target.checked) {
			Notification.requestPermission().then((res) => {
				if(res === 'granted') {
					var appSettings = ew.fn.getAppSettings();
					if(!appSettings.NotificationsEnabled) {
						appSettings.NotificationsEnabled = true;
						ew.fn.saveAppSettings(appSettings);
					}
					navigator.serviceWorker.ready.then(swreg => {
						swreg.showNotification('Meow', {
							body: 'You subscribed for our notifications!',
						    image: 'https://amp.businessinsider.com/images/5654150584307663008b4ed8-750-563.jpg',
						    icon: '/img/icons/appicon-96-96.png',
						    badge: '/img/icons/appicon-96-96.png',
						    vibrate: [100, 50, 200],
						    tag: 'message-notification',
						    renotify: true
						});
					});
				} else {
					// notifications disabled
				}
			});
		}
	});


	function getElements(){
		return {
			inputSelectUser: document.getElementById('inputSelectUser'),
			inputCheckboxNotif: document.getElementById('inputCheckboxNotif'),
			btnSaveSettings: document.getElementById('btnSaveSettings')
		}
	}
}());

// navigator.serviceWorker.controller.postMessage("Client 1 says '"+msg+"'");