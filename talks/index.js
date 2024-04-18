async function initMap() {
    function findPlaces(year) {
        let locations = document.querySelectorAll('[data-location]');
        let all = {};

        function removeDuplicates(events) {
            return events.filter((elem, pos, arr) => {
                return arr.indexOf(elem) === pos;
            });
        }

        function aggregateEvents(place, year) {
            let events = [];
            for (let i = 0; i < locations.length; ++i) {
                let eventYear = locations[i].nextElementSibling.nextElementSibling.textContent.split('.')[2];
                if (place === locations[i].getAttribute('data-place') && (!year || year === eventYear)) {
                    events.push(locations[i].innerHTML)
                }
            }
            return events;
        }

        for (let i = 0; i < locations.length; ++i) {
            let eventYear = locations[i].nextElementSibling.nextElementSibling.textContent.split('.')[2];
            if (year && year !== eventYear) {
                continue;
            }
            let latLong = locations[i].getAttribute('data-location').split(',');
            let place = locations[i].getAttribute('data-place');
            let events = removeDuplicates(aggregateEvents(place, year)).reverse();

            all[`[${events}] @ ${place}`] = {lat: parseFloat(latLong[0]), lng: parseFloat(latLong[1])};
        }
        return all
    }

    let map


    async function load() {
        const {Map} = await google.maps.importLibrary("maps");
        const {AdvancedMarkerElement, PinElement} = await google.maps.importLibrary("marker");
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 3,
            center: {lat: 30, lng: -20},
            mapId: "talksMapId"
        });
        const urlParams = new URLSearchParams(window.location.search);
        console.log(urlParams.get('year'))
        let places = findPlaces(urlParams.get('year'));
        for (let place in places) {
            if (places.hasOwnProperty(place)) {
                new google.maps.marker.AdvancedMarkerElement({
                    position: places[place],
                    map: map,
                    title: place,
                    scale: 0.5
                });
            }
        }
    }

    load()
}
