// testRoute.js
const source = { lat: 18.6279, lng: 73.8020 }; // Pimpri Chowk
const destination = { lat: 18.6694, lng: 73.7750 }; // Nigdi Circle
const mode = "shortest";
const routeGeometry = [
    [18.6279, 73.8020],
    [18.6479, 73.7984],
    [18.6694, 73.7750]
];

fetch('http://localhost:5000/api/compute-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, destination, mode, routeGeometry })
})
    .then(r => r.json())
    .then(data => {
        console.log("Blackspots found:", data.blackspots.length);
        console.log("Total Risk:", data.totalRisk);
        console.log(data.blackspots);
    })
    .catch(console.error);
