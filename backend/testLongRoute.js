const source = { lat: 18.4965, lng: 73.9399 };
const destination = { lat: 18.6323, lng: 73.7381 };
const mode = "shortest";
// Use a generic line between the two points to simulate the route geometry
const routeGeometry = [];
for(let i=0; i<=100; i++) {
    routeGeometry.push([
        source.lat + (destination.lat - source.lat) * (i/100),
        source.lng + (destination.lng - source.lng) * (i/100)
    ]);
}

fetch('http://localhost:5000/api/compute-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, destination, mode, routeGeometry })
})
    .then(r => r.json())
    .then(data => {
        console.log("Blackspots found:", data.blackspots?.length);
        console.log(data.blackspots);
    })
    .catch(console.error);
