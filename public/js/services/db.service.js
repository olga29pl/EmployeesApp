// storage service
(function(obj) {
	var migrations = obj.migrations,
		version = obj.version,
    	ls = initLocalStorageService(),
    	idb = initIndexedDbService();

	// try use indexedDB by default
    use('indexedDB'); 

    function use(_useStorage){
    	useIndexedDB = _useStorage === 'indexedDB' && !!window.indexedDB;		
		obj.open = useIndexedDB ? idb.open : ls.open;
		obj.use = use;
    	return obj;
    }

    function initLocalStorageService() {    	
    	return {
    		open: lsOpen
    	};

    	var currentDbName;

    	function getDbName(dbName) {

    		return dbName + "_" + version
    	};
    	
    	function lsOpen(dbName, succ) {
    		if(!succ) throw Error("Please provide required success callback argument");
    		currentDbName = getDbName(dbName);

    		if (!localStorage.getItem(currentDbName)) {
    			var old = localStorage.getItem(getDbName(dbName , (version - 1)));
    			localStorage.setItem(currentDbName, JSON.stringify(old || {}));
    		}
    		for(var i = 1; i < version; i++){
    			localStorage.removeItem(getDbName(dbName, i));
    		}
    		return succ({
				get: lsGetBy,
	    		upsert: lsUpsert,
	    		getAll: lsGetAll,
	    		delete: lsDelete,
	    		where: lsWhere
			});
    	};

    	function lsGetBy(storename, key, value, cb) {
    		if(!cb) throw Error("Please provide required callback argument");
    		var store = getObjectStore(storename);
			cb(store.find(x => x[key] === value));
	    };

	    function lsDelete(storename, id, cb) {
    		if(!cb) throw Error("Please provide required callback argument");
    		var store = getObjectStore(storename);
    		store.splice(store.findIndex(x => x.id === id), 1);
	    	saveObjectSore(storename, store);
			cb('deleted: ' + id);
	    };

	    function lsUpsert(storename, newObj, cb){
    		if(!cb) throw Error("Please provide required callback argument");
    		var store = getObjectStore(storename);
    		var index = store.findIndex(x => x.id === newObj.id);
    		if(!~index) {
    			store.push(newObj);
    		} else {
    			store.splice(index, 1, newObj);
    		}
    		
			saveObjectSore(storename, store);
			cb('updated: ' + JSON.stringify(newObj));
	    };

	    function lsGetAll(storename, cb){
    		if(!cb) throw Error("Please provide required callback argument");
    		var store = getObjectStore(storename);
	    	cb(store);
	    };

	    function lsWhere(storename, lambda, cb){
    		if(!cb) throw Error("Please provide required callback argument");
    		var store = getObjectStore(storename);
	    	cb(store.filter(lambda));
	    };

	    function getObjectStore(storeName) {
	    	if(localStorage[currentDbName]){
	    		var db = JSON.parse(localStorage[currentDbName]);
	    		var store = db[storeName];
	    		if(!store) {
	    			store = [];
	    			db[storeName] = store;
	    			localStorage.setItem(currentDbName, JSON.stringify(db));
	    		}
    			return store;
	    	}
	    };

	    function saveObjectSore(storeName, store){
	    	var db = JSON.parse(localStorage[currentDbName]);
	    	db[storeName] = store;
	    	localStorage.setItem(currentDbName, JSON.stringify(db));
	    };
    };
    
    function initIndexedDbService() {
    	addToDbPrototype();

    	return {
    		open: idbOpen
    	};

    	function idbGetBy(db, objectStoreName, key, value, cb) {
    		if(!cb) throw Error("Please provide required callback argument");
    		var objectStore = db.transaction([objectStoreName], "readwrite")
								.objectStore(objectStoreName);

			if(objectStore.keyPath === key){
				var request = objectStore.get(value);
				request.onsuccess = function() {
					cb && cb(request.result);
				};
			}
			else if(objectStore.indexNames.contains(key)) {
				var request = objectStore.index(key).get(value);
				request.onsuccess = function() {
					cb && cb(request.result);
				}
			} else {
				idbWhere(db, objectStoreName, x => x[key] === value, function(res){
					cb(res && res[0]);
				});
			}
	    };

	    function idbDelete(db, objectStoreName, id, cb){
    		if(!cb) throw Error("Please provide required callback argument");
			db.transaction(objectStoreName, "readwrite")
				.objectStore(objectStoreName)
				.delete(id)
				.onsuccess = function(event) {
					cb && cb('removed: ' + id);
				};
	    };

	    function idbUpsert(db, objectStoreName, data, cb){
    		if(!cb) throw Error("Please provide required callback argument");
			db.transaction(objectStoreName, "readwrite")
				.objectStore(objectStoreName)
				.put(data)
				.onsuccess = function() {
			  		cb && cb('success');
			  	};
	    };

	    function idbGetAll(db, objectStoreName, cb){
    		if(!cb) throw Error("Please provide required callback argument");
	    	var allItems = [];
	    	var objectStore = db.transaction([objectStoreName], "readwrite")
	    						.objectStore(objectStoreName);

			objectStore.openCursor().onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					allItems.push(cursor.value);
					cursor.continue();
				} else {
					cb && cb(allItems);
				}
			};
	    };

	    function idbWhere(db, objectStoreName, lambda, cb){
    		if(!cb) throw Error("Please provide required callback argument");
	    	idbGetAll(db, objectStoreName, function(items){
	    		return cb(items.filter(lambda));
	    	});
	    };

	    function idbOpen(dbName, succ, err) {
    		if(!succ) throw Error("Please provide required callback argument");
	        var openreq = indexedDB.open(dbName, version);

	        openreq.onupgradeneeded = function(event) {
	            var db = event.target.result;

	            var currentVersion = !event.oldVersion ? event.oldVersion : 1;

	            while(currentVersion !== version) {
	            	currentVersion++;
	            	if(migrations[currentVersion]) {
	            		migrations[currentVersion](db, openreq);
	            	}
	            }
	        };

	        openreq.onsuccess = function(event) {
	        	succ && succ(event.target.result);
	        }

	        openreq.onerror = function(event){
		       	err && err(event.target.result);
	        }
	    };

	    function addToDbPrototype(){
	    	IDBDatabase.prototype.get = function(os, bk, bv, cb) { 
    			return idbGetBy(this, os, bk, bv, cb);
	    	};
	    	IDBDatabase.prototype.upsert = function(os, id, cb) { 
	    		return idbUpsert(this, os, id, cb);
	    	};
	    	IDBDatabase.prototype.getAll = function(os, cb) { 
	    		return idbGetAll(this, os, cb) 
	    	};
	    	IDBDatabase.prototype.delete = function(os, id, cb) { 
	    		return idbDelete(this, os, id, cb) 
	    	};
	    	IDBDatabase.prototype.where = function(os, lm, cb) { 
	    		return idbWhere(this, os, lm, cb) 
	    	};
	    }
    };
    
}(ew.database));