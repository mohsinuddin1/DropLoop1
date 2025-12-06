import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { ArrowLeft, Plane, Package, MapPin, Calendar, Weight, MessageSquare, Share2 } from 'lucide-react';
import BidModal from '../components/BidModal';

export default function PostDetail() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postDoc = await getDoc(doc(db, 'posts', postId));
                if (postDoc.exists()) {
                    setPost({ id: postDoc.id, ...postDoc.data() });
                } else {
                    navigate('/posts');
                }
            } catch (error) {
                console.error('Error fetching post:', error);
                if (error.code === 'permission-denied') {
                    console.error('Firestore permission denied. Make sure Firestore security rules are deployed.');
                }
            }
        };
        fetchPost();
    }, [postId, navigate]);

    // Fetch bids for this post
    useEffect(() => {
        if (!postId) return;
        const q = query(
            collection(db, 'bids'),
            where('postId', '==', postId),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBids(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [postId]);

    if (loading || !post) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isTravel = post.type === 'travel';
    const isOwner = user?.uid === post.userId;

    // Backward compatibility: handle old posts with 'date' field
    const departureDate = post.departureDate || post.date;
    const arrivalDate = post.arrivalDate || post.date;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/posts')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Posts
                    </button>

                    {/* Post Header */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div
                                onClick={() => navigate(`/profile/${post.userId}`)}
                                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                {post.userPhotoURL ? (
                                    <img
                                        src={post.userPhotoURL}
                                        alt={post.userDisplayName}
                                        className="h-12 w-12 rounded-full border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                        {post.userDisplayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 hover:text-primary transition-colors">{post.userDisplayName}</h1>
                                    <p className="text-sm text-gray-500">
                                        {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                                    </p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${isTravel ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {isTravel ? (
                                    <>
                                        <Plane className="h-4 w-4" />
                                        Travel
                                    </>
                                ) : (
                                    <>
                                        <Package className="h-4 w-4" />
                                        Item
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200">
                        {post.imageUrl ? (
                            <img
                                src={post.imageUrl}
                                alt={post.itemName || 'Post'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                                {isTravel ? (
                                    <Plane className="h-24 w-24 text-gray-300" />
                                ) : (
                                    <Package className="h-24 w-24 text-gray-300" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Route */}
                    <div className="grid grid-cols-2 gap-6 p-6 rounded-xl bg-white border border-gray-200">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">From</p>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <p className="font-semibold text-lg text-gray-900">{post.from}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">To</p>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-purple-600" />
                                <p className="font-semibold text-lg text-gray-900">{post.to}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">{isTravel ? 'Travel Details' : 'Item Details'}</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {isTravel ? (
                                <>
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Mode</p>
                                        <p className="font-semibold text-gray-900 capitalize">{post.mode}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Departure Date</p>
                                        <p className="font-semibold text-gray-900">{departureDate}</p>
                                    </div>
                                    {arrivalDate && arrivalDate !== departureDate && (
                                        <div className="p-4 rounded-lg bg-white border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Arrival Date</p>
                                            <p className="font-semibold text-gray-900">{arrivalDate}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Item Name</p>
                                        <p className="font-semibold text-gray-900">{post.itemName}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Weight</p>
                                        <p className="font-semibold text-gray-900">{post.itemWeight} kg</p>
                                    </div>
                                    {post.offerPrice && (
                                        <div className="p-4 rounded-lg bg-white border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Offer Price</p>
                                            <p className="font-semibold text-primary text-lg">₹{post.offerPrice}</p>
                                        </div>
                                    )}
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Pickup Date</p>
                                        <p className="font-semibold text-gray-900">{departureDate}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Bids Received</p>
                                        <p className="font-semibold text-gray-900">{bids.length} offers</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {post.description && (
                            <div className="p-4 rounded-lg bg-white border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Description</p>
                                <p className="text-gray-900">{post.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Bids Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Offers Received ({bids.length})</h2>

                        {bids.length === 0 ? (
                            <div className="p-12 text-center rounded-xl bg-white border border-gray-200">
                                <p className="text-gray-500">No offers yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bids.map(bid => (
                                    <div key={bid.id} className="p-6 rounded-xl bg-white border border-gray-200 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div
                                                onClick={() => navigate(`/profile/${bid.bidderId}`)}
                                                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                                            >
                                                {bid.bidderPhotoURL ? (
                                                    <img
                                                        src={bid.bidderPhotoURL}
                                                        alt={bid.bidderName}
                                                        className="h-10 w-10 rounded-full border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                                                        {bid.bidderName?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors">{bid.bidderName}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {bid.createdAt?.seconds ? format(new Date(bid.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-primary">${bid.amount}</p>
                                                <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {bid.status}
                                                </span>
                                            </div>
                                        </div>

                                        {bid.message && (
                                            <p className="text-gray-700">{bid.message}</p>
                                        )}

                                        {isOwner && bid.status === 'pending' && (
                                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                                <button className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                                                    Accept
                                                </button>
                                                <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/messages?userId=${bid.bidderId}`)}
                                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Message
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-6 sticky top-20">
                        <div>
                            <p className="text-sm text-gray-500 mb-4">Delivery Summary</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Route</span>
                                    <span className="font-semibold text-gray-900">
                                        {post.from.split(',')[0]} → {post.to.split(',')[0]}
                                    </span>
                                </div>
                                {!isTravel && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Item</span>
                                        <span className="font-semibold text-gray-900">{post.itemWeight} kg</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Date</span>
                                    <span className="font-semibold text-gray-900">{departureDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6 space-y-3">
                            {!isOwner ? (
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                            return;
                                        }
                                        setIsBidModalOpen(true);
                                    }}
                                    className="w-full px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Place Bid
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/messages')}
                                    className="w-full px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Contact Bidders
                                </button>
                            )}
                            <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <Share2 className="h-4 w-4" />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bid Modal */}
            {isBidModalOpen && (
                <BidModal
                    post={post}
                    isOpen={isBidModalOpen}
                    onClose={() => setIsBidModalOpen(false)}
                />
            )}
        </div>
    );
}
