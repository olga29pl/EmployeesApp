(function(){
    var edb = ew.database;

    ew.fn.populateUsers = function(cb){
        ew.http.get(ew.apis.employees, null, function(arrUsers) {
            if(arrUsers){
                edb.open(edb.name, function(db) {
                    for (var i = 0; i < arrUsers.length; i++) {
                        db.upsert('Employees', arrUsers[i], () => {});
                    }
                });
                cb(arrUsers.length);
            }
        });
    }


    ew.fn.getCurrentUser = function(cb){
        var appSettings = ew.fn.getAppSettings();

        if(!appSettings.CurrentUser){
            edb.open(edb.name, function(db){
                db.get('Employees', 'id', 1, function(empl) {
                    if(empl) { 
                        appSettings.CurrentUser = empl;
                        ew.fn.saveAppSettings(appSettings); 
                        cb(empl);
                    }
                });
            });
        } else {
            cb(appSettings.CurrentUser);
        }
    };

    ew.fn.setCurrentUser = function(arg, cb) {
        var appSettings = ew.fn.getAppSettings();
        if(arg && typeof arg === 'object'){
            appSettings.CurrentUser = arg;
            ew.fn.saveAppSettings(appSettings);
        } else if (typeof arg === 'number') {
            edb.open(edb.name, function(db){
                db.get('Employees', 'id', arg, function(empl) {
                    if(empl) { 
                        appSettings.CurrentUser = empl;
                        ew.fn.saveAppSettings(appSettings); 
                        cb(empl);
                    }
                });
            });
        }
    }
}());