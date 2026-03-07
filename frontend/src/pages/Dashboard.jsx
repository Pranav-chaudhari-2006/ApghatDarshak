import React from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import RightSidebar from '../components/Layout/RightSidebar';
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

                {/* Right Sidebar Console */}
                <RightSidebar />
            </div>
        </div>
    );
};

export default Dashboard;
