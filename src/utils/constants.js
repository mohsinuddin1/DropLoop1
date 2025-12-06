// Application Constants

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    POSTS: '/posts',
    POST_DETAIL: '/posts/:postId',
    CREATE_POST: '/create',
    DASHBOARD: '/dashboard',
    MESSAGES: '/messages',
    PROFILE: '/profile',
    PROFILE_USER: '/profile/:userId',
};

// Post Types
export const POST_TYPES = {
    ITEM: 'item',
    TRAVEL: 'travel',
};

// Bid Status
export const BID_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
};

// Filter Types
export const FILTER_TYPES = {
    ALL: 'all',
    SENDER: 'sender',
    TRAVELER: 'traveler',
};

// Storage Keys
export const STORAGE_KEYS = {
    THEME: 'theme',
    DARK_MODE: 'darkMode',
};

// Firestore Collections
export const COLLECTIONS = {
    USERS: 'users',
    POSTS: 'posts',
    BIDS: 'bids',
    CHATS: 'chats',
    REVIEWS: 'reviews',
};

// Validation
export const VALIDATION = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_BIO_LENGTH: 500,
    MAX_MESSAGE_LENGTH: 1000,
    MIN_PASSWORD_LENGTH: 6,
};

// UI Constants
export const UI = {
    SCROLL_THRESHOLD: 10,
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000,
    MAX_UNREAD_DISPLAY: 9,
};

// Currency
export const CURRENCY = {
    SYMBOL: '₹',
    CODE: 'INR',
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM d, yyyy',
    FULL: 'yyyy-MM-dd HH:mm:ss',
    SHORT: 'MMM d',
};

// Error Messages
export const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    AUTH_REQUIRED: 'Please log in to continue.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    POST_CREATED: 'Post created successfully!',
    BID_PLACED: 'Bid placed successfully!',
    MESSAGE_SENT: 'Message sent!',
    PROFILE_UPDATED: 'Profile updated successfully!',
};
