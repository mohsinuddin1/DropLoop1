import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Plane, Package, Calendar, MapPin, Weight, Clock, Image as ImageIcon, Loader } from 'lucide-react';
import { uploadImage } from '../utils/uploadImage';

export default function CreatePost() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [postType, setPostType] = useState('item'); // 'travel' or 'item'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Common fields
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');

    // Travel specific
    const [mode, setMode] = useState('flight'); // flight, train, bus, car

    // Item specific
    const [itemName, setItemName] = useState('');
    const [itemWeight, setItemWeight] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const postData = {
                type: postType,
                from,
                to,
                departureDate,
                arrivalDate,
                userId: user.uid,
                userDisplayName: user.displayName,
                userPhotoURL: user.photoURL,
                status: 'open',
                createdAt: serverTimestamp(),
            };

            if (postType === 'travel') {
                postData.mode = mode;
                if (offerPrice) postData.offerPrice = Number(offerPrice);
            } else {
                postData.itemName = itemName;
                postData.itemWeight = itemWeight;
                if (offerPrice) postData.offerPrice = Number(offerPrice);
                postData.description = description;

                if (imageFile) {
                    const imageUrl = await uploadImage(imageFile, 'item-images');
                    postData.imageUrl = imageUrl;
                }
            }

            const newPost = await addDoc(collection(db, 'posts'), postData);
            navigate(`/posts/${newPost.id}`);
        } catch (err) {
            console.error("Error adding document: ", err);
            setError('Failed to create post. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Post</h1>
                <p className="text-gray-600">Share what you're traveling with or sending</p>
            </div>

            {/* Tab Selection - Card Style */}
            <div className="grid grid-cols-2 gap-4 mb-12">
                <button
                    onClick={() => setPostType('item')}
                    className={`p-6 rounded-xl border-2 transition-all text-left space-y-3 ${postType === 'item'
                        ? 'border-primary bg-indigo-50'
                        : 'border-gray-200 hover:border-primary/50 bg-white'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Package className={`h-6 w-6 ${postType === 'item' ? 'text-primary' : 'text-gray-400'}`} />
                        <h3 className="font-semibold text-gray-900">I Want to Send an Item</h3>
                    </div>
                    <p className="text-sm text-gray-600">Post items you want to send with a traveler</p>
                </button>

                <button
                    onClick={() => setPostType('travel')}
                    className={`p-6 rounded-xl border-2 transition-all text-left space-y-3 ${postType === 'travel'
                        ? 'border-primary bg-indigo-50'
                        : 'border-gray-200 hover:border-primary/50 bg-white'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Plane className={`h-6 w-6 ${postType === 'travel' ? 'text-primary' : 'text-gray-400'}`} />
                        <h3 className="font-semibold text-gray-900">I am Travelling</h3>
                    </div>
                    <p className="text-sm text-gray-600">Share your travel route and earn money carrying items</p>
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">{error}</div>}

                {/* Route Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Route Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">From</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Departure city"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">To</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Destination city"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                {postType === 'travel' ? 'Departure Date' : 'Pickup Date'}
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    value={departureDate}
                                    onChange={(e) => setDepartureDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                {postType === 'travel' ? 'Arrival Date' : 'Delivery Date'}
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    value={arrivalDate}
                                    onChange={(e) => setArrivalDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Item/Travel Specific Fields */}
                {postType === 'item' ? (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Item Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Electronics, Documents, Clothes"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Weight</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    placeholder="e.g., 2kg"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    value={itemWeight}
                                    onChange={(e) => setItemWeight(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Offer Price (Optional)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., ₹500"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    value={offerPrice}
                                    onChange={(e) => setOfferPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                placeholder="Describe the item, any fragile/special instructions"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors h-24 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Item Photo (Optional)</label>
                            <div className="relative">
                                {!imageFile ? (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files[0]) setImageFile(e.target.files[0]);
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={URL.createObjectURL(imageFile)}
                                            alt="Item"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setImageFile(null)}
                                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Travel Details</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Transport Mode</label>
                            <select
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                            >
                                <option value="flight">Flight</option>
                                <option value="train">Train</option>
                                <option value="bus">Bus</option>
                                <option value="car">Car</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Capacity</label>
                            <input
                                type="text"
                                placeholder="e.g., 5kg, 2 packages"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Offer Price (Optional)</label>
                            <input
                                type="number"
                                placeholder="e.g., ₹500"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                value={offerPrice}
                                onChange={(e) => setOfferPrice(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Additional Details</label>
                            <textarea
                                placeholder="Any special notes, restrictions, or additional information"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors h-24 resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4 pt-8 border-t border-gray-200">
                    <button
                        type="button"
                        className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Save as Draft
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Publishing...' : 'Publish Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
