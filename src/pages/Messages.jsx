import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { Send, Search, Plus, Paperclip, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { uploadImage } from '../utils/uploadImage';

export default function Messages() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [userDetails, setUserDetails] = useState({});
    const [processedMessageIds, setProcessedMessageIds] = useState(new Set());
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
    const listenerStartTime = useRef(Date.now()); // Track when listener starts to avoid notifying for old messages

    // Fetch Chats
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setChats(chatsData);
            },
            (error) => {
                console.error('Error fetching chats:', error);
            }
        );
        return () => unsubscribe();
    }, [user]);

    // Fetch Messages for Selected Chat
    useEffect(() => {
        if (!selectedChat) return;
        const q = query(
            collection(db, 'chats', selectedChat.id, 'messages'),
            orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Check for new messages from other users (notifications)
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const msg = change.doc.data();
                        const msgId = change.doc.id;

                        if (msg.senderId !== user.uid && !processedMessageIds.has(msgId)) {
                            setProcessedMessageIds(prev => new Set([...prev, msgId]));

                            // Only send notification if message was created after listener started
                            // This prevents notifications for old messages in chat history
                            const messageTimestamp = msg.createdAt?.toMillis();

                            if (messageTimestamp && messageTimestamp > listenerStartTime.current) {
                                const senderName = userDetails[msg.senderId]?.displayName ||
                                    selectedChat.participantNames?.[msg.senderId] ||
                                    'Someone';

                                addNotification({
                                    id: `msg-${msgId}`,
                                    type: 'message',
                                    title: `New message from ${senderName}`,
                                    message: msg.text || '📷 Image',
                                    chatId: selectedChat.id,
                                    userId: msg.senderId,
                                    timestamp: new Date(),
                                    read: false
                                });
                            }
                        }
                    }
                });

                setMessages(messagesData);
            },
            (error) => {
                console.error('Error fetching messages:', error);
            }
        );
        return () => unsubscribe();
    }, [selectedChat, user, userDetails, addNotification, processedMessageIds]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch user details
    const fetchUserDetails = async (uid) => {
        if (userDetails[uid]) return userDetails[uid];
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserDetails(prev => ({ ...prev, [uid]: data }));
                return data;
            }
        } catch (e) { }
        return {};
    };

    // Fetch all user details for chat list
    useEffect(() => {
        if (!user || !chats.length) return;
        const fetchAll = async () => {
            for (const chat of chats) {
                const otherId = chat.participants.find(id => id !== user.uid);
                if (otherId && !userDetails[otherId]) await fetchUserDetails(otherId);
            }
        };
        fetchAll();
    }, [chats, user]);

    // Handle opening a specific user's DM from URL parameter
    useEffect(() => {
        const userId = searchParams.get('userId');
        if (!userId || !user || !chats.length) return;

        const findOrCreateChat = async () => {
            try {
                // Check if chat already exists
                const existingChat = chats.find(chat =>
                    chat.participants.includes(userId) && chat.participants.includes(user.uid)
                );

                if (existingChat) {
                    // Chat exists, select it
                    setSelectedChat(existingChat);
                    setMobileView('chat');
                    // Clear the URL parameter
                    setSearchParams({});
                } else {
                    // Chat doesn't exist, create it
                    const otherUserDoc = await getDoc(doc(db, 'users', userId));
                    if (!otherUserDoc.exists()) {
                        console.error('User not found');
                        setSearchParams({});
                        return;
                    }

                    const otherUserData = otherUserDoc.data();

                    // Create new chat
                    const newChatRef = await addDoc(collection(db, 'chats'), {
                        participants: [user.uid, userId],
                        participantNames: {
                            [user.uid]: user.displayName || 'User',
                            [userId]: otherUserData.displayName || 'User'
                        },
                        lastMessage: '',
                        updatedAt: serverTimestamp(),
                        createdAt: serverTimestamp()
                    });

                    // Fetch the newly created chat
                    const newChatDoc = await getDoc(newChatRef);
                    const newChat = { id: newChatDoc.id, ...newChatDoc.data() };

                    // Select the new chat
                    setSelectedChat(newChat);
                    setMobileView('chat');

                    // Fetch user details
                    await fetchUserDetails(userId);

                    // Clear the URL parameter
                    setSearchParams({});
                }
            } catch (error) {
                console.error('Error finding/creating chat:', error);
                setSearchParams({});
            }
        };

        findOrCreateChat();
    }, [searchParams, user, chats]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !selectedChat) return;

        try {
            let imageUrl = null;
            if (imageFile) {
                setIsUploading(true);
                imageUrl = await uploadImage(imageFile, 'chat-images');
                setIsUploading(false);
            }

            await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
                text: newMessage,
                imageUrl: imageUrl,
                senderId: user.uid,
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, 'chats', selectedChat.id), {
                lastMessage: imageFile ? '📷 Image' : newMessage,
                updatedAt: serverTimestamp()
            });

            setNewMessage('');
            setImageFile(null);
        } catch (error) {
            console.error("Error sending message:", error);
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const getOtherParticipant = (chat) => {
        const otherId = chat.participants.find(id => id !== user.uid);
        return { uid: otherId, ...(userDetails[otherId] || {}), nameFallback: chat.participantNames?.[otherId] };
    };

    const handleChatClick = (chat) => {
        setSelectedChat(chat);
        setMobileView('chat');
    };

    // Filter chats based on search
    const filteredChats = chats.filter(chat => {
        const participant = getOtherParticipant(chat);
        const name = participant.displayName || participant.nameFallback || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const formatTimestamp = (timestamp) => {
        if (!timestamp?.seconds) return '';
        const date = new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} min`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
        if (days === 1) return 'Yesterday';
        return format(date, 'MMM d');
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
            {/* Chat List */}
            <div className={`${mobileView === 'list' ? 'flex' : 'hidden'
                } md:flex w-full md:w-80 flex-col border-r border-gray-200 bg-white`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Plus className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredChats.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">
                            {searchTerm ? 'No conversations found' : 'No conversations yet'}
                        </p>
                    ) : (
                        filteredChats.map(chat => {
                            const participant = getOtherParticipant(chat);
                            const isSelected = selectedChat?.id === chat.id;
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => handleChatClick(chat)}
                                    className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50 border-l-2 border-l-primary' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative flex-shrink-0">
                                            {participant.photoURL ? (
                                                <img
                                                    className="w-12 h-12 rounded-full object-cover"
                                                    src={participant.photoURL}
                                                    alt={participant.displayName || participant.nameFallback || 'User'}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-primary text-lg font-bold">
                                                    {(participant.displayName || participant.nameFallback || 'U')[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {participant.displayName || participant.nameFallback || 'User'}
                                                </h3>
                                                <span className="text-xs text-gray-400 flex-shrink-0">
                                                    {formatTimestamp(chat.updatedAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMobileView('list')}
                                    className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                                </button>
                                {(() => {
                                    const participant = getOtherParticipant(selectedChat);
                                    return (
                                        <>
                                            {participant.photoURL ? (
                                                <img
                                                    src={participant.photoURL}
                                                    alt={participant.displayName || participant.nameFallback}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {(participant.displayName || participant.nameFallback || 'U')[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h2 className="font-semibold text-gray-900">
                                                    {participant.displayName || participant.nameFallback || 'User'}
                                                </h2>
                                                <p className="text-xs text-gray-500">Active now</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md space-y-1`}>
                                        <div
                                            className={`px-4 py-2 rounded-2xl ${msg.senderId === user.uid
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.imageUrl && (
                                                <img src={msg.imageUrl} alt="Shared" className="rounded-md mb-2 max-w-full h-auto" />
                                            )}
                                            {msg.text && <p className="text-sm">{msg.text}</p>}
                                        </div>
                                        <span className={`text-xs text-gray-400 px-4 block ${msg.senderId === user.uid ? 'text-right' : 'text-left'}`}>
                                            {msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), 'HH:mm') : '...'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                            {imageFile && (
                                <div className="mb-2 flex items-center bg-gray-100 p-2 rounded-md">
                                    <span className="text-sm text-gray-600 truncate flex-1">{imageFile.name}</span>
                                    <button type="button" onClick={() => setImageFile(null)} className="text-red-500 text-sm ml-2">Remove</button>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Paperclip className="w-5 h-5 text-gray-500" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !imageFile) || isUploading}
                                    className="bg-primary text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
