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
    const [postType, setPostType] = useState('travel'); // 'travel' or 'item'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Common fields
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');

    // Travel specific
    const [mode, setMode] = useState('flight'); // flight, train, bus, car

    // Item specific
    const [itemName, setItemName] = useState('');
    const [itemWeight, setItemWeight] = useState('');
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
                date, // Travel date or Delivery deadline
                userId: user.uid,
                userDisplayName: user.displayName,
                userPhotoURL: user.photoURL,
                status: 'open',
                createdAt: serverTimestamp(),
            };

            if (postType === 'travel') {
                postData.mode = mode;
            } else {
                postData.itemName = itemName;
                postData.itemWeight = itemWeight;
                postData.description = description;

                if (imageFile) {
                    const imageUrl = await uploadImage(imageFile, 'item-images');
                    postData.imageUrl = imageUrl;
                }
            }

            await addDoc(collection(db, 'posts'), postData);
            navigate('/posts');
        } catch (err) {
            console.error("Error adding document: ", err);
            setError('Failed to create post. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create a New Post</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-4 text-center font-medium text-sm flex items-center justify-center gap-2 ${postType === 'travel' ? 'bg-indigo-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setPostType('travel')}
                    >
                        <Plane className="w-5 h-5" />
                        I am Travelling
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-medium text-sm flex items-center justify-center gap-2 ${postType === 'item' ? 'bg-indigo-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setPostType('item')}
                    >
                        <Package className="w-5 h-5" />
                        I Want to Send an Item
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 border"
                                    placeholder="City, Country"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 border"
                                    placeholder="City, Country"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {postType === 'travel' ? 'Date of Travel' : 'Latest Delivery Date'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                required
                                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 border"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {postType === 'travel' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Transport</label>
                            <select
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 border px-3"
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                            >
                                <option value="flight">Flight</option>
                                <option value="train">Train</option>
                                <option value="bus">Bus</option>
                                <option value="car">Car</option>
                            </select>
                        </div>
                    )}

                    {postType === 'item' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 border px-3"
                                    placeholder="e.g., Laptop, Documents, Clothes"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Approx Weight (kg)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Weight className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 border"
                                        placeholder="2.5"
                                        value={itemWeight}
                                        onChange={(e) => setItemWeight(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 border px-3"
                                    placeholder="Any specific details about the item..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Image (Optional)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {imageFile ? (
                                            <div className="relative">
                                                <img
                                                    src={URL.createObjectURL(imageFile)}
                                                    alt="Preview"
                                                    className="mx-auto h-48 object-cover rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setImageFile(null)}
                                                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                if (e.target.files[0]) setImageFile(e.target.files[0]);
                                                            }}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
