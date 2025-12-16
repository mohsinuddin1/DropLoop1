import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import IDUpload from './IDUpload';
import { X } from 'lucide-react';

export default function FirstTimeIDVerificationModal() {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const checkFirstTimeUser = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserProfile(userData);

                    // Show modal if:
                    // 1. User has no ID verification data
                    // 2. User hasn't skipped verification
                    const shouldShow = !userData.idVerification && !userData.idVerificationSkipped;
                    setShowModal(shouldShow);
                } else {
                    // New user - document doesn't exist yet
                    // Show the modal for ID verification
                    console.log('New user detected - showing ID verification modal');
                    setShowModal(true);
                }
            } catch (error) {
                console.error('Error checking user verification status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkFirstTimeUser();
    }, [user]);

    const handleSkip = async () => {
        if (!user) return;

        try {
            // Mark that user has skipped ID verification
            // Use setDoc with merge to work for both new and existing users
            await setDoc(doc(db, 'users', user.uid), {
                idVerificationSkipped: true,
                idVerificationSkippedAt: new Date()
            }, { merge: true });
            setShowModal(false);
        } catch (error) {
            console.error('Error skipping ID verification:', error);
        }
    };

    const handleIDUpload = async (idData) => {
        if (!user) return;

        try {
            // Use setDoc with merge to work for both new and existing users
            await setDoc(doc(db, 'users', user.uid), {
                idVerification: idData,
                idVerificationSkipped: false // Reset skip flag if they decide to verify
            }, { merge: true });
            setShowModal(false);
        } catch (error) {
            console.error('Error saving ID verification:', error);
            alert('Failed to submit ID. Please try again.');
        }
    };

    // Don't render anything if loading or modal shouldn't show
    if (loading || !showModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome to DropLoop! 🎉</h2>
                        <p className="text-sm text-gray-600 mt-1">Get verified to build trust with the community</p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Skip for now"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <IDUpload
                        onUploadComplete={handleIDUpload}
                        existingID={null}
                    />
                </div>

                {/* Footer with Skip Button */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            You can verify your ID later from your profile settings
                        </p>
                        <button
                            onClick={handleSkip}
                            className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                            Skip for Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
