import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Mail, Star } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { uploadImage } from '../utils/uploadImage';

export default function Profile() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({ profession: '', education: '', hometown: '', bio: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        let unsubscribeFn = null;

        // Fetch reviews where current user is the target (reviews received)
        const q = query(
            collection(db, 'reviews'),
            where('targetUserId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        
        unsubscribeFn = onSnapshot(
            q,
            (snapshot) => {
                const reviewsData = snapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                }));
                console.log('Fetched reviews for user:', user.uid, reviewsData);
                setReviews(reviewsData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching reviews:', error);
                // If orderBy fails (missing index), try without it
                if (error.code === 'failed-precondition' || error.code === 'unavailable') {
                    console.log('Retrying query without orderBy due to missing index...');
                    const qWithoutOrder = query(
                        collection(db, 'reviews'),
                        where('targetUserId', '==', user.uid)
                    );
                    unsubscribeFn = onSnapshot(
                        qWithoutOrder,
                        (snapshot) => {
                            const reviewsData = snapshot.docs.map(doc => ({ 
                                id: doc.id, 
                                ...doc.data() 
                            })).sort((a, b) => {
                                // Sort client-side by createdAt
                                const aTime = a.createdAt?.seconds || 0;
                                const bTime = b.createdAt?.seconds || 0;
                                return bTime - aTime;
                            });
                            console.log('Fetched reviews (without orderBy):', reviewsData);
                            setReviews(reviewsData);
                            setLoading(false);
                        },
                        (error2) => {
                            console.error('Error fetching reviews (fallback):', error2);
                            setLoading(false);
                        }
                    );
                } else {
                    setLoading(false);
                }
            }
        );
        
        return () => {
            if (unsubscribeFn) unsubscribeFn();
        };
    }, [user]);

    useEffect(() => {
        if (user) {
            const ref = doc(db, 'users', user.uid);
            getDoc(ref).then(snapshot => {
                if (snapshot.exists()) {
                    setUserProfile({ ...snapshot.data() });
                    setEditForm({
                        profession: snapshot.data().profession || '',
                        education: snapshot.data().education || '',
                        hometown: snapshot.data().hometown || '',
                        bio: snapshot.data().bio || ''
                    });
                }
            });
        }
    }, [user]);

    const handleEditSave = async () => {
        if (!user) return;
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, editForm);
        setUserProfile((prev) => ({ ...prev, ...editForm }));
        setEditOpen(false);
    };

    // NEW: handle profile picture upload
    async function handleProfilePicChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadImage(file, 'profile-pictures');
            // Update both Firebase Auth and Firestore user
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { photoURL: url });
            setUserProfile((prev) => ({ ...prev, photoURL: url }));
            // Update Auth as well for immediate context update (if wanted)
            if (user.providerData?.length) user.photoURL = url;
        } catch (err) {
            alert('Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="px-6 pb-6">
                            <div className="relative flex justify-center -mt-12 mb-4">
                                <div className="relative group cursor-pointer">
                                    {userProfile?.photoURL ? (
                                        <img src={userProfile.photoURL} alt={user.displayName} className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-28 h-28 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-primary text-4xl font-bold shadow-lg">
                                            {user.displayName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <label className="absolute bottom-2 right-2 bg-indigo-600 rounded-full p-1 cursor-pointer shadow group-hover:bg-indigo-500 transition-colors" title="Change Picture">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l3-3 8 8M13 7h0" /></svg>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} disabled={uploading}/>
                                    </label>
                                    {uploading && <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-primary font-bold rounded-full">Uploading...</div>}
                                </div>
                            </div>
                            <div className="text-center mb-6">
                                <h1 className="text-xl font-bold text-gray-900">{user.displayName}</h1>
                                <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <User className="w-4 h-4 mr-3 text-gray-400" />
                                    <span>Verified User</span>
                                </div>
                            </div>
                            {/* Extra Fields Display */}
                            <div className="mt-6 text-sm text-gray-700 space-y-1">
                                {userProfile?.profession && <div><strong>Profession:</strong> {userProfile.profession}</div>}
                                {userProfile?.education && <div><strong>Education:</strong> {userProfile.education}</div>}
                                {userProfile?.hometown && <div><strong>Hometown:</strong> {userProfile.hometown}</div>}
                                {userProfile?.bio && <div><strong>Bio:</strong> {userProfile.bio}</div>}
                            </div>
                            <div className="mt-6">
                                <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors" onClick={() => setEditOpen(true)}>
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Reviews Section */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900">User Reviews</h2>
                        </div>
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No reviews received yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Reviews appear here when others review you after completing transactions.</p>
                                <p className="text-xs text-gray-400 mt-2">Note: Reviews you give to others appear on their profiles, not yours.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Modern UI edit modal tweaks */}
            {editOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-2">
                    <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md mx-auto relative">
                        <button className="absolute top-3 right-4 text-xl" onClick={() => setEditOpen(false)}>&times;</button>
                        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">Edit Profile</h2>
                        <label className="block text-sm mt-3 font-semibold text-gray-700">Profession
                            <input className="mt-1 block w-full border-gray-200 rounded-lg p-2" value={editForm.profession} onChange={e => setEditForm(f => ({...f, profession: e.target.value}))} />
                        </label>
                        <label className="block text-sm mt-3 font-semibold text-gray-700">Education
                            <input className="mt-1 block w-full border-gray-200 rounded-lg p-2" value={editForm.education} onChange={e => setEditForm(f => ({...f, education: e.target.value}))} />
                        </label>
                        <label className="block text-sm mt-3 font-semibold text-gray-700">Hometown
                            <input className="mt-1 block w-full border-gray-200 rounded-lg p-2" value={editForm.hometown} onChange={e => setEditForm(f => ({...f, hometown: e.target.value}))} />
                        </label>
                        <label className="block text-sm mt-3 font-semibold text-gray-700">Bio
                            <textarea className="mt-1 block w-full border-gray-200 rounded-lg p-2" rows={3} value={editForm.bio} onChange={e => setEditForm(f => ({...f, bio: e.target.value}))} />
                        </label>
                        <div className="flex items-center space-x-4 mt-7 justify-center">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-5 py-2 font-semibold shadow" onClick={handleEditSave}>Save</button>
                            <button className="bg-gray-200 hover:bg-gray-300 rounded-md px-5 py-2 font-medium" onClick={() => setEditOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
