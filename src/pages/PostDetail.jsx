import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, updateDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { ArrowLeft, Plane, Package, MapPin, Calendar, Weight, MessageSquare, Share2, X, Edit, Save, Upload } from 'lucide-react';
import BidModal from '../components/BidModal';
import { useNotifications } from '../context/NotificationContext';
import { uploadImage } from '../utils/uploadImage';

export default function PostDetail() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [post, setPost] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    // Edit form state
    const [editFrom, setEditFrom] = useState('');
    const [editTo, setEditTo] = useState('');
    const [editDepartureDate, setEditDepartureDate] = useState('');
    const [editArrivalDate, setEditArrivalDate] = useState('');
    const [editItemName, setEditItemName] = useState('');
    const [editItemWeight, setEditItemWeight] = useState('');
    const [editOfferPrice, setEditOfferPrice] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editMode, setEditMode] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [showShareToast, setShowShareToast] = useState(false);

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postDoc = await getDoc(doc(db, 'posts', postId));
                if (postDoc.exists()) {
                    setPost({ id: postDoc.id, ...postDoc.data() });
                    setLoading(false); // Set loading to false as soon as post is loaded
                } else {
                    navigate('/posts');
                }
            } catch (error) {
                console.error('Error fetching post:', error);
                if (error.code === 'permission-denied') {
                    console.error('Firestore permission denied. Make sure Firestore security rules are deployed.');
                }
                setLoading(false); // Set loading to false even on error
            }
        };
        fetchPost();
    }, [postId, navigate]);

    // Fetch bids for this post
    useEffect(() => {
        if (!postId) return;
        const q = query(
            collection(db, 'bids'),
            where('postId', '==', postId)
            // Removed orderBy to allow bids with null createdAt (from serverTimestamp) to appear immediately
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bidsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort in-memory, handling null timestamps
            bidsData.sort((a, b) => {
                const timeA = a.createdAt?.toMillis() || Date.now();
                const timeB = b.createdAt?.toMillis() || Date.now();
                return timeB - timeA; // Descending order
            });
            setBids(bidsData);
        });
        return () => unsubscribe();
    }, [postId]);

    const handleAcceptBid = async (bid) => {
        try {
            // 1. Update Bid Status
            await updateDoc(doc(db, 'bids', bid.id), { status: 'accepted' });

            // 2. Check if chat already exists
            const chatsRef = collection(db, 'chats');
            const q = query(chatsRef, where('participants', 'array-contains', user.uid));
            const querySnapshot = await getDocs(q);
            let chatExists = false;
            let chatId = null;

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.participants.includes(bid.bidderId)) {
                    chatExists = true;
                    chatId = docSnap.id;
                }
            });

            // 3. Create Chat if not exists
            if (!chatExists) {
                const newChat = await addDoc(collection(db, 'chats'), {
                    participants: [user.uid, bid.bidderId],
                    participantNames: {
                        [user.uid]: user.displayName,
                        [bid.bidderId]: bid.bidderName
                    },
                    lastMessage: "Bid Accepted! You can now chat.",
                    updatedAt: serverTimestamp(),
                    createdAt: serverTimestamp()
                });
                chatId = newChat.id;
            }

            // 4. Notify the bidder
            addNotification({
                id: `bid-accepted-${bid.id}-${Date.now()}`,
                type: 'bid_accepted',
                title: '🎉 Bid Accepted!',
                message: `Your bid of ₹${bid.amount} has been accepted! You can now chat.`,
                bidId: bid.id,
                postId: bid.postId,
                timestamp: new Date(),
                read: false
            });

            // 5. Navigate to messages
            navigate('/messages');
        } catch (error) {
            console.error("Error accepting bid:", error);
            alert("Failed to accept bid");
        }
    };

    const handleRejectBid = async (bid) => {
        try {
            await updateDoc(doc(db, 'bids', bid.id), { status: 'rejected' });
        } catch (error) {
            console.error("Error rejecting bid:", error);
            alert("Failed to reject bid");
        }
    };

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

    // Initialize edit form when entering edit mode
    const handleEnterEditMode = () => {
        setEditFrom(post.from);
        setEditTo(post.to);
        setEditDepartureDate(post.departureDate || post.date);
        setEditArrivalDate(post.arrivalDate || post.date);
        setEditItemName(post.itemName || '');
        setEditItemWeight(post.itemWeight || '');
        setEditOfferPrice(post.offerPrice || '');
        setEditDescription(post.description || '');
        setEditMode(post.mode || 'flight');
        setEditImageFile(null);
        setEditImagePreview(post.imageUrl || '');
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditImageFile(null);
        setEditImagePreview('');
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setEditImageFile(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveEdit = async () => {
        try {
            setEditLoading(true);
            const updates = {
                from: editFrom,
                to: editTo,
                departureDate: editDepartureDate,
                arrivalDate: editArrivalDate,
            };

            if (isTravel) {
                updates.mode = editMode;
                if (editOfferPrice) updates.offerPrice = Number(editOfferPrice);
            } else {
                updates.itemName = editItemName;
                updates.itemWeight = editItemWeight;
                if (editOfferPrice) updates.offerPrice = Number(editOfferPrice);
                updates.description = editDescription;

                // Upload new image if changed
                if (editImageFile) {
                    const imageUrl = await uploadImage(editImageFile, 'item-images');
                    updates.imageUrl = imageUrl;
                }
            }

            await updateDoc(doc(db, 'posts', postId), updates);

            // Update local state
            setPost({ ...post, ...updates });
            setIsEditMode(false);
            setEditImageFile(null);
            setEditImagePreview('');
            setEditLoading(false);
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post');
            setEditLoading(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareTitle = isTravel
            ? `Travel to ${post.to}`
            : `${post.itemName} - ${post.from} to ${post.to}`;
        const shareText = isTravel
            ? `Check out this travel opportunity from ${post.from} to ${post.to} on DropLoop!`
            : `Check out this item delivery: ${post.itemName} (${post.itemWeight}kg) from ${post.from} to ${post.to} on DropLoop!`;

        try {
            // Try Web Share API first (mobile devices)
            if (navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareUrl);
                setShowShareToast(true);
                setTimeout(() => setShowShareToast(false), 3000);
            }
        } catch (error) {
            // User cancelled or error occurred
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header with Back and Edit buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/posts')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Posts
                        </button>

                        {isOwner && !isEditMode && (
                            <button
                                onClick={handleEnterEditMode}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Post
                            </button>
                        )}

                        {isOwner && isEditMode && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={editLoading}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={editLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

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
                    <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 relative">
                        {(editImagePreview || post.imageUrl) && !isTravel ? (
                            <>
                                <img
                                    src={editImagePreview || post.imageUrl}
                                    alt={post.itemName || 'Post'}
                                    onClick={() => !isEditMode && setIsImageModalOpen(true)}
                                    className={`w-full h-full object-cover ${!isEditMode ? 'cursor-pointer hover:opacity-90' : ''} transition-opacity`}
                                />
                                {isEditMode && isOwner && (
                                    <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-50 transition-all">
                                        <div className="text-center text-white">
                                            <Upload className="h-12 w-12 mx-auto mb-2" />
                                            <p className="text-sm font-medium">Click to change image</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                                {isEditMode && !isTravel && isOwner ? (
                                    <label className="cursor-pointer text-center">
                                        <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
                                        <p className="text-primary font-medium">Click to upload image</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                ) : isTravel ? (
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
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={editFrom}
                                    onChange={(e) => setEditFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <p className="font-semibold text-lg text-gray-900">{post.from}</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">To</p>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={editTo}
                                    onChange={(e) => setEditTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                    <p className="font-semibold text-lg text-gray-900">{post.to}</p>
                                </div>
                            )}
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
                                        {isEditMode ? (
                                            <select
                                                value={editMode}
                                                onChange={(e) => setEditMode(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                <option value="flight">Flight</option>
                                                <option value="train">Train</option>
                                                <option value="bus">Bus</option>
                                                <option value="car">Car</option>
                                            </select>
                                        ) : (
                                            <p className="font-semibold text-gray-900 capitalize">{post.mode}</p>
                                        )}
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Departure Date</p>
                                        {isEditMode ? (
                                            <input
                                                type="date"
                                                value={editDepartureDate}
                                                onChange={(e) => setEditDepartureDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        ) : (
                                            <p className="font-semibold text-gray-900">{departureDate}</p>
                                        )}
                                    </div>
                                    {(arrivalDate && arrivalDate !== departureDate) || isEditMode ? (
                                        <div className="p-4 rounded-lg bg-white border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Arrival Date</p>
                                            {isEditMode ? (
                                                <input
                                                    type="date"
                                                    value={editArrivalDate}
                                                    onChange={(e) => setEditArrivalDate(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            ) : (
                                                <p className="font-semibold text-gray-900">{arrivalDate}</p>
                                            )}
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Item Name</p>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                value={editItemName}
                                                onChange={(e) => setEditItemName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        ) : (
                                            <p className="font-semibold text-gray-900">{post.itemName}</p>
                                        )}
                                    </div>
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Weight</p>
                                        {isEditMode ? (
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={editItemWeight}
                                                onChange={(e) => setEditItemWeight(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                placeholder="kg"
                                            />
                                        ) : (
                                            <p className="font-semibold text-gray-900">{post.itemWeight} kg</p>
                                        )}
                                    </div>
                                    {(post.offerPrice || isEditMode) && (
                                        <div className="p-4 rounded-lg bg-white border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Offer Price</p>
                                            {isEditMode ? (
                                                <input
                                                    type="number"
                                                    value={editOfferPrice}
                                                    onChange={(e) => setEditOfferPrice(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    placeholder="₹"
                                                />
                                            ) : (
                                                <p className="font-semibold text-primary text-lg">₹{post.offerPrice}</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Pickup Date</p>
                                        {isEditMode ? (
                                            <input
                                                type="date"
                                                value={editDepartureDate}
                                                onChange={(e) => setEditDepartureDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        ) : (
                                            <p className="font-semibold text-gray-900">{departureDate}</p>
                                        )}
                                    </div>
                                    {!isEditMode && (
                                        <div className="p-4 rounded-lg bg-white border border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Bids Received</p>
                                            <p className="font-semibold text-gray-900">{bids.length} offers</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {post.description && !isTravel && (
                            <div className="p-4 rounded-lg bg-white border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Description</p>
                                {isEditMode ? (
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 resize-none"
                                    />
                                ) : (
                                    <p className="text-gray-900">{post.description}</p>
                                )}
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
                                                <p className="text-2xl font-bold text-primary">₹{bid.amount}</p>
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
                                                <button
                                                    onClick={() => handleAcceptBid(bid)}
                                                    className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectBid(bid)}
                                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                                >
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
                            <button
                                onClick={handleShare}
                                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
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

            {/* Image Modal */}
            {isImageModalOpen && post.imageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <button
                        onClick={() => setIsImageModalOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
                    >
                        <X className="h-6 w-6 text-gray-900" />
                    </button>
                    <img
                        src={post.imageUrl}
                        alt={post.itemName || 'Post'}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            )}

            {/* Share Toast */}
            {showShareToast && (
                <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Link copied to clipboard!</span>
                </div>
            )}
        </div>
    );
}
