import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Send, User, Image as ImageIcon, Loader, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { uploadImage } from '../utils/uploadImage';

export default function Messages() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [userDetails, setUserDetails] = useState({}); // New: Cache user data (avatar, name)
    const [processedMessageIds, setProcessedMessageIds] = useState(new Set());

    // Fetch Chats
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log('Fetched chats:', chatsData);
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
                console.log('Fetched messages for chat:', selectedChat.id, messagesData);
                
                // Check for new messages from other users (notifications)
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const msg = change.doc.data();
                        const msgId = change.doc.id;
                        
                        // Only notify if message is from someone else and not already processed
                        if (msg.senderId !== user.uid && !processedMessageIds.has(msgId)) {
                            setProcessedMessageIds(prev => new Set([...prev, msgId]));
                            
                            // Get sender name
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

    // Helper: fetch user doc from Firestore if not in cache
    const fetchUserDetails = async (uid) => {
        if (userDetails[uid]) return userDetails[uid];
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserDetails(prev => ({ ...prev, [uid]: data }));
                return data;
            }
        } catch(e) {}
        return {};
    };

    // WhatsApp-style: add avatars to all chatlist on load
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
        // Returns: { uid, displayName, photoURL }
        return { uid: otherId, ...(userDetails[otherId] || {}), nameFallback: chat.participantNames?.[otherId] };
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* WhatsApp-style Chat List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold text-gray-700">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No conversations yet.</p>
                    ) : (
                        chats.map(chat => {
                            const participant = getOtherParticipant(chat);
                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`flex items-center space-x-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-indigo-50' : ''}`}
                                >
                                    {participant.photoURL ? (
                                        <img className="w-12 h-12 rounded-full object-cover" src={participant.photoURL} alt={participant.displayName || participant.nameFallback || 'User'} />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-primary text-xl font-bold">
                                            {participant.displayName ? participant.displayName[0] : participant.nameFallback ? participant.nameFallback[0] : 'U'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-base font-semibold text-gray-900 truncate">{participant.displayName || participant.nameFallback || 'User'}</p>
                                            <span className="text-xs text-gray-400 ml-2">{chat.updatedAt?.seconds ? format(new Date(chat.updatedAt.seconds * 1000), 'HH:mm') : ''}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMessage}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="mr-3 md:hidden text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <h3 className="font-medium text-gray-900">{getOtherParticipant(selectedChat).displayName || getOtherParticipant(selectedChat).nameFallback || 'User'}</h3>
                            </div>
                            {/* Profile info is already visible - name and avatar shown in chat list */}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${msg.senderId === user.uid
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.imageUrl && (
                                            <img src={msg.imageUrl} alt="Shared" className="rounded-md mb-2 max-w-full h-auto" />
                                        )}
                                        {msg.text && <p>{msg.text}</p>}
                                        <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), 'HH:mm') : '...'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                            {imageFile && (
                                <div className="mb-2 flex items-center bg-gray-100 p-2 rounded-md">
                                    <span className="text-sm text-gray-600 truncate flex-1">{imageFile.name}</span>
                                    <button type="button" onClick={() => setImageFile(null)} className="text-red-500 text-sm ml-2">Remove</button>
                                </div>
                            )}
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                                >
                                    <ImageIcon className="w-6 h-6" />
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
                                    className="flex-1 border-gray-300 rounded-full shadow-sm focus:ring-primary focus:border-primary px-4 py-2 border"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !imageFile) || isUploading}
                                    className="bg-primary text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {isUploading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
