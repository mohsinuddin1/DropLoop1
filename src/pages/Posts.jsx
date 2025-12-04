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
        const matchesFilter = filter === 'all' || post.type === filter;
        const matchesSearch =
            post.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.itemName && post.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Recent Posts</h1>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 border"
                            placeholder="Search locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex rounded-md shadow-sm">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${filter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('travel')}
                            className={`px-4 py-2 text-sm font-medium border-t border-b ${filter === 'travel' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            Travellers
                        </button>
                        <button
                            onClick={() => setFilter('item')}
                            className={`px-4 py-2 text-sm font-medium rounded-r-md border ${filter === 'item' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            Senders
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
