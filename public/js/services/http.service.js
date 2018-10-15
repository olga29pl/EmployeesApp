(function(obj){

	obj.get = function(url, options, cb){
		var networkDataReceived = false;

		// if (window.caches) {
		// 	caches.match(url)
		//     	.then(res => res && res.json())
		//     	.then(data => {
		// 			if (data && !networkDataReceived) {
		// 				console.log('From cache', data);
		// 				cb(data);
		// 			}
		// 	    });
		// }

		if(window.fetch){
			fetch(url)
				.then(res => res.json())
			  	.then(data => {
					if(data){
						networkDataReceived = true;
						console.log('From network', data);
						cb(data);
					}
				});
		} else {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			xhr.onreadystatechange = function(){
				if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					networkDataReceived = true;
					cb(JSON.parse(xhr.responseText));
				}
			}
			xhr.send();
		}



	}

}(ew.http));