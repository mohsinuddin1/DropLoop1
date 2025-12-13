import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { AlertCircle, Mail } from 'lucide-react';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Check if email is verified
    if (!user.emailVerified) {
        const handleResendEmail = async () => {
            try {
                setSendingEmail(true);
                await sendEmailVerification(user);
                setEmailSent(true);
            } catch (error) {
                console.error('Error sending verification email:', error);
                alert('Failed to send verification email. Please try again later.');
            } finally {
                setSendingEmail(false);
            }
        };

        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-yellow-100 rounded-full p-3">
                                <AlertCircle className="h-8 w-8 text-yellow-600" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Email Verification Required
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Please verify your email address to access this feature.
                            We've sent a verification link to <strong>{user.email}</strong>
                        </p>

                        {emailSent && (
                            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                <Mail className="inline h-4 w-4 mr-2" />
                                Verification email sent! Please check your inbox.
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={handleResendEmail}
                                disabled={sendingEmail || emailSent}
                                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {sendingEmail ? 'Sending...' : emailSent ? 'Email Sent' : 'Resend Verification Email'}
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                            >
                                I've Verified My Email
                            </button>
                        </div>

                        <p className="mt-6 text-sm text-gray-500">
                            Can't find the email? Check your spam folder or use the button above to resend.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
