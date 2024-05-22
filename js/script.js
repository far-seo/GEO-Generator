const App = {
    utils: {},
    handlers: {}
};

App.handlers.submitForm = function (event) {
    event.preventDefault();
    const latitude = parseFloat(document.getElementById('latitude-input').value);
    const longitude = parseFloat(document.getElementById('longitude-input').value);

    App.utils.fetchNearbyLocationsFromOSM(latitude, longitude);
};

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('location-form');
    form.addEventListener('submit', App.handlers.submitForm);
});

App.utils.fetchNearbyLocationsFromOSM = function (latitude, longitude, radius = 30) {
    const radiusInKilometers = radius * 1.60934;
    const deltaLat = radiusInKilometers / 110.574;
    const deltaLon = radiusInKilometers / (111.320 * Math.cos(deg2rad(latitude)));

    const minLat = latitude - deltaLat;
    const maxLat = latitude + deltaLat;
    const minLon = longitude - deltaLon;
    const maxLon = longitude + deltaLon;

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=50&q=town&bounded=1&viewbox=${minLon},${minLat},${maxLon},${maxLat}`;

    fetch(url)
        .then(response => response.json())
        .then(data => App.utils.filterAndDisplayLocations(data, latitude, longitude, radiusInKilometers))
        .catch(error => console.error('Error fetching locations:', error));
}

App.utils.filterAndDisplayLocations = function (data, latitude, longitude, radiusInKilometers) {
    const minimumDistanceKilometers = 5 * 1.60934; // 5 miles in kilometers
    const exclusionRadius = 3 * 1.60934; // 3 miles in kilometers

    // First, filter data to include only those within the radius and exclude those within 5 miles
    let filteredData = data.filter(loc => {
        let distance = App.utils.calculateDistance(latitude, longitude, parseFloat(loc.lat), parseFloat(loc.lon));
        return distance <= radiusInKilometers && distance > minimumDistanceKilometers;
    });

    // Sort filtered data by distance
    filteredData.sort((a, b) => {
        let distA = App.utils.calculateDistance(latitude, longitude, parseFloat(a.lat), parseFloat(a.lon));
        let distB = App.utils.calculateDistance(latitude, longitude, parseFloat(b.lat), parseFloat(b.lon));
        return distA - distB;
    });

    // Filter to ensure no towns are within 3 miles of each other
    let finalResults = [];
    for (let item of filteredData) {
        if (finalResults.length >= 5) break; // Stop adding if we have enough results

        let tooClose = finalResults.some(selectedItem => {
            let distanceBetween = App.utils.calculateDistance(item.lat, item.lon, selectedItem.lat, selectedItem.lon);
            return distanceBetween < exclusionRadius;
        });

        if (!tooClose) {
            finalResults.push(item);
        }
    }

    App.utils.displayLocations(finalResults);
}

App.utils.calculateDistance = function (lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Earth's radius in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

App.utils.displayLocations = function (locations) {
    const resultArea = document.getElementById('result-area');
    resultArea.innerHTML = '';
    locations.forEach((loc, index) => {
        const li = document.createElement('li');
        li.textContent = loc.display_name;
        // Add a border-bottom to each li except the last one
        if (index !== locations.length - 1) {
            li.className = 'border-b border-gray-300 pb-2 mb-2';
        }
        resultArea.appendChild(li);
    });
}
