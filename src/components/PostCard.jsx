import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Plane, Package, MapPin, Calendar, Weight, ArrowRight, Car, Bus, Train } from 'lucide-react';

export default function PostCard({ post, onBid }) {
    const navigate = useNavigate();
    const isTravel = post.type === 'travel';

    // Backward compatibility: handle old posts with 'date' field
    const departureDate = post.departureDate || post.date;
    const arrivalDate = post.arrivalDate || post.date;

    const handleUserClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${post.userId}`);
    };

    const handleCardClick = (e) => {
        // Don't navigate if clicking buttons or user profile
        if (e.target.closest('button')) return;
        navigate(`/posts/${post.id}`);
    };

    // Get mode-specific icon for travel posts
    const getModeIcon = (mode) => {
        const iconProps = { className: "h-12 w-12 opacity-20" };
        const iconPropsSmall = { className: "h-5 w-5 opacity-20" };

        switch (mode?.toLowerCase()) {
            case 'flight':
                return <Plane {...iconProps} />;
            case 'train':
                return <Train {...iconProps} />;
            case 'bus':
                return <Bus {...iconProps} />;
            case 'car':
                return <Car {...iconProps} />;
            default:
                return <Plane {...iconProps} />;
        }
    };

    const getModeIconSmall = (mode) => {
        const iconProps = { className: "h-5 w-5 opacity-20" };

        switch (mode?.toLowerCase()) {
            case 'flight':
                return <Plane {...iconProps} />;
            case 'train':
                return <Train {...iconProps} />;
            case 'bus':
                return <Bus {...iconProps} />;
            case 'car':
                return <Car {...iconProps} />;
            default:
                return <Plane {...iconProps} />;
        }
    };

    return (
        <>
            {/* Mobile Horizontal Card - Hidden on Desktop */}
            <div
                onClick={handleCardClick}
                className="md:hidden group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 mb-px"
            >
                <div className="flex">
                    {/* Image - Left Side */}
                    <div className="h-24 w-24 flex-shrink-0 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
                        {post.imageUrl ? (
                            <img
                                src={post.imageUrl}
                                alt={post.itemName || 'Post'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                                {isTravel ? (
                                    getModeIconSmall(post.mode)
                                ) : (
                                    <Package className="h-5 w-5 opacity-20" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-2 flex justify-between items-center gap-2">
                        {/* Info Column */}
                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                            {/* Title/Item Name */}
                            <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                                {isTravel ? (post.mode ? post.mode.charAt(0).toUpperCase() + post.mode.slice(1) : 'Travel') : (post.itemName || 'Item')}
                            </p>

                            {/* Location - From → To */}
                            <div className="flex items-center gap-1 text-[10px] text-gray-600 min-w-0">
                                <span className="truncate">{post.from.split(',')[0]}</span>
                                <ArrowRight className="h-2 w-2 flex-shrink-0" />
                                <span className="truncate">{post.to.split(',')[0]}</span>
                            </div>

                            {/* Dates */}
                            {(departureDate || arrivalDate) && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                    {departureDate && <span>{departureDate}</span>}
                                    {arrivalDate && arrivalDate !== departureDate && (
                                        <>
                                            <span>→</span>
                                            <span>{arrivalDate}</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Owner Info */}
                            <div className="flex items-center gap-1 text-[10px] mt-0.5">
                                {post.userPhotoURL ? (
                                    <img
                                        src={post.userPhotoURL}
                                        alt={post.userDisplayName}
                                        className="h-3 w-3 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="h-3 w-3 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-[6px] text-primary font-bold">
                                            {post.userDisplayName?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                )}
                                <span
                                    className="text-gray-600 truncate cursor-pointer hover:text-primary"
                                    onClick={handleUserClick}
                                >
                                    {post.userDisplayName}
                                </span>
                            </div>
                        </div>

                        {/* Price - Right Side */}
                        <div className="flex flex-col items-end justify-center flex-shrink-0 gap-1">
                            {post.offerPrice && (
                                <div className="text-sm font-bold text-primary">₹{post.offerPrice}</div>
                            )}
                            <div className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${isTravel ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {isTravel ? 'Travel' : 'Item'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Vertical Card - Hidden on Mobile */}
            <div
                onClick={handleCardClick}
                className="hidden md:flex group cursor-pointer h-full flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
                {/* Image Section - Consistent Height */}
                <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden relative flex items-center justify-center">
                    {post.imageUrl ? (
                        <img
                            src={post.imageUrl}
                            alt={post.itemName || 'Post'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                            {isTravel ? (
                                getModeIcon(post.mode)
                            ) : (
                                <Package className="h-12 w-12 opacity-20" />
                            )}
                            <span className="text-xs font-medium opacity-40">No image</span>
                        </div>
                    )}
                </div>

                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        {post.userPhotoURL ? (
                            <img
                                src={post.userPhotoURL}
                                alt={post.userDisplayName}
                                className="w-8 h-8 rounded-full border border-gray-200"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                {post.userDisplayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 hover:text-primary transition-colors">
                                {post.userDisplayName}
                            </p>
                            <p className="text-xs text-gray-500">
                                {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                            </p>
                        </div>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${isTravel ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {isTravel ? (
                            <>
                                <Plane className="h-3 w-3" />
                                Travel
                            </>
                        ) : (
                            <>
                                <Package className="h-3 w-3" />
                                Item
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 space-y-4">
                    {/* Route */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-gray-900 font-medium">{post.from}</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            <span className="text-sm text-gray-900 font-medium">{post.to}</span>
                        </div>
                    </div>

                    {/* Dates */}
                    {(departureDate || arrivalDate) && (
                        <div className="space-y-2 pt-2 border-t border-gray-200">
                            {departureDate && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                    <span className="text-gray-500">Depart:</span>
                                    <span className="font-medium text-gray-900">{departureDate}</span>
                                </div>
                            )}
                            {arrivalDate && arrivalDate !== departureDate && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                                    <span className="text-gray-500">Arrive:</span>
                                    <span className="font-medium text-gray-900">{arrivalDate}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details */}
                    <div className="space-y-2 pt-2">
                        {post.offerPrice && (
                            <div className="pb-2 border-b border-gray-200">
                                <p className="text-lg font-bold text-primary">₹{post.offerPrice}</p>
                                <p className="text-xs text-gray-500">Offer Price</p>
                            </div>
                        )}

                        {isTravel ? (
                            <>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Mode:</span> <span className="capitalize">{post.mode}</span>
                                </p>
                                {post.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Item:</span> {post.itemName}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Weight:</span> {post.itemWeight} kg
                                </p>
                                {post.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50 space-y-2">
                    <button
                        onClick={() => navigate(`/posts/${post.id}`)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        View Details
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onBid(post);
                        }}
                        className="w-full px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Place Bid
                    </button>
                </div>
            </div>
        </>
    );
}
