import { Link } from 'react-router-dom';
import { ArrowRight, Package, Plane, ShieldCheck, Clock, Globe, DollarSign } from 'lucide-react';

export default function Home() {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <div className="relative bg-white pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-primary text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                        The Future of Peer-to-Peer Logistics
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
                        Send Anything, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-600">Anywhere.</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
                        DropLoop connects you with verified travellers to send items faster and cheaper than traditional couriers. Earn money while you travel.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/posts" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-primary hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            Browse Requests
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link to="/create" className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-lg font-medium rounded-full text-gray-700 bg-white hover:border-primary hover:text-primary transition-all duration-300">
                            Post a Request
                        </Link>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-primary font-semibold tracking-wide uppercase">How It Works</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Simple, Secure, and Fast
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Step 1 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 text-primary relative z-10">
                                <Package className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Post a Request</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Need to send something? List your item details, destination, and offer a price. It takes less than a minute.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600 relative z-10">
                                <Plane className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Connect with Travellers</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Verified travellers going to your destination will bid on your request. Choose the best offer based on ratings and price.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600 relative z-10">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Safe Delivery</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Chat securely, track your delivery, and release payment only when your item arrives safely.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats / Trust Section */}
            <div className="bg-white py-16 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">10k+</div>
                            <div className="text-gray-500 font-medium">Items Delivered</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">5k+</div>
                            <div className="text-gray-500 font-medium">Verified Travellers</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
                            <div className="text-gray-500 font-medium">Countries</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
                            <div className="text-gray-500 font-medium">User Rating</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
