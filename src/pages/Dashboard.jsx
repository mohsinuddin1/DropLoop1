import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { Package, TrendingUp, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [myPosts, setMyPosts] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [receivedBids, setReceivedBids] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [selectedBidForReview, setSelectedBidForReview] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const listenerStartTime = useRef(Date.now()); // Track when listener starts to avoid notifying for old bids

    useEffect(() => {
        if (!user) return;

        // Fetch My Posts
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', user.uid));
        const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
            setMyPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch My Bids (Placed by me)
        const myBidsQuery = query(collection(db, 'bids'), where('bidderId', '==', user.uid));
        const unsubMyBids = onSnapshot(myBidsQuery, async (snapshot) => {
            const bidsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch post owner names for bids that are missing them
            const bidsWithOwnerNames = await Promise.all(
                bidsData.map(async (bid) => {
                    if (!bid.postOwnerName && bid.postOwnerId) {
                        try {
                            const userQuery = query(collection(db, 'users'), where('uid', '==', bid.postOwnerId));
                            const userSnapshot = await getDocs(userQuery);
                            if (!userSnapshot.empty) {
                                return { ...bid, postOwnerName: userSnapshot.docs[0].data().displayName };
                            }
                        } catch (error) {
                            console.error('Error fetching post owner name:', error);
                        }
                    }
                    return bid;
                })
            );

            setMyBids(bidsWithOwnerNames);
        });

        // Fetch Received Bids (On my posts)
        const receivedBidsQuery = query(collection(db, 'bids'), where('postOwnerId', '==', user.uid));
        const unsubReceivedBids = onSnapshot(receivedBidsQuery, (snapshot) => {
            const newBids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Check for new bids (notifications for post owner)
            // Only notify for bids created AFTER the listener was initialized (to avoid notifying for old bids)
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const bid = change.doc.data();
                    const bidTimestamp = bid.createdAt?.toMillis() || Date.now();

                    // Only send notification if bid was created after listener started
                    if (bidTimestamp > listenerStartTime.current) {
                        addNotification({
                            id: `new-bid-${change.doc.id}-${Date.now()}`,
                            type: 'new_bid',
                            title: '💰 New Bid Received!',
                            message: `${bid.bidderName} placed a bid of ₹${bid.amount}`,
                            bidId: change.doc.id,
                            postId: bid.postId,
                            timestamp: new Date(),
                            read: false
                        });
                    }
                }
            });

            setReceivedBids(newBids);
        });

        return () => {
            unsubPosts();
            unsubMyBids();
            unsubReceivedBids();
        };
    }, [user]);

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

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.participants.includes(bid.bidderId)) {
                    chatExists = true;
                    chatId = doc.id;
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
                    updatedAt: serverTimestamp()
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
        }
    };

    // Calculate stats
    const activePosts = myPosts.filter(p => p.status === 'open').length;
    const pendingBids = receivedBids.filter(b => b.status === 'pending').length;
    const completedCount = myPosts.filter(p => p.status === 'closed').length + myBids.filter(b => b.status === 'accepted').length;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage your posts, bids, and deliveries</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Active Posts</p>
                        <Package className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{activePosts}</p>
                </div>

                <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Pending Bids</p>
                        <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{pendingBids}</p>
                </div>

                <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">My Bids</p>
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{myBids.length}</p>
                </div>

                <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Completed</p>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="space-y-6">
                <div className="inline-flex bg-white border border-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'posts'
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:text-gray-900'
                            }`}
                    >
                        My Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'received'
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:text-gray-900'
                            }`}
                    >
                        Received Bids
                    </button>
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'bids'
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:text-gray-900'
                            }`}
                    >
                        My Active Bids
                    </button>
                </div>

                {/* My Posts Tab */}
                {activeTab === 'posts' && (
                    <div className="space-y-4">
                        {myPosts.length === 0 ? (
                            <div className="p-12 text-center rounded-xl bg-white border border-gray-200">
                                <p className="text-gray-500">You haven't created any posts yet.</p>
                            </div>
                        ) : (
                            myPosts.map(post => {
                                const postBids = receivedBids.filter(b => b.postId === post.id);
                                return (
                                    <div key={post.id} className="p-6 rounded-xl bg-white border border-gray-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    {post.type === 'travel' ? `Travel to ${post.to}` : post.itemName} - {post.from} to {post.to}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Posted {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'yyyy-MM-dd') : 'Just now'}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${post.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {post.status === 'open' ? 'Open' : 'Closed'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-primary">{postBids.length}</p>
                                                <p className="text-xs text-gray-500">Offers</p>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/posts/${post.id}`)}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Received Bids Tab */}
                {activeTab === 'received' && (
                    <div className="space-y-4">
                        {receivedBids.length === 0 ? (
                            <div className="p-12 text-center rounded-xl bg-white border border-gray-200">
                                <p className="text-gray-500">No bids received yet.</p>
                            </div>
                        ) : (
                            receivedBids.map(bid => (
                                <div key={bid.id} className="p-6 rounded-xl bg-white border border-gray-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-gray-900">{bid.postTitle || 'Post'}</h3>
                                            <p className="text-sm text-gray-500">From {bid.bidderName}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                            bid.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                            {bid.status === 'pending' ? 'Pending' : bid.status === 'accepted' ? 'Accepted' : 'Rejected'}
                                        </span>
                                    </div>

                                    {bid.message && (
                                        <p className="text-gray-700 mb-4">{bid.message}</p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <p className="text-xl font-bold text-primary">₹{bid.amount}</p>
                                        {bid.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAcceptBid(bid)}
                                                    className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectBid(bid)}
                                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {bid.status === 'accepted' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBidForReview(bid);
                                                    setIsReviewModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                            >
                                                Review User
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* My Active Bids Tab */}
                {activeTab === 'bids' && (
                    <div className="space-y-4">
                        {myBids.length === 0 ? (
                            <div className="p-12 text-center rounded-xl bg-white border border-gray-200">
                                <p className="text-gray-500">You haven't placed any bids yet.</p>
                            </div>
                        ) : (
                            myBids.map(bid => (
                                <div key={bid.id} className="p-6 rounded-xl bg-white border border-gray-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-gray-900">{bid.postTitle || 'Post'}</h3>
                                            <p className="text-sm text-gray-500">
                                                Posted by {bid.postOwnerName || 'User'} • {bid.createdAt?.seconds ? format(new Date(bid.createdAt.seconds * 1000), 'yyyy-MM-dd') : 'Just now'}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${bid.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                            bid.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                            {bid.status === 'accepted' ? 'Accepted' : bid.status === 'pending' ? 'Pending' : 'Rejected'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-xl font-bold text-primary">₹{bid.amount}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/posts/${bid.postId}`)}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                View Post
                                            </button>
                                            {bid.status === 'accepted' && (
                                                <button
                                                    onClick={() => navigate(`/messages?userId=${bid.postOwnerId}`)}
                                                    className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Start Chat
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {selectedBidForReview && (
                <ReviewModal
                    bid={selectedBidForReview}
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                />
            )}
        </div>
    );
}
