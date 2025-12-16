import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import PostCard from '../components/PostCard';
import BidModal from '../components/BidModal';
import { Search, Filter } from 'lucide-react';

export default function Posts() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, travel, item
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedPost, setSelectedPost] = useState(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setLoading(false);
            // Check for permission denied
            if (error.code === 'permission-denied') {
                console.error("Firestore permission denied. Make sure Firestore security rules are deployed and allow public read access to posts collection.");
                // Don't show alert to users, just log it - rules should be fixed by admin
            }
        });

        return () => unsubscribe();
    }, []);

    const filteredPosts = posts.filter(post => {
        // Filter logic:
        // 'all' - show all posts
        // 'sender' - show travel posts (travelers who can deliver for senders)
        // 'traveler' - show item posts (items that travelers can deliver)
        let matchesFilter = true;
        if (filter === 'sender') {
            matchesFilter = post.type === 'travel'; // Senders see travelers
        } else if (filter === 'traveler') {
            matchesFilter = post.type === 'item'; // Travelers see items to deliver
        }

        // Helper function to safely convert value to searchable string
        const toSearchString = (value) => {
            if (!value) return '';
            if (typeof value === 'string') return value.toLowerCase();
            if (typeof value === 'object') return JSON.stringify(value).toLowerCase();
            return String(value).toLowerCase();
        };

        const matchesSearch =
            toSearchString(post.from).includes(searchTerm.toLowerCase()) ||
            toSearchString(post.to).includes(searchTerm.toLowerCase()) ||
            (post.itemName && toSearchString(post.itemName).includes(searchTerm.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    const handleBid = (post) => {
        if (!user) {
            // Redirect to login page if user is not authenticated
            navigate('/login');
            return;
        }
        setSelectedPost(post);
        setIsBidModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900">Browse Posts</h1>
                        <p className="text-gray-600">Find items to deliver or travelers on your route</p>
                    </div>
                    <button
                        onClick={() => navigate('/create')}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Post
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by location or item..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${filter === 'all'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="h-4 w-4 inline mr-2" />
                            All Posts
                        </button>
                        <button
                            onClick={() => setFilter('sender')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${filter === 'sender'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            For Senders
                        </button>
                        <button
                            onClick={() => setFilter('traveler')}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${filter === 'traveler'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            For Travelers
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <PostCard key={post.id} post={post} onBid={handleBid} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No posts found matching your criteria.
                        </div>
                    )}
                </div>
            )}

            {selectedPost && (
                <BidModal
                    post={selectedPost}
                    isOpen={isBidModalOpen}
                    onClose={() => setIsBidModalOpen(false)}
                />
            )}
        </div>
    );
}
