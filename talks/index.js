const dataPlace = 'data-place';
const dataLocation = 'data-location';

async function initMap() {
    let locations = document.querySelectorAll('[data-location]');
    let locationsMap = new Map();
    for (let i = 0; i < locations.length; ++i) {
        locationsMap.set(locations[i].getAttribute(dataPlace), locations[i].getAttribute(dataLocation).split(','))
    }

    async function findPlaces(year) {
        let all = {};

        function aggregatePlaces(year) {
            let results = new Map()

            for (let i = 0; i < locations.length; ++i) {
                let eventYear = locations[i].nextElementSibling.nextElementSibling.textContent.split('.')[2];
                if (!year || year === eventYear) {
                    let country = locations[i].nextElementSibling.nextElementSibling.nextElementSibling.textContent.split('/')[1];
                    if (country) {
                        if (!results.has(country)) {
                            results.set(country, 0)
                        }
                        results.set(country, results.get(country) + 1)
                    }
                }
            }
            return results
        }

        function aggregateEvents(year) {
            let results = new Map()
            for (let i = 0; i < locations.length; ++i) {
                let eventYear = locations[i].nextElementSibling.nextElementSibling.textContent.split('.')[2];
                if (!year || year === eventYear) {
                    let place = locations[i].getAttribute(dataPlace)
                    let events = results.get(place) || []
                    let event = locations[i].innerHTML;
                    if (!events.includes(event)) {
                        events.push(event)
                    }
                    results.set(place, events)
                }
            }
            return results
        }

        aggregateEvents(year)
            .forEach((events, place) => {
                all[`[${events}] @ ${place}`] = {
                    lat: parseFloat(locationsMap.get(place)[0]),
                    lng: parseFloat(locationsMap.get(place)[1])
                };
            })

        Array.from(aggregatePlaces(year).entries())
            .sort((a, b) => b[1] - a[1])
            .forEach(([country, count]) => {
                addStatistics(country, count)
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

function addStatistics(country, talks) {
    let table = document.getElementById("statistics");
    let newRow = table.insertRow(-1); // Insert row at the end of the table

    // Insert cells for country and talks
    let countryCell = newRow.insertCell(0);
    let talksCell = newRow.insertCell(1);

    // Assign values to the cells
    countryCell.textContent = country;
    talksCell.textContent = talks;
}
