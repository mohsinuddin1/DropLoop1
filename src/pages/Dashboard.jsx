import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
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

    useEffect(() => {
        if (!user) return;

        // Fetch My Posts
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', user.uid));
        const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
            setMyPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch My Bids (Placed by me)
        const myBidsQuery = query(collection(db, 'bids'), where('bidderId', '==', user.uid));
        const unsubMyBids = onSnapshot(myBidsQuery, (snapshot) => {
            setMyBids(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Received Bids (On my posts)
        const receivedBidsQuery = query(collection(db, 'bids'), where('postOwnerId', '==', user.uid));
        const unsubReceivedBids = onSnapshot(receivedBidsQuery, (snapshot) => {
            const newBids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Check for new bids (notifications for post owner)
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const bid = change.doc.data();
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

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-4 text-center font-medium text-sm ${activeTab === 'posts' ? 'bg-indigo-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Posts ({myPosts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`flex-1 py-4 text-center font-medium text-sm ${activeTab === 'received' ? 'bg-indigo-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Received Bids ({receivedBids.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`flex-1 py-4 text-center font-medium text-sm ${activeTab === 'bids' ? 'bg-indigo-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Active Bids ({myBids.length})
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'posts' && (
                        <div className="space-y-4">
                            {myPosts.length === 0 ? (
                                <p className="text-center text-gray-500 py-10">You haven't created any posts yet.</p>
                            ) : (
                                myPosts.map(post => (
                                    <div key={post.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {post.type === 'travel' ? `Travel to ${post.to}` : post.itemName}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Posted on {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${post.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {post.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'received' && (
                        <div className="space-y-4">
                            {receivedBids.length === 0 ? (
                                <p className="text-center text-gray-500 py-10">No bids received yet.</p>
                            ) : (
                                receivedBids.map(bid => (
                                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-medium text-gray-900">{bid.bidderName}</span>
                                                <span className="text-gray-500 text-sm"> offered </span>
                                                <span className="font-bold text-primary">₹{bid.amount}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{bid.message}</p>
                                        {bid.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAcceptBid(bid)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectBid(bid)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {bid.status === 'accepted' && (
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBidForReview(bid);
                                                        setIsReviewModalOpen(true);
                                                    }}
                                                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                                                >
                                                    Review User
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'bids' && (
                        <div className="space-y-4">
                            {myBids.length === 0 ? (
                                <p className="text-center text-gray-500 py-10">You haven't placed any bids yet.</p>
                            ) : (
                                myBids.map(bid => (
                                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500">You offered <span className="font-bold text-gray-900">₹{bid.amount}</span></p>
                                            <p className="text-xs text-gray-400">
                                                {bid.createdAt?.seconds ? format(new Date(bid.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {bid.status}
                                        </span>
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
        </div>
    );
}
