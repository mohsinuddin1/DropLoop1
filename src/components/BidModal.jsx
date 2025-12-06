import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { X } from 'lucide-react';

export default function BidModal({ post, isOpen, onClose }) {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingBid, setExistingBid] = useState(null);
    const [checkingBid, setCheckingBid] = useState(true);

    useEffect(() => {
        if (!isOpen || !user || !post) {
            setCheckingBid(false);
            return;
        }

        const checkExistingBid = async () => {
            setCheckingBid(true);
            try {
                const bidsQuery = query(
                    collection(db, 'bids'),
                    where('postId', '==', post.id),
                    where('bidderId', '==', user.uid)
                );
                const snapshot = await getDocs(bidsQuery);

                if (!snapshot.empty) {
                    const bidData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                    setExistingBid(bidData);
                    // Pre-fill form with existing bid data
                    setAmount(bidData.amount.toString());
                    setMessage(bidData.message || '');
                } else {
                    setExistingBid(null);
                    setAmount('');
                    setMessage('');
                }
            } catch (error) {
                console.error("Error checking existing bid:", error);
            }
            setCheckingBid(false);
        };

        checkExistingBid();
    }, [isOpen, user, post]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to place a bid");
            return;
        }

        // Check if user already has a pending or accepted bid
        if (existingBid && existingBid.status !== 'rejected') {
            setLoading(true);
            try {
                // Update existing bid
                await updateDoc(doc(db, 'bids', existingBid.id), {
                    amount: Number(amount),
                    message,
                    updatedAt: serverTimestamp()
                });
                onClose();
                alert("Bid updated successfully!");
            } catch (error) {
                console.error("Error updating bid:", error);
                alert("Failed to update bid");
            }
            setLoading(false);
        } else {
            // Create new bid (either first time or after rejection)
            setLoading(true);
            try {
                await addDoc(collection(db, 'bids'), {
                    postId: post.id,
                    postType: post.type,
                    postOwnerId: post.userId,
                    postTitle: post.type === 'travel' ? `Travel to ${post.to}` : post.itemName,
                    postOwnerName: post.userDisplayName,
                    bidderId: user.uid,
                    bidderName: user.displayName,
                    bidderPhotoURL: user.photoURL,
                    amount: Number(amount),
                    message,
                    status: 'pending',
                    createdAt: serverTimestamp()
                });
                onClose();
                alert("Bid placed successfully!");
            } catch (error) {
                console.error("Error placing bid:", error);
                alert("Failed to place bid");
            }
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                {existingBid && existingBid.status !== 'rejected' ? 'Update Your Bid' : 'Place a Bid'}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-4">
                                You are bidding on: <span className="font-medium text-gray-900">{post.type === 'travel' ? `Trip to ${post.to}` : post.itemName}</span>
                            </p>

                            {existingBid && existingBid.status === 'pending' && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        You already have a pending bid of <span className="font-semibold">₹{existingBid.amount}</span>. You can update it below.
                                    </p>
                                </div>
                            )}

                            {existingBid && existingBid.status === 'accepted' && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        Your bid of <span className="font-semibold">₹{existingBid.amount}</span> has been accepted! You can still update it if needed.
                                    </p>
                                </div>
                            )}

                            {existingBid && existingBid.status === 'rejected' && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">
                                        Your previous bid of <span className="font-semibold">₹{existingBid.amount}</span> was rejected. You can place a new bid.
                                    </p>
                                </div>
                            )}

                            {checkingBid ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-sm text-gray-500 mt-2">Checking existing bids...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bid Amount (₹)</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">₹</span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                className="focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
                                        <textarea
                                            rows={3}
                                            className="shadow-sm focus:ring-primary focus:border-primary mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                            placeholder="Add a note..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>

                                    <div className="mt-5 sm:mt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm disabled:opacity-50"
                                        >
                                            {loading ?
                                                (existingBid && existingBid.status !== 'rejected' ? 'Updating Bid...' : 'Placing Bid...') :
                                                (existingBid && existingBid.status !== 'rejected' ? 'Update Bid' : 'Submit Bid')
                                            }
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
