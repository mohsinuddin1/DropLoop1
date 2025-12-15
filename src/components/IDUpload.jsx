import { useState } from 'react';
import { Shield, Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { uploadImage } from '../utils/uploadImage';

const ID_TYPES = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'voter', label: 'Voter ID' },
    { value: 'driving', label: 'Driving License' },
    { value: 'passport', label: 'Passport' }
];

export default function IDUpload({ onUploadComplete, existingID }) {
    const [idType, setIdType] = useState(existingID?.idType || '');
    const [frontImage, setFrontImage] = useState(existingID?.frontImageUrl || null);
    const [backImage, setBackImage] = useState(existingID?.backImageUrl || null);
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (side, file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload only image files');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setError('');
        if (side === 'front') {
            setFrontFile(file);
            setFrontImage(URL.createObjectURL(file));
        } else {
            setBackFile(file);
            setBackImage(URL.createObjectURL(file));
        }
    };

    const handleRemove = (side) => {
        if (side === 'front') {
            setFrontFile(null);
            setFrontImage(null);
        } else {
            setBackFile(null);
            setBackImage(null);
        }
    };

    const handleSubmit = async () => {
        if (!idType) {
            setError('Please select an ID type');
            return;
        }

        if (!frontFile && !frontImage) {
            setError('Please upload the front side of your ID');
            return;
        }

        if (!backFile && !backImage) {
            setError('Please upload the back side of your ID');
            return;
        }

        setUploading(true);
        setError('');

        try {
            let frontUrl = frontImage;
            let backUrl = backImage;

            // Upload new files if they exist
            if (frontFile) {
                frontUrl = await uploadImage(frontFile, 'id-verifications');
            }
            if (backFile) {
                backUrl = await uploadImage(backFile, 'id-verifications');
            }

            const idData = {
                idType,
                frontImageUrl: frontUrl,
                backImageUrl: backUrl,
                status: 'pending',
                submittedAt: new Date()
            };

            onUploadComplete(idData);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">Verify Your Identity</h3>
                    <p className="text-sm text-blue-700">
                        Upload a government-issued ID to get verified. Your ID will be reviewed by our admin team.
                        Once approved, you'll receive a verified badge on your profile.
                    </p>
                </div>
            </div>

            {/* Existing verification status */}
            {existingID && (
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${existingID.status === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : existingID.status === 'rejected'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    {existingID.status === 'approved' && (
                        <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-green-900">ID Verified ✓</p>
                                <p className="text-sm text-green-700">Your identity has been verified</p>
                            </div>
                        </>
                    )}
                    {existingID.status === 'pending' && (
                        <>
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-yellow-900">Verification Pending</p>
                                <p className="text-sm text-yellow-700">Your ID is under review</p>
                            </div>
                        </>
                    )}
                    {existingID.status === 'rejected' && (
                        <>
                            <X className="h-5 w-5 text-red-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-red-900">Verification Rejected</p>
                                <p className="text-sm text-red-700">
                                    {existingID.rejectionReason || 'Please upload a clear image and try again'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ID Type Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Select ID Type *
                </label>
                <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    disabled={existingID?.status === 'approved'}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">Choose an ID type...</option>
                    {ID_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>

            {/* Upload Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front Side */}
                <ImageUploadBox
                    label="Front Side *"
                    image={frontImage}
                    onFileChange={(file) => handleFileChange('front', file)}
                    onRemove={() => handleRemove('front')}
                    disabled={existingID?.status === 'approved'}
                />

                {/* Back Side */}
                <ImageUploadBox
                    label="Back Side *"
                    image={backImage}
                    onFileChange={(file) => handleFileChange('back', file)}
                    onRemove={() => handleRemove('back')}
                    disabled={existingID?.status === 'approved'}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                </div>
            )}

            {/* Submit Button */}
            {existingID?.status !== 'approved' && (
                <button
                    onClick={handleSubmit}
                    disabled={uploading || !idType || (!frontFile && !frontImage) || (!backFile && !backImage)}
                    className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-5 w-5" />
                            <span>{existingID ? 'Update ID' : 'Submit for Verification'}</span>
                        </>
                    )}
                </button>
            )}

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-900 mb-1">Privacy & Security</p>
                    <p>
                        Your ID documents are encrypted and stored securely. They will only be used for
                        verification purposes and will not be shared with anyone.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ImageUploadBox({ label, image, onFileChange, onRemove, disabled }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className={`relative border-2 border-dashed rounded-lg overflow-hidden ${image ? 'border-primary' : 'border-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}`}>
                {image ? (
                    <div className="relative aspect-[3/2] bg-gray-100">
                        <img
                            src={image}
                            alt={label}
                            className="w-full h-full object-contain"
                        />
                        {!disabled && (
                            <button
                                onClick={onRemove}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <label className={`flex flex-col items-center justify-center aspect-[3/2] bg-gray-50 ${disabled ? '' : 'hover:bg-gray-100'
                        } transition-colors`}>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        {!disabled && (
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onFileChange(e.target.files[0])}
                            />
                        )}
                    </label>
                )}
            </div>
        </div>
    );
}
