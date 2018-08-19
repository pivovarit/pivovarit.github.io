function initMap() {
	function findPlaces() {
		let locations = document.querySelectorAll('[data-location]');
		let all = {};
		for(let i = 0; i < locations.length; ++i) {
			let latLong = locations[i].getAttribute('data-location').split(',');
			let place = locations[i].getAttribute('data-place');
			let events = [];
            for(let i = 0; i < locations.length; ++i) {
                if (place === locations[i].getAttribute('data-place')) {
                    events.push(locations[i].innerHTML)
                }
            }
            all[`[${events}] @ ${place}`] = {lat: parseFloat(latLong[0]), lng: parseFloat(latLong[1])};

        }
		return all
	}

    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: {lat: 30, lng: -20}
    });
    let places = findPlaces();
	for(let place in places) {
		if(places.hasOwnProperty(place)) {
			new google.maps.Marker({
				  position: places[place],
				  map: map,
				  title: place
			});
		}
	}
}
