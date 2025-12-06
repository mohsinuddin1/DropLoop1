import { CURRENCY, DATE_FORMATS } from './constants';
import { format } from 'date-fns';

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} symbol - Currency symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, symbol = CURRENCY.SYMBOL) {
    if (typeof amount !== 'number') return `${symbol}0`;
    return `${symbol}${amount.toLocaleString('en-IN')}`;
}

/**
 * Format timestamp to human-readable date
 * @param {object} timestamp - Firestore timestamp
 * @param {string} formatString - Date format string
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp, formatString = DATE_FORMATS.DISPLAY) {
    if (!timestamp?.seconds) return '';
    return format(new Date(timestamp.seconds * 1000), formatString);
}

/**
 * Calculate relative time (e.g., "2 hours ago")
 * @param {object} timestamp - Firestore timestamp
 * @returns {string} Relative time string
 */
export function getRelativeTime(timestamp) {
    if (!timestamp?.seconds) return '';

    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return format(date, DATE_FORMATS.SHORT);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {object} { valid, error }
 */
export function validateImageFile(file, maxSize = 5 * 1024 * 1024) {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }

    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'File must be an image' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
    }

    return { valid: true, error: null };
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calculate average rating
 * @param {array} reviews - Array of review objects with rating property
 * @returns {number} Average rating
 */
export function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
}

/**
 * Sanitize user input
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Check if user is post owner
 * @param {string} userId - Current user ID
 * @param {string} postOwnerId - Post owner ID
 * @returns {boolean} Whether user is owner
 */
export function isPostOwner(userId, postOwnerId) {
    return userId && postOwnerId && userId === postOwnerId;
}

/**
 * Generate unique ID (simple implementation)
 * @returns {string} Unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Whether object is empty
 */
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Group array by key
 * @param {array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {object} Grouped object
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}
