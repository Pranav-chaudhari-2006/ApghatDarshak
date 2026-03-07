exports.computeRoute = async (req, res) => {
    try {
        const { source, destination, mode } = req.body;

        if (!source || !destination) {
            return res.status(400).json({ success: false, message: "Missing source or destination" });
        }

        // Logic check for different modes
        const mockStats = {
            shortest: { distanceMult: 1.0, riskBase: 35, count: 5 },
            safest: { distanceMult: 1.2, riskBase: 5, count: 0 },
            balanced: { distanceMult: 1.1, riskBase: 15, count: 1 }
        };

        const config = mockStats[mode] || mockStats.safest;

        // Realistic Pune Blackspots near the city center/highways
        const puneBlackspots = [
            { id: 101, lat: 18.5314, lng: 73.8446, risk: 42, fatal: 3, major: 8, minor: 12, area: "Shivajinagar" },
            { id: 102, lat: 18.5280, lng: 73.8740, risk: 55, fatal: 5, major: 10, minor: 15, area: "Pune Station" },
            { id: 103, lat: 18.5021, lng: 73.8602, risk: 38, fatal: 2, major: 6, minor: 14, area: "Swargate" },
            { id: 104, lat: 18.4580, lng: 73.8640, risk: 48, fatal: 4, major: 9, minor: 11, area: "Katraj Circle" },
            { id: 105, lat: 18.5089, lng: 73.8176, risk: 29, fatal: 1, major: 5, minor: 13, area: "Kothrud Depot" },
        ];

        // Filter blackspots based on the mode (Safest removes them from the path)
        const pathBlackspots = mode === 'safest' ? [] : puneBlackspots.slice(0, config.count);

        return res.json({
            success: true,
            totalDistance: (12.5 * config.distanceMult).toFixed(1),
            totalRisk: config.riskBase,
            blackspots: pathBlackspots
        });

    } catch (error) {
        console.error('Route Computation Error:', error);
        return res.status(500).json({
            success: false,
            message: "Computation Engine Error",
            blackspots: []
        });
    }
};

exports.getBlackspots = async (req, res) => {
    try {
        // Dummy data for initial map load
        return res.json([
            { lat: 18.5314, lng: 73.8446, risk: 42 },
            { lat: 18.5280, lng: 73.8740, risk: 55 },
            { lat: 18.5021, lng: 73.8602, risk: 38 }
        ]);
    } catch (e) {
        res.json([]);
    }
};
