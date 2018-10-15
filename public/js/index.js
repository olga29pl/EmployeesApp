(function(){

	var countOfEmployees = document.getElementById('countOfEmployees');

	ew.fn.populateUsers(function(usersCount){
		countOfEmployees.innerHTML = usersCount;
	});


    setUserName();
    
	function setUserName() {
        var appSettings = ew.fn.getAppSettings();
        if(appSettings.CurrentUser) {
            var userName = document.getElementById('currentUserName');
            userName.innerHTML = appSettings.CurrentUser.firstName + ' ' + 
                appSettings.CurrentUser.lastName ;

        }
    };
}());