import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Plane, Package, MapPin, Calendar, Weight, ArrowRight } from 'lucide-react';

export default function PostCard({ post, onBid }) {
    const navigate = useNavigate();
    const isTravel = post.type === 'travel';

    // Backward compatibility: handle old posts with 'date' field
    const departureDate = post.departureDate || post.date;
    const arrivalDate = post.arrivalDate || post.date;

    const handleCardClick = (e) => {
        // Don't navigate if clicking the bid button
        if (e.target.closest('button')) return;
        navigate(`/posts/${post.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        {post.userPhotoURL ? (
                            <img src={post.userPhotoURL} alt={post.userDisplayName} className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold">
                                {post.userDisplayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div>
                            <h3 className="font-medium text-gray-900">{post.userDisplayName}</h3>
                            <p className="text-xs text-gray-500">
                                {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                            </p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isTravel ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {isTravel ? 'Traveller' : 'Sender'}
                    </span>
                </div>
            </div>

            {/* Image (if exists) */}
            {post.imageUrl && (
                <div className="w-full">
                    <img src={post.imageUrl} alt={post.itemName || 'Post'} className="w-full h-48 object-cover" />
                </div>
            )}

            {/* Content */}
            <div className="p-6 pt-4">
                <div className="flex items-center space-x-2 text-gray-700 mb-4">
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="font-medium">{post.from}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="font-medium">{post.to}</span>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{departureDate}{arrivalDate && arrivalDate !== departureDate ? ` → ${arrivalDate}` : ''}</span>
                    </div>

                    {isTravel ? (
                        <div className="flex items-center text-sm text-gray-600">
                            <Plane className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="capitalize">{post.mode}</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center text-sm text-gray-600">
                                <Package className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-medium">{post.itemName}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Weight className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{post.itemWeight} kg</span>
                            </div>
                            {post.description && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.description}</p>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={() => onBid(post)}
                    className="w-full bg-white border border-primary text-primary hover:bg-indigo-50 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Place Bid
                </button>
            </div>
        </div>
    );
}
