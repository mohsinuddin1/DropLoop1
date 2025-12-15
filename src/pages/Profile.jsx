import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Star, Edit2, MapPin, Briefcase, BookOpen, MessageSquare, Award, Linkedin, Shield } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { uploadImage } from '../utils/uploadImage';
import IDUpload from '../components/IDUpload';
import VerifiedBadge from '../components/VerifiedBadge';

export default function Profile() {
    const { userId } = useParams(); // Get userId from URL if viewing someone else's profile
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [profileUser, setProfileUser] = useState(null); // The user whose profile we're viewing
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ profession: '', education: '', hometown: '', bio: '', linkedinUrl: '' });
    const [uploading, setUploading] = useState(false);
    const [completedDeliveries, setCompletedDeliveries] = useState(0);
    const [showIDModal, setShowIDModal] = useState(false);
    const [idVerification, setIdVerification] = useState(null);

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
                    setIdVerification(userData.idVerification || null);
                    setEditForm({
                        profession: userData.profession || '',
                        education: userData.education || '',
                        hometown: userData.hometown || '',
                        bio: userData.bio || '',
                        linkedinUrl: userData.linkedinUrl || ''
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

    const handleIDUpload = async (idData) => {
        if (!user || !isOwnProfile) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                idVerification: idData
            });
            setIdVerification(idData);
            setShowIDModal(false);
            alert('ID submitted successfully! It will be reviewed by our admin team.');
        } catch (err) {
            console.error('Error saving ID verification:', err);
            alert('Failed to submit ID. Please try again.');
        }
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
            <div className="mb-4 sm:mb-6 md:mb-8 rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="px-3 sm:px-6 py-6 sm:py-8 md:py-12">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 md:gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 md:gap-6">
                            <div className="relative">
                                {profileUser.photoURL ? (
                                    <img
                                        src={profileUser.photoURL}
                                        alt={profileUser.displayName}
                                        className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 rounded-full border-4 border-white shadow-lg object-cover"
                                    />
                                ) : (
                                    <div className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-primary text-xl sm:text-2xl md:text-3xl font-bold shadow-lg">
                                        {profileUser.displayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                {isOwnProfile && isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                        <Edit2 className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} disabled={uploading} />
                                    </label>
                                )}
                            </div>

                            <div className="space-y-2 sm:space-y-2.5 md:space-y-3 flex-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.displayName || profileUser.displayName}
                                        onChange={(e) => handleInputChange(e, 'displayName')}
                                        className="text-xl sm:text-2xl md:text-4xl font-bold bg-white border border-gray-300 rounded-lg px-3 py-1.5 sm:py-2 text-gray-900 w-full"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900">{profileUser.displayName}</h1>
                                        {idVerification?.status === 'approved' && (
                                            <VerifiedBadge variant="compact" size="lg" />
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 md:gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-white border border-gray-200 text-xs">
                                        <Star className="h-3 w-3 fill-primary text-primary" />
                                        <span className="font-semibold text-gray-900">{averageRating}</span>
                                        <span className="text-xs text-gray-500">({reviews.length})</span>
                                    </div>

                                    <div className="flex items-center gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-white border border-gray-200 text-xs">
                                        <Award className="h-3 w-3 text-purple-600" />
                                        <span className="text-xs text-gray-900">{completedDeliveries} Deliveries</span>
                                    </div>

                                    <div className="text-xs text-gray-600">
                                        Joined {userProfile?.joinDate || new Date().getFullYear()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                            {isOwnProfile ? (
                                isEditing ? (
                                    <>
                                        <button
                                            onClick={handleEditSave}
                                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                        <span className="hidden sm:inline">Edit Profile</span>
                                    </button>
                                )
                            ) : (
                                <button
                                    onClick={() => navigate(`/messages?userId=${targetUserId}`)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm"
                                >
                                    <MessageSquare className="h-3 w-3" />
                                    <span className="hidden sm:inline">Message</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
                    {/* About Section */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">About</h2>
                        {isEditing ? (
                            <textarea
                                value={editForm.bio}
                                onChange={(e) => handleInputChange(e, 'bio')}
                                className="w-full px-3 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors h-16 sm:h-20 md:h-24 resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-gray-600 text-xs sm:text-base md:text-lg">
                                {userProfile?.bio || 'No bio added yet.'}
                            </p>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">Details</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                            {/* Profession */}
                            <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-white border border-gray-200 space-y-1 sm:space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Briefcase className="h-3 w-3" />
                                    Profession
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.profession}
                                        onChange={(e) => handleInputChange(e, 'profession')}
                                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-xs"
                                        placeholder="Your profession"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">{userProfile?.profession || 'Not specified'}</p>
                                )}
                            </div>

                            {/* Education */}
                            <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-white border border-gray-200 space-y-1 sm:space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <BookOpen className="h-3 w-3" />
                                    Education
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.education}
                                        onChange={(e) => handleInputChange(e, 'education')}
                                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-xs"
                                        placeholder="Your education"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">{userProfile?.education || 'Not specified'}</p>
                                )}
                            </div>

                            {/* Hometown */}
                            <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-white border border-gray-200 space-y-1 sm:space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    Hometown
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.hometown}
                                        onChange={(e) => handleInputChange(e, 'hometown')}
                                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-xs"
                                        placeholder="Your hometown"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">{userProfile?.hometown || 'Not specified'}</p>
                                )}
                            </div>

                            {/* LinkedIn URL */}
                            <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-white border border-gray-200 space-y-1 sm:space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Linkedin className="h-3 w-3" />
                                    LinkedIn Profile
                                </div>
                                {isEditing ? (
                                    <input
                                        type="url"
                                        value={editForm.linkedinUrl}
                                        onChange={(e) => handleInputChange(e, 'linkedinUrl')}
                                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-xs"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                    />
                                ) : (
                                    userProfile?.linkedinUrl ? (
                                        <a
                                            href={userProfile.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-primary hover:text-indigo-700 text-xs sm:text-sm break-all underline"
                                        >
                                            View LinkedIn Profile
                                        </a>
                                    ) : (
                                        <p className="font-semibold text-gray-900 text-xs sm:text-sm">Not specified</p>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">Reviews ({reviews.length})</h2>

                        {loading ? (
                            <div className="text-center py-10 text-gray-500 text-xs sm:text-sm">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="p-8 sm:p-12 text-center rounded-xl bg-white border border-gray-200">
                                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-xs sm:text-sm">No reviews yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-2.5 sm:p-3 md:p-6 rounded-lg bg-white border border-gray-200 space-y-2 sm:space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-3">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                {review.reviewerPhotoURL ? (
                                                    <img
                                                        src={review.reviewerPhotoURL}
                                                        alt={review.reviewerName}
                                                        className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">
                                                        {review.reviewerName?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">{review.reviewerName}</h3>
                                                    <p className="text-xs text-gray-500">
                                                        {review.createdAt?.seconds
                                                            ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                                                            : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${i < (review.rating || 0) ? 'fill-primary text-primary' : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 text-xs sm:text-sm">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - ID Verification */}
                <div className="space-y-4">
                    {/* ID Verification Card */}
                    {isOwnProfile && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">ID Verification</h3>
                                    <p className="text-xs text-gray-600">Get verified</p>
                                </div>
                            </div>

                            {idVerification ? (
                                <div className="space-y-3">
                                    {idVerification.status === 'approved' && (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <VerifiedBadge size="md" />
                                        </div>
                                    )}
                                    {idVerification.status === 'pending' && (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm font-medium text-yellow-900">Under Review</p>
                                            <p className="text-xs text-yellow-700 mt-1">Your ID is being verified</p>
                                        </div>
                                    )}
                                    {idVerification.status === 'rejected' && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm font-medium text-red-900">Verification Failed</p>
                                            <p className="text-xs text-red-700 mt-1">Please resubmit</p>
                                        </div>
                                    )}
                                    {idVerification.status !== 'approved' && (
                                        <button
                                            onClick={() => setShowIDModal(true)}
                                            className="w-full px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                        >
                                            {idVerification.status === 'rejected' ? 'Resubmit ID' : 'View Status'}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowIDModal(true)}
                                    className="w-full px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <Shield className="h-4 w-4" />
                                    <span>Verify Your ID</span>
                                </button>
                            )}

                            <p className="text-xs text-gray-500">
                                Get a verified badge on your profile to build trust
                            </p>
                        </div>
                    )}

                    {/* If viewing someone else's profile, show their verification status */}
                    {!isOwnProfile && idVerification?.status === 'approved' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Shield className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <VerifiedBadge size="md" />
                                    <p className="text-xs text-gray-600 mt-1">Verified User</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ID Upload Modal */}
            {showIDModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">ID Verification</h2>
                            <button
                                onClick={() => setShowIDModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="text-gray-500 text-2xl">&times;</span>
                            </button>
                        </div>
                        <IDUpload
                            onUploadComplete={handleIDUpload}
                            existingID={idVerification}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
