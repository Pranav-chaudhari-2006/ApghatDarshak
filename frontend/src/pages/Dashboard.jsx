import React from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import BottomDrawer from '../components/Layout/BottomDrawer';
import MapView from '../components/Map/MapView';

const Dashboard = () => {
    return (
        <div className="flex flex-col h-screen w-full relative overflow-hidden bg-gray-50 dark:bg-slate-900">
            {/* Navbar - Fixed Height */}
            <Navbar />

            {/* Main Content Area */}
            <div className="flex-1 relative w-full h-full">
                {/* Floating Sidebar */}
                <Sidebar />

                {/* Map Canvas */}
                <div className="absolute inset-0 z-0">
                    <MapView />
                </div>

                {/* Bottom Drawer */}
                <BottomDrawer />
            </div>
        </div>
    );
};

export default Dashboard;
