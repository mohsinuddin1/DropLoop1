import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useScrollPosition } from '../hooks';
import { Menu, X, User, LogOut, MessageSquare, Moon, Sun } from 'lucide-react';
import { UI } from '../utils/constants';
import logo from '../assets/logo.png';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const { isDark, setIsDark } = useTheme();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const scrolled = useScrollPosition(UI.SCROLL_THRESHOLD);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className={`border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/60 backdrop-blur-md shadow-sm'
            : 'bg-white'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <img src={logo} alt="DropLoop" className="h-10 w-auto" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-1">
                        <Link
                            to="/posts"
                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Browse Posts
                        </Link>
                        <Link
                            to="/create"
                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Create Post
                        </Link>

                        {user && (
                            <Link
                                to="/dashboard"
                                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right Side - Desktop */}
                    <div className="hidden md:flex md:items-center md:space-x-3">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {user ? (
                            <>
                                {/* Messages */}
                                <Link
                                    to="/messages"
                                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Profile */}
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    {user.photoURL ? (
                                        <img
                                            className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-indigo-700 rounded-lg transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/posts"
                            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            onClick={() => setIsOpen(false)}
                        >
                            Browse Posts
                        </Link>
                        <Link
                            to="/create"
                            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            onClick={() => setIsOpen(false)}
                        >
                            Create Post
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/messages"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Messages
                                    {unreadCount > 0 && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/profile"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-white bg-primary hover:bg-indigo-700"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
