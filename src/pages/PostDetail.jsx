import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { ArrowLeft, Plane, Package, MapPin, Calendar, Weight, User } from 'lucide-react';
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
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    const isTravel = post.type === 'travel';
    const isOwner = user?.uid === post.userId;

    // Backward compatibility: handle old posts with 'date' field
    const departureDate = post.departureDate || post.date;
    const arrivalDate = post.arrivalDate || post.date;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate('/posts')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Posts
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Post Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    {post.userPhotoURL ? (
                                        <img src={post.userPhotoURL} alt={post.userDisplayName} className="w-12 h-12 rounded-full" />
                                    ) : (
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                            {post.userDisplayName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{post.userDisplayName}</h3>
                                        <p className="text-sm text-gray-500">
                                            {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isTravel ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                    {isTravel ? 'Traveller' : 'Sender'}
                                </span>
                            </div>
                        </div>

                        {/* Image */}
                        {post.imageUrl && (
                            <div className="w-full">
                                <img src={post.imageUrl} alt={post.itemName || 'Post'} className="w-full h-64 object-cover" />
                            </div>
                        )}

                        {/* Details */}
                        <div className="p-6">
                            <div className="flex items-center space-x-3 text-gray-700 mb-6">
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                                    <span className="font-semibold text-lg">{post.from}</span>
                                </div>
                                <span className="text-gray-400">→</span>
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                                    <span className="font-semibold text-lg">{post.to}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-gray-600">
                                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                                    <div>
                                        <span className="font-medium">{isTravel ? 'Departure' : 'Pickup'}: </span>
                                        <span>{departureDate}</span>
                                    </div>
                                </div>
                                {arrivalDate && arrivalDate !== departureDate && (
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                                        <div>
                                            <span className="font-medium">{isTravel ? 'Arrival' : 'Delivery'}: </span>
                                            <span>{arrivalDate}</span>
                                        </div>
                                    </div>
                                )}

                                {isTravel ? (
                                    <div className="flex items-center text-gray-600">
                                        <Plane className="w-5 h-5 mr-3 text-gray-400" />
                                        <span className="capitalize">{post.mode}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center text-gray-600">
                                            <Package className="w-5 h-5 mr-3 text-gray-400" />
                                            <span className="font-medium">{post.itemName}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Weight className="w-5 h-5 mr-3 text-gray-400" />
                                            <span>{post.itemWeight} kg</span>
                                        </div>
                                        {post.description && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">{post.description}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {!isOwner && (
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            // Redirect to login page if user is not authenticated
                                            navigate('/login');
                                            return;
                                        }
                                        setIsBidModalOpen(true);
                                    }}
                                    className="w-full mt-6 bg-primary text-white hover:bg-cyan-600 font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    Place Bid
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bids Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Bids ({bids.length})
                        </h3>

                        {bids.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No bids yet</p>
                        ) : (
                            <div className="space-y-4">
                                {bids.map(bid => (
                                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                {bid.bidderPhotoURL ? (
                                                    <img src={bid.bidderPhotoURL} alt={bid.bidderName} className="w-8 h-8 rounded-full" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{bid.bidderName}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {bid.createdAt?.seconds ? format(new Date(bid.createdAt.seconds * 1000), 'MMM d') : 'Just now'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        </div>
                                        <p className="text-lg font-bold text-primary mb-2">₹{bid.amount}</p>
                                        {bid.message && (
                                            <p className="text-sm text-gray-600">{bid.message}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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
