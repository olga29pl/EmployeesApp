var ew = (function() {
    var apihost = 'https://andrushko-test1.herokuapp.com';
    var lsAppSettings = 'EmplStorage';
    saveAppSettings();

    return {
        socket: 'wss://andrushko-test1.herokuapp.com',
        caches: {
            appshell: 'appshell',
            dynamic: 'dynamic'
        },
        apis: {
            apihost: apihost,
            employees: apihost + '/employees'
        },
        http: { },
        fn: { 
            saveAppSettings: saveAppSettings,
            getAppSettings: getAppSettings
        },
        database: {
            name: 'EmployeesDatabase',
            version: 2,
            migrations: {
                1: function(db) {
                    db.createObjectStore("Employees", { keyPath: "id" });
                },
                2: function(db, openreq) {
                    openreq.transaction.objectStore('Employees')
                           .createIndex('email', 'email', { unique: true });
                }
            }
        },
    }

    function saveAppSettings(settings) {
        var appSettings = getAppSettings();
        if(!appSettings) {
            localStorage.setItem(lsAppSettings, JSON.stringify({}));
        } else if(settings){
            localStorage.setItem(lsAppSettings, JSON.stringify(settings));
        }
    }

    function getAppSettings(){
        return JSON.parse(localStorage.getItem(lsAppSettings));
    }
}());

(function() {
    setUserIcon();

    document.body.addEventListener('userChanged', function(){
        console.log('GLOBAL_USER_CHANGED');
    });

    function setUserIcon() {
        var appSettings = ew.fn.getAppSettings();
        if(appSettings.CurrentUser) {
            var userIcon = document.querySelector('#userDropdown');
            userIcon.innerHTML = `
                <img src="${appSettings.CurrentUser.avatar}" height="25" 
                    style="margin-top:-5px;border-radius:50%;border:3px solid blueviolet;" />
                `;
        }
    };
}());

(function(){
    if(navigator.serviceWorker) {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(function () {
                console.log('Service worker registered!');
            })
            .catch(function(err) {
                console.log(err);
            });
    };
}());