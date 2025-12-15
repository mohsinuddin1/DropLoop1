import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, getDocs, where, writeBatch, addDoc, serverTimestamp, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import {
    Trash2, AlertCircle, Package, Plane, Users, Shield, Search, Filter, Archive,
    RotateCcw, Eye, Trash, UserX, Ban, TrendingUp, BarChart3, Flag,
    CheckCircle, XCircle, Edit, Star, MessageSquare, DollarSign, Calendar, CheckCircle2, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IDVerificationTab } from '../components/IDVerificationTab';
import { ManualCitiesTab } from '../components/ManualCitiesTab';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'mohsinuddin64@gmail.com';

// Tabs configuration
const TABS = {
    POSTS: 'posts',
    USERS: 'users',
    BIDS: 'bids',
    ANALYTICS: 'analytics',
    REPORTS: 'reports',
    ID_VERIFICATION: 'id_verification',
    MANUAL_CITIES: 'manual_cities'
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Tab state
    const [activeTab, setActiveTab] = useState(TABS.POSTS);

    // Data states
    const [posts, setPosts] = useState([]);
    const [deletedPosts, setDeletedPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [bids, setBids] = useState([]);
    const [reports, setReports] = useState([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('active');

    // Action states
    const [deleting, setDeleting] = useState(null);
    const [restoring, setRestoring] = useState(null);
    const [banning, setBanning] = useState(null);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [postToDelete, setPostToDelete] = useState(null);

    // Statistics
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalUsers: 0,
        totalBids: 0,
        deletedPosts: 0,
        bannedUsers: 0,
        openReports: 0,
        travelPosts: 0,
        itemPosts: 0,
        activeUsers7Days: 0,
        totalRevenue: 0,
        pendingVerifications: 0
    });

    // Check if user is admin
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.email !== ADMIN_EMAIL) {
            navigate('/');
            return;
        }
    }, [user, navigate]);

    // Fetch all data
    useEffect(() => {
        if (!user || user.email !== ADMIN_EMAIL) return;

        const unsubscribers = [];

        // Fetch posts
        const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const postsUnsub = onSnapshot(postsQuery, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
            updatePostsStats(postsData);
        });
        unsubscribers.push(postsUnsub);

        // Fetch deleted posts
        const deletedQuery = query(collection(db, 'deletedPosts'), orderBy('deletedAt', 'desc'));
        const deletedUnsub = onSnapshot(deletedQuery, (snapshot) => {
            const deletedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDeletedPosts(deletedData);
            setStats(prev => ({ ...prev, deletedPosts: deletedData.length }));
        });
        unsubscribers.push(deletedUnsub);

        // Fetch users
        const usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
            updateUsersStats(usersData);
        });
        unsubscribers.push(usersUnsub);

        // Fetch bids
        const bidsQuery = query(collection(db, 'bids'), orderBy('createdAt', 'desc'));
        const bidsUnsub = onSnapshot(bidsQuery, (snapshot) => {
            const bidsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBids(bidsData);
            setStats(prev => ({ ...prev, totalBids: bidsData.length }));
        });
        unsubscribers.push(bidsUnsub);

        setLoading(false);

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    // Update posts statistics
    const updatePostsStats = (postsData) => {
        setStats(prev => ({
            ...prev,
            totalPosts: postsData.length,
            travelPosts: postsData.filter(p => p.type === 'travel').length,
            itemPosts: postsData.filter(p => p.type === 'item').length
        }));
    };

    // Update users statistics
    const updateUsersStats = (usersData) => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        setStats(prev => ({
            ...prev,
            totalUsers: usersData.length,
            bannedUsers: usersData.filter(u => u.banned).length,
            activeUsers7Days: usersData.filter(u => {
                if (!u.lastActive) return false;
                const lastActive = u.lastActive.toDate ? u.lastActive.toDate() : new Date(u.lastActive);
                return lastActive >= sevenDaysAgo;
            }).length,
            pendingVerifications: usersData.filter(u => u.idVerification?.status === 'pending').length
        }));
    };

    // --- POST MANAGEMENT FUNCTIONS ---

    const handleDeletePost = (postId) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        setDeleting(postToDelete);
        setShowDeleteModal(false);

        try {
            const post = posts.find(p => p.id === postToDelete);
            if (!post) throw new Error('Post not found');

            const bidsQuery = query(collection(db, 'bids'), where('postId', '==', postToDelete));
            const bidsSnapshot = await getDocs(bidsQuery);
            const relatedBids = bidsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            await addDoc(collection(db, 'deletedPosts'), {
                originalPostId: postToDelete,
                postData: post,
                relatedBids: relatedBids,
                deletedBy: user.email,
                deletedByName: user.displayName || 'Admin',
                deletedAt: serverTimestamp(),
                deleteReason: deleteReason || 'No reason provided',
                canRestore: true
            });

            const batch = writeBatch(db);
            batch.delete(doc(db, 'posts', postToDelete));
            bidsSnapshot.forEach(bidDoc => batch.delete(bidDoc.ref));
            await batch.commit();

            setDeleteReason('');
            setPostToDelete(null);
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. ' + (error.message || 'Please try again.'));
        } finally {
            setDeleting(null);
        }
    };

    const handleRestorePost = async (deletedPostId) => {
        if (!confirm('Restore this post?')) return;
        setRestoring(deletedPostId);

        try {
            const deletedPost = deletedPosts.find(p => p.id === deletedPostId);
            if (!deletedPost) throw new Error('Deleted post not found');

            const batch = writeBatch(db);
            batch.set(doc(db, 'posts', deletedPost.originalPostId), deletedPost.postData);

            if (deletedPost.relatedBids?.length > 0) {
                deletedPost.relatedBids.forEach(bid => {
                    batch.set(doc(db, 'bids', bid.id), bid);
                });
            }

            await batch.commit();
            await deleteDoc(doc(db, 'deletedPosts', deletedPostId));
        } catch (error) {
            console.error('Error restoring post:', error);
            alert('Failed to restore post.');
        } finally {
            setRestoring(null);
        }
    };

    const handleFeaturePost = async (postId) => {
        try {
            const post = posts.find(p => p.id === postId);
            await updateDoc(doc(db, 'posts', postId), {
                featured: !post.featured,
                featuredAt: !post.featured ? serverTimestamp() : null
            });
        } catch (error) {
            console.error('Error featuring post:', error);
            alert('Failed to feature post.');
        }
    };

    // --- USER MANAGEMENT FUNCTIONS ---

    const handleBanUser = async (userId) => {
        const targetUser = users.find(u => u.id === userId);
        if (!confirm(`${targetUser.banned ? 'Unban' : 'Ban'} user ${targetUser.displayName}?`)) return;

        setBanning(userId);
        try {
            await updateDoc(doc(db, 'users', userId), {
                banned: !targetUser.banned,
                bannedAt: !targetUser.banned ? serverTimestamp() : null,
                bannedBy: user.email
            });
        } catch (error) {
            console.error('Error banning user:', error);
            alert('Failed to ban/unban user.');
        } finally {
            setBanning(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        const targetUser = users.find(u => u.id === userId);
        if (!confirm(`Permanently delete user ${targetUser.displayName}? This will delete all their posts and bids.`)) return;

        try {
            const batch = writeBatch(db);

            // Delete user's posts
            const userPosts = posts.filter(p => p.userId === userId);
            userPosts.forEach(post => batch.delete(doc(db, 'posts', post.id)));

            // Delete user's bids
            const userBids = bids.filter(b => b.bidderId === userId);
            userBids.forEach(bid => batch.delete(doc(db, 'bids', bid.id)));

            // Delete user
            batch.delete(doc(db, 'users', userId));

            await batch.commit();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user.');
        }
    };

    // --- BID MANAGEMENT FUNCTIONS ---

    const handleDeleteBid = async (bidId) => {
        if (!confirm('Delete this bid?')) return;

        try {
            await deleteDoc(doc(db, 'bids', bidId));
        } catch (error) {
            console.error('Error deleting bid:', error);
            alert('Failed to delete bid.');
        }
    };

    // --- ID VERIFICATION FUNCTIONS ---

    const handleApproveID = async (userId) => {
        if (!confirm('Approve this ID verification?')) return;

        try {
            await updateDoc(doc(db, 'users', userId), {
                'idVerification.status': 'approved',
                'idVerification.approvedAt': serverTimestamp(),
                'idVerification.approvedBy': user.email
            });
        } catch (error) {
            console.error('Error approving ID:', error);
            alert('Failed to approve ID verification.');
        }
    };

    const handleRejectID = async (userId) => {
        const reason = prompt('Enter reason for rejection:');
        if (!reason) return;

        try {
            await updateDoc(doc(db, 'users', userId), {
                'idVerification.status': 'rejected',
                'idVerification.rejectedAt': serverTimestamp(),
                'idVerification.rejectedBy': user.email,
                'idVerification.rejectionReason': reason
            });
        } catch (error) {
            console.error('Error rejecting ID:', error);
            alert('Failed to reject ID verification.');
        }
    };

    // Filter functions
    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchTerm ||
            post.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || post.type === filterType;
        const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const filteredUsers = users.filter(u =>
        !searchTerm ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBids = bids.filter(bid =>
        !searchTerm ||
        bid.bidderName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || user.email !== ADMIN_EMAIL) return null;

    return (
        <div className="max-w-7xl mx-auto pb-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
                <p className="text-gray-600">Comprehensive platform management and analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard icon={Package} label="Total Posts" value={stats.totalPosts} color="blue" />
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="green" />
                <StatCard icon={DollarSign} label="Total Bids" value={stats.totalBids} color="purple" />
                <StatCard icon={Archive} label="Deleted" value={stats.deletedPosts} color="red" />
                <StatCard icon={Ban} label="Banned Users" value={stats.bannedUsers} color="orange" />
                <StatCard icon={TrendingUp} label="Active (7d)" value={stats.activeUsers7Days} color="indigo" />
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4 overflow-x-auto">
                    <Tab
                        icon={Package}
                        label="Posts"
                        count={stats.totalPosts}
                        active={activeTab === TABS.POSTS}
                        onClick={() => setActiveTab(TABS.POSTS)}
                    />
                    <Tab
                        icon={Users}
                        label="Users"
                        count={stats.totalUsers}
                        active={activeTab === TABS.USERS}
                        onClick={() => setActiveTab(TABS.USERS)}
                    />
                    <Tab
                        icon={DollarSign}
                        label="Bids"
                        count={stats.totalBids}
                        active={activeTab === TABS.BIDS}
                        onClick={() => setActiveTab(TABS.BIDS)}
                    />
                    <Tab
                        icon={BarChart3}
                        label="Analytics"
                        active={activeTab === TABS.ANALYTICS}
                        onClick={() => setActiveTab(TABS.ANALYTICS)}
                    />
                    <Tab
                        icon={Flag}
                        label="Reports"
                        count={stats.openReports}
                        active={activeTab === TABS.REPORTS}
                        onClick={() => setActiveTab(TABS.REPORTS)}
                    />
                    <Tab
                        icon={Shield}
                        label="ID Verification"
                        count={stats.pendingVerifications}
                        active={activeTab === TABS.ID_VERIFICATION}
                        onClick={() => setActiveTab(TABS.ID_VERIFICATION)}
                    />
                    <Tab
                        icon={MapPin}
                        label="Manual Cities"
                        active={activeTab === TABS.MANUAL_CITIES}
                        onClick={() => setActiveTab(TABS.MANUAL_CITIES)}
                    />
                </div>
            </div>

            {/* Search Bar */}
            {activeTab !== TABS.ANALYTICS && (
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === TABS.POSTS && (
                <PostsManagement
                    posts={filteredPosts}
                    deletedPosts={deletedPosts}
                    onDelete={handleDeletePost}
                    onRestore={handleRestorePost}
                    onFeature={handleFeaturePost}
                    deleting={deleting}
                    loading={loading}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />
            )}

            {activeTab === TABS.USERS && (
                <UsersManagement
                    users={filteredUsers}
                    onBan={handleBanUser}
                    onDelete={handleDeleteUser}
                    banning={banning}
                    loading={loading}
                />
            )}

            {activeTab === TABS.BIDS && (
                <BidsManagement
                    bids={filteredBids}
                    posts={posts}
                    users={users}
                    onDelete={handleDeleteBid}
                    loading={loading}
                />
            )}

            {activeTab === TABS.ANALYTICS && (
                <Analytics stats={stats} posts={posts} users={users} bids={bids} />
            )}

            {activeTab === TABS.REPORTS && (
                <ReportsManagement reports={reports} loading={loading} />
            )}

            {activeTab === TABS.ID_VERIFICATION && (
                <IDVerificationTab
                    users={users}
                    onApprove={handleApproveID}
                    onReject={handleRejectID}
                    loading={loading}
                />
            )}

            {activeTab === TABS.MANUAL_CITIES && (
                <ManualCitiesTab loading={loading} />
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <DeleteModal
                    onClose={() => {
                        setShowDeleteModal(false);
                        setPostToDelete(null);
                        setDeleteReason('');
                    }}
                    onConfirm={confirmDelete}
                    reason={deleteReason}
                    setReason={setDeleteReason}
                />
            )}
        </div>
    );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600',
        orange: 'bg-orange-100 text-orange-600',
        indigo: 'bg-indigo-100 text-indigo-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-600 mb-1">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

// Tab Component
function Tab({ icon: Icon, label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${active
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
            {count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {count}
                </span>
            )}
        </button>
    );
}

// Delete Modal Component
function DeleteModal({ onClose, onConfirm, reason, setReason }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Post</h3>
                <p className="text-gray-600 mb-4">
                    This will move the post to the deleted posts archive. You can restore it later if needed.
                </p>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for deletion (optional)
                    </label>
                    <textarea
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary/50"
                        rows="3"
                        placeholder="e.g., Spam, inappropriate content..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
                    >
                        Delete Post
                    </button>
                </div>
            </div>
        </div>
    );
}

// I'll create separate component files for each management section to keep the code organized
// For now, I'll include placeholder components

function PostsManagement({ posts, onDelete, onFeature, deleting, loading, viewMode, setViewMode }) {
    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Posts Management</h2>
            <div className="space-y-4">
                {posts.slice(0, 10).map(post => (
                    <div key={post.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                            <h3 className="font-semibold">{post.type === 'travel' ? `${post.from} → ${post.to}` : post.itemName}</h3>
                            <p className="text-sm text-gray-600">by {post.userDisplayName}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onFeature(post.id)}
                                className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                            >
                                <Star className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(post.id)}
                                disabled={deleting === post.id}
                                className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UsersManagement({ users, onBan, onDelete, banning, loading }) {
    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Users Management</h2>
            <div className="space-y-4">
                {users.slice(0, 10).map(user => (
                    <div key={user.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                            <h3 className="font-semibold">{user.displayName}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.banned && <span className="text-xs text-red-600">BANNED</span>}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onBan(user.id)}
                                disabled={banning === user.id}
                                className={`px-3 py-1 rounded ${user.banned ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}
                            >
                                <Ban className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(user.id)}
                                className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BidsManagement({ bids, onDelete, loading }) {
    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Bids Management</h2>
            <div className="space-y-4">
                {bids.slice(0, 10).map(bid => (
                    <div key={bid.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                            <h3 className="font-semibold">Bid by {bid.bidderName}</h3>
                            <p className="text-sm text-gray-600">Amount: ₹{bid.price}</p>
                        </div>
                        <button
                            onClick={() => onDelete(bid.id)}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Analytics({ stats, posts, users, bids }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Posts</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalPosts}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Bids</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.totalBids}</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <p className="text-sm text-gray-600">Active Users (7d)</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.activeUsers7Days}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportsManagement({ reports, loading }) {
    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Content Reports</h2>
            <p className="text-gray-600">No reports yet. This feature will track user-reported content.</p>
        </div>
    );
}
