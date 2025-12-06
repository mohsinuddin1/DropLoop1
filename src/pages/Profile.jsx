import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Star, Edit2, MapPin, Briefcase, BookOpen, MessageSquare, Award, Mail } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { uploadImage } from '../utils/uploadImage';

export default function Profile() {
    const { userId } = useParams(); // Get userId from URL if viewing someone else's profile
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [profileUser, setProfileUser] = useState(null); // The user whose profile we're viewing
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ profession: '', education: '', hometown: '', bio: '' });
    const [uploading, setUploading] = useState(false);
    const [completedDeliveries, setCompletedDeliveries] = useState(0);

    // Determine whose profile we're viewing
    const targetUserId = userId || user?.uid;
    const isOwnProfile = !userId || userId === user?.uid;

    useEffect(() => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }

        // Fetch the profile user's data
        const fetchProfileUser = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', targetUserId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setProfileUser({
                        uid: targetUserId,
                        displayName: userData.displayName || 'User',
                        email: userData.email || '',
                        photoURL: userData.photoURL || null,
                        ...userData
                    });
                    setUserProfile(userData);
                    setEditForm({
                        profession: userData.profession || '',
                        education: userData.education || '',
                        hometown: userData.hometown || '',
                        bio: userData.bio || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile user:', error);
            }
        };

        fetchProfileUser();

        // Fetch reviews for this user
        let unsubscribeFn = null;
        const q = query(
            collection(db, 'reviews'),
            where('targetUserId', '==', targetUserId),
            orderBy('createdAt', 'desc')
        );

        unsubscribeFn = onSnapshot(
            q,
            (snapshot) => {
                const reviewsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setReviews(reviewsData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching reviews:', error);
                if (error.code === 'failed-precondition' || error.code === 'unavailable') {
                    const qWithoutOrder = query(
                        collection(db, 'reviews'),
                        where('targetUserId', '==', targetUserId)
                    );
                    unsubscribeFn = onSnapshot(
                        qWithoutOrder,
                        (snapshot) => {
                            const reviewsData = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })).sort((a, b) => {
                                const aTime = a.createdAt?.seconds || 0;
                                const bTime = b.createdAt?.seconds || 0;
                                return bTime - aTime;
                            });
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

        // Fetch completed deliveries count
        const bidsQuery = query(
            collection(db, 'bids'),
            where('bidderId', '==', targetUserId),
            where('status', '==', 'accepted')
        );
        onSnapshot(bidsQuery, (snapshot) => {
            setCompletedDeliveries(snapshot.size);
        });

        return () => {
            if (unsubscribeFn) unsubscribeFn();
        };
    }, [targetUserId]);

    const handleEditSave = async () => {
        if (!user || !isOwnProfile) return;
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, editForm);
        setUserProfile((prev) => ({ ...prev, ...editForm }));
        setIsEditing(false);
    };

    const handleProfilePicChange = async (e) => {
        if (!isOwnProfile) return;
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadImage(file, 'profile-pictures');
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { photoURL: url });
            setUserProfile((prev) => ({ ...prev, photoURL: url }));
            setProfileUser((prev) => ({ ...prev, photoURL: url }));
        } catch (err) {
            alert('Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e, field) => {
        setEditForm({
            ...editForm,
            [field]: e.target.value
        });
    };

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : 0;

    if (!profileUser) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="px-6 py-12">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <div className="relative">
                                {profileUser.photoURL ? (
                                    <img
                                        src={profileUser.photoURL}
                                        alt={profileUser.displayName}
                                        className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-primary text-3xl font-bold shadow-lg">
                                        {profileUser.displayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                {isOwnProfile && isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                        <Edit2 className="h-6 w-6 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} disabled={uploading} />
                                    </label>
                                )}
                            </div>

                            <div className="space-y-3">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.displayName || profileUser.displayName}
                                        onChange={(e) => handleInputChange(e, 'displayName')}
                                        className="text-4xl font-bold bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                                    />
                                ) : (
                                    <h1 className="text-4xl font-bold text-gray-900">{profileUser.displayName}</h1>
                                )}

                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-gray-200">
                                        <Star className="h-4 w-4 fill-primary text-primary" />
                                        <span className="font-semibold text-gray-900">{averageRating}</span>
                                        <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                                    </div>

                                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-gray-200">
                                        <Award className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm text-gray-900">{completedDeliveries} Deliveries</span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        Joined {userProfile?.joinDate || new Date().getFullYear()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {isOwnProfile ? (
                                isEditing ? (
                                    <>
                                        <button
                                            onClick={handleEditSave}
                                            className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Edit Profile
                                    </button>
                                )
                            ) : (
                                <button
                                    onClick={() => navigate(`/messages?userId=${targetUserId}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Message
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">About</h2>
                        {isEditing ? (
                            <textarea
                                value={editForm.bio}
                                onChange={(e) => handleInputChange(e, 'bio')}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors h-24 resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-gray-600 text-lg">
                                {userProfile?.bio || 'No bio added yet.'}
                            </p>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Details</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Profession */}
                            <div className="p-4 rounded-lg bg-white border border-gray-200 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Briefcase className="h-4 w-4" />
                                    Profession
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.profession}
                                        onChange={(e) => handleInputChange(e, 'profession')}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm"
                                        placeholder="Your profession"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-900">{userProfile?.profession || 'Not specified'}</p>
                                )}
                            </div>

                            {/* Education */}
                            <div className="p-4 rounded-lg bg-white border border-gray-200 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <BookOpen className="h-4 w-4" />
                                    Education
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.education}
                                        onChange={(e) => handleInputChange(e, 'education')}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm"
                                        placeholder="Your education"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-900">{userProfile?.education || 'Not specified'}</p>
                                )}
                            </div>

                            {/* Hometown */}
                            <div className="p-4 rounded-lg bg-white border border-gray-200 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    Hometown
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.hometown}
                                        onChange={(e) => handleInputChange(e, 'hometown')}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm"
                                        placeholder="Your hometown"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-900">{userProfile?.hometown || 'Not specified'}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="p-4 rounded-lg bg-white border border-gray-200 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </div>
                                <p className="font-semibold text-gray-900">{profileUser.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Reviews ({reviews.length})</h2>

                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="p-12 text-center rounded-xl bg-white border border-gray-200">
                                <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No reviews yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-6 rounded-lg bg-white border border-gray-200 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                {review.reviewerPhotoURL ? (
                                                    <img
                                                        src={review.reviewerPhotoURL}
                                                        alt={review.reviewerName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                                        {review.reviewerName?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                                                    <p className="text-xs text-gray-500">
                                                        {review.createdAt?.seconds
                                                            ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                                                            : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${i < (review.rating || 0) ? 'fill-primary text-primary' : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Empty for now, can add stats later */}
                <div className="space-y-4">
                    {/* Future: Add activity stats, badges, etc. */}
                </div>
            </div>
        </div>
    );
}
