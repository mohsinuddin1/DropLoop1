import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import FirstTimeIDVerificationModal from './FirstTimeIDVerificationModal';

export default function Layout() {
    const location = useLocation();
    const isMessagesPage = location.pathname.startsWith('/messages');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className={`flex-grow ${isMessagesPage ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} DropLoop. All rights reserved.
                </div>
            </footer>

            {/* First-time ID Verification Modal */}
            <FirstTimeIDVerificationModal />
        </div>
    );
}
