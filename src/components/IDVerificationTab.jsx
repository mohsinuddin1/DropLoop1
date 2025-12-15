import { useState, useEffect } from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase/client';

// Add this admin verification tab component to Admin Dashboard
export function IDVerificationTab({ users, onApprove, onReject, loading }) {
    const pendingVerifications = users.filter(u => u.idVerification?.status === 'pending');

    if (loading) return <div className="text-center py-12">Loading...</div>;

    if (pendingVerifications.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Verifications</h3>
                <p className="text-gray-600">All ID submissions have been reviewed</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    ID Verification Requests ({pendingVerifications.length})
                </h2>
            </div>

            <div className="grid gap-6">
                {pendingVerifications.map(user => (
                    <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* User Info */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Submitted: {user.idVerification?.submittedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                    </p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                                Pending Review
                            </div>
                        </div>

                        {/* ID Type */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">ID Type:</p>
                            <p className="font-semibold text-gray-900 capitalize">
                                {user.idVerification?.idType?.replace('-', ' ') || 'Not specified'}
                            </p>
                        </div>

                        {/* ID Images */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Front Image */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Front Side</label>
                                <div className="border-2 border-gray-200 rounded-lg overflow-hidden aspect-[3/2] bg-gray-50">
                                    {user.idVerification?.frontImageUrl ? (
                                        <img
                                            src={user.idVerification.frontImageUrl}
                                            alt="ID Front"
                                            className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(user.idVerification.frontImageUrl, '_blank')}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No image uploaded
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Back Image */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Back Side</label>
                                <div className="border-2 border-gray-200 rounded-lg overflow-hidden aspect-[3/2] bg-gray-50">
                                    {user.idVerification?.backImageUrl ? (
                                        <img
                                            src={user.idVerification.backImageUrl}
                                            alt="ID Back"
                                            className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(user.idVerification.backImageUrl, '_blank')}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No image uploaded
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => onApprove(user.id)}
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Approve Verification</span>
                            </button>
                            <button
                                onClick={() => onReject(user.id)}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>Reject</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
