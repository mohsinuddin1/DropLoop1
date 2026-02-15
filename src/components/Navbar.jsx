import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useScrollPosition } from '../hooks';
import { Menu, X, User, LogOut, MessageSquare, Moon, Sun, Sparkles } from 'lucide-react';
import { UI } from '../utils/constants';
import logo from '../assets/logo.png';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const { isDark, setIsDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const scrolled = useScrollPosition(UI.SCROLL_THRESHOLD);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive(path)
            ? 'text-primary bg-primary/10'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
        }`;

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
                    ? 'glass-strong shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
                    : 'bg-white/0 backdrop-blur-none'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="relative">
                            <img
                                src={logo}
                                alt="DropLoop"
                                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </Link>

                    {/* Desktop Navigation – Center */}
                    <div className="hidden md:flex md:items-center bg-gray-100/60 backdrop-blur-sm rounded-full px-1.5 py-1 gap-0.5">
                        <Link to="/posts" className={navLinkClass('/posts')}>
                            Browse
                        </Link>
                        <Link to="/create" className={navLinkClass('/create')}>
                            Create
                        </Link>
                        {user && (
                            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right Side – Desktop */}
                    <div className="hidden md:flex md:items-center md:gap-1.5">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-all duration-300"
                            title={isDark ? 'Light mode' : 'Dark mode'}
                        >
                            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                        </button>

                        {user ? (
                            <>
                                {/* Messages */}
                                <Link
                                    to="/messages"
                                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-all duration-300"
                                >
                                    <MessageSquare className="h-[18px] w-[18px]" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-scale-in">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Profile */}
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 p-1 hover:bg-gray-100/80 rounded-full transition-all duration-300"
                                >
                                    {user.photoURL ? (
                                        <img
                                            className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-white shadow-sm">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                    )}
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
                                    title="Logout"
                                >
                                    <LogOut className="h-[18px] w-[18px]" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                <Link
                                    to="/login"
                                    className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full transition-all duration-300"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="group relative px-5 py-2 text-sm font-semibold text-white rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-500 to-primary bg-[length:200%_100%] animate-gradient" />
                                    <span className="relative flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Get Started
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center gap-2 md:hidden">
                        {user && (
                            <Link to="/messages" className="relative p-2 text-gray-500">
                                <MessageSquare className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-300"
                        >
                            <div className="relative w-6 h-6">
                                <Menu className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                                <X className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu – slide down */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="glass-strong border-t border-gray-200/50 px-4 pt-3 pb-4 space-y-1">
                    <Link
                        to="/posts"
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive('/posts') ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100/80'
                            }`}
                        onClick={() => setIsOpen(false)}
                    >
                        Browse Posts
                    </Link>
                    <Link
                        to="/create"
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive('/create') ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100/80'
                            }`}
                        onClick={() => setIsOpen(false)}
                    >
                        Create Post
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive('/dashboard') ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100/80'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/profile"
                                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive('/profile') ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100/80'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                Profile
                            </Link>

                            <div className="pt-2 mt-2 border-t border-gray-200/50">
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="pt-3 mt-2 border-t border-gray-200/50 space-y-2">
                            <Link
                                to="/login"
                                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100/80 transition-all duration-200 text-center"
                                onClick={() => setIsOpen(false)}
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="block px-4 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-primary to-cyan-500 text-center shadow-lg shadow-primary/20 transition-all duration-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
