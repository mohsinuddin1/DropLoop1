import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, orderBy, limit } from 'firebase/firestore';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Request browser notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Show browser notification
    const showBrowserNotification = (title, body, icon = null) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: icon || '/favicon.ico',
                badge: '/favicon.ico',
            });
        }
    };

    // Add notification
    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification
        showBrowserNotification(
            notification.title,
            notification.message,
            notification.icon
        );
    };

    // Mark notification as read
    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    // Note: Message notifications are handled in Messages.jsx component
    // This context provides the notification system infrastructure

    // Listen for bid status changes (when bid is accepted)
    useEffect(() => {
        if (!user) return;

        const bidsQuery = query(
            collection(db, 'bids'),
            where('bidderId', '==', user.uid)
        );

        const unsubscribeBids = onSnapshot(bidsQuery, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === 'modified') {
                    const bidData = change.doc.data();
                    const oldData = change.doc.metadata.hasPendingWrites ? null : change.doc.data();
                    
                    // Check if status changed to 'accepted'
                    if (bidData.status === 'accepted' && (!oldData || oldData.status !== 'accepted')) {
                        // Get post owner's name
                        try {
                            const postDoc = await getDoc(doc(db, 'posts', bidData.postId));
                            const postOwnerName = postDoc.exists() 
                                ? postDoc.data().userDisplayName 
                                : 'Post Owner';

                            addNotification({
                                id: `bid-accepted-${change.doc.id}-${Date.now()}`,
                                type: 'bid_accepted',
                                title: '🎉 Bid Accepted!',
                                message: `${postOwnerName} accepted your bid of ₹${bidData.amount}`,
                                bidId: change.doc.id,
                                postId: bidData.postId,
                                timestamp: new Date(),
                                read: false
                            });
                        } catch (error) {
                            console.error('Error fetching post for notification:', error);
                        }
                    }
                }
            });
        });

        return () => unsubscribeBids();
    }, [user]);

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        showBrowserNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

