import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Edit2, Trash2, Plus } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';

export function ManualCitiesTab({ loading }) {
    const [manualEntries, setManualEntries] = useState([]);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editCity, setEditCity] = useState('');
    const [editState, setEditState] = useState('');
    const [editStateCode, setEditStateCode] = useState('');
    const [loadingEntries, setLoadingEntries] = useState(true);

    useEffect(() => {
        fetchManualEntries();
    }, []);

    const fetchManualEntries = async () => {
        try {
            setLoadingEntries(true);

            // Get all posts with manual locations
            const postsSnapshot = await getDocs(collection(db, 'posts'));
            const manualLocations = new Map();

            postsSnapshot.docs.forEach(doc => {
                const post = doc.data();

                // Check from location
                if (post.from?.isManual) {
                    const key = `${post.from.city}-${post.from.state}`;
                    if (!manualLocations.has(key)) {
                        manualLocations.set(key, {
                            city: post.from.city,
                            state: post.from.state,
                            count: 1,
                            firstUsed: post.createdAt
                        });
                    } else {
                        manualLocations.get(key).count++;
                    }
                }

                // Check to location
                if (post.to?.isManual) {
                    const key = `${post.to.city}-${post.to.state}`;
                    if (!manualLocations.has(key)) {
                        manualLocations.set(key, {
                            city: post.to.city,
                            state: post.to.state,
                            count: 1,
                            firstUsed: post.createdAt
                        });
                    } else {
                        manualLocations.get(key).count++;
                    }
                }
            });

            // Get already approved cities
            const approvedSnapshot = await getDocs(collection(db, 'customCities'));
            const approvedKeys = new Set(
                approvedSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return `${data.city}-${data.state}`;
                })
            );

            // Filter out already approved
            const pending = Array.from(manualLocations.entries())
                .filter(([key]) => !approvedKeys.has(key))
                .map(([key, data]) => ({ ...data, id: key }))
                .sort((a, b) => b.count - a.count);

            setManualEntries(pending);
        } catch (error) {
            console.error('Error fetching manual entries:', error);
        } finally {
            setLoadingEntries(false);
        }
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry.id);
        setEditCity(entry.city);
        setEditState(entry.state);
        // Try to auto-detect state code
        setEditStateCode(getStateCode(entry.state));
    };

    const handleApprove = async (entry) => {
        try {
            const cityData = editingEntry === entry.id
                ? {
                    city: editCity.trim(),
                    state: editState.trim(),
                    code: editStateCode.trim().toUpperCase() || 'XX'
                }
                : {
                    city: entry.city,
                    state: entry.state,
                    code: getStateCode(entry.state)
                };

            // Add to customCities collection
            await addDoc(collection(db, 'customCities'), {
                ...cityData,
                approvedAt: serverTimestamp(),
                usageCount: entry.count
            });

            // Remove from pending list
            setManualEntries(prev => prev.filter(e => e.id !== entry.id));
            setEditingEntry(null);

            alert(`✅ Added "${cityData.city}, ${cityData.state}" to city database!`);
        } catch (error) {
            console.error('Error approving city:', error);
            alert('Error approving city. Please try again.');
        }
    };

    const handleReject = (entry) => {
        // Just remove from pending list (it stays in posts, just won't show as pending)
        setManualEntries(prev => prev.filter(e => e.id !== entry.id));
    };

    const getStateCode = (stateName) => {
        const stateCodeMap = {
            'Maharashtra': 'MH', 'Delhi': 'DL', 'Karnataka': 'KA',
            'Tamil Nadu': 'TN', 'Gujarat': 'GJ', 'West Bengal': 'WB',
            'Uttar Pradesh': 'UP', 'Rajasthan': 'RJ', 'Madhya Pradesh': 'MP',
            'Bihar': 'BR', 'Telangana': 'TG', 'Andhra Pradesh': 'AP',
            'Kerala': 'KL', 'Punjab': 'PB', 'Haryana': 'HR',
            'Jharkhand': 'JH', 'Assam': 'AS', 'Odisha': 'OR',
            'Chhattisgarh': 'CG', 'Uttarakhand': 'UK', 'Himachal Pradesh': 'HP',
            'Jammu and Kashmir': 'JK', 'Goa': 'GA', 'Puducherry': 'PY',
            'Chandigarh': 'CH', 'Tripura': 'TR', 'Meghalaya': 'ML',
            'Manipur': 'MN', 'Nagaland': 'NL', 'Mizoram': 'MZ',
            'Arunachal Pradesh': 'AR', 'Sikkim': 'SK', 'Ladakh': 'LA',
            'Andaman and Nicobar Islands': 'AN'
        };
        return stateCodeMap[stateName] || 'XX';
    };

    if (loadingEntries) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading manual city entries...</p>
                </div>
            </div>
        );
    }

    if (manualEntries.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Manual Cities</h3>
                <p className="text-gray-500">
                    When users manually enter cities not in the database, they'll appear here for review.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Manual City Entries ({manualEntries.length})
                </h3>
                <p className="text-sm text-blue-700">
                    Review cities that users manually entered. Edit spelling if needed and approve to add them to the searchable database.
                </p>
            </div>

            <div className="grid gap-4">
                {manualEntries.map((entry) => (
                    <div
                        key={entry.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                        {editingEntry === entry.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-amber-700 font-medium mb-2">
                                    <Edit2 className="h-4 w-4" />
                                    <span>Editing Entry</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={editCity}
                                        onChange={(e) => setEditCity(e.target.value)}
                                        placeholder="City name"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    />
                                    <input
                                        type="text"
                                        value={editState}
                                        onChange={(e) => setEditState(e.target.value)}
                                        placeholder="State name"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    />
                                    <input
                                        type="text"
                                        value={editStateCode}
                                        onChange={(e) => setEditStateCode(e.target.value)}
                                        placeholder="Code (e.g., MH)"
                                        maxLength="2"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary uppercase"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(entry)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve & Add
                                    </button>
                                    <button
                                        onClick={() => setEditingEntry(null)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-amber-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {entry.city}, {entry.state}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Used {entry.count} time{entry.count > 1 ? 's' : ''} in posts
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(entry)}
                                        className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleApprove(entry)}
                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(entry)}
                                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
