async function initMap() {
    async function findPlaces(year) {
        let locations = document.querySelectorAll('[data-location]');
        let all = {};

        function aggregateEvents(year) {
            let results = new Map()
            for (let i = 0; i < locations.length; ++i) {
                let eventYear = locations[i].nextElementSibling.nextElementSibling.textContent.split('.')[2];
                if (!year || year === eventYear) {
                    let place = {
                        place: locations[i].getAttribute('data-place'),
                        latLong: locations[i].getAttribute('data-location').split(',')
                    };
                    if (!results.has(place)) {
                        results.set(place, [])
                    }
                    let events = results.get(place);
                    if (!events.includes(locations[i].innerHTML)) {
                        events.push(locations[i].innerHTML)
                    }
                }
            }
            return results
        }

        aggregateEvents(year)
            .forEach((events, place) => {
                all[`[${events}] @ ${place.place}`] = {lat: parseFloat(place.latLong[0]), lng: parseFloat(place.latLong[1])};
            })

        return all
    }

    async function load() {
        const {Map} = await google.maps.importLibrary("maps");
        const {AdvancedMarkerElement, PinElement} = await google.maps.importLibrary("marker");
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 3,
            center: {lat: 30, lng: -20},
            mapId: "talksMapId"
        });
        const urlParams = new URLSearchParams(window.location.search);
        findPlaces(urlParams.get('year'))
            .then(places => {
                for (let place in places) {
                    if (places.hasOwnProperty(place)) {
                        new google.maps.marker.AdvancedMarkerElement({
                            position: places[place],
                            map: map,
                            title: place
                        });
                    }
                }
            })
    }

    load()
}
