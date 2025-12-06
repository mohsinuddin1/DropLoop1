import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

/**
 * Custom hook to fetch a single document from Firestore
 * @param {string} collectionName - Firestore collection name
 * @param {string} documentId - Document ID
 * @returns {object} { data, loading, error }
 */
export function useDocument(collectionName, documentId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!documentId) {
            setLoading(false);
            return;
        }

        const fetchDocument = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, collectionName, documentId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Document not found');
                }
            } catch (err) {
                console.error(`Error fetching document from ${collectionName}:`, err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocument();
    }, [collectionName, documentId]);

    return { data, loading, error };
}

/**
 * Custom hook to subscribe to a Firestore collection with real-time updates
 * @param {string} collectionName - Firestore collection name
 * @param {array} queryConstraints - Firestore query constraints
 * @returns {object} { data, loading, error }
 */
export function useCollection(collectionName, queryConstraints = []) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const q = query(collection(db, collectionName), ...queryConstraints);

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const documents = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setData(documents);
                    setLoading(false);
                },
                (err) => {
                    console.error(`Error subscribing to ${collectionName}:`, err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error(`Error setting up collection listener:`, err);
            setError(err.message);
            setLoading(false);
        }
    }, [collectionName, JSON.stringify(queryConstraints)]);

    return { data, loading, error };
}

/**
 * Custom hook for debounced values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Custom hook for window scroll position
 * @param {number} threshold - Scroll threshold in pixels
 * @returns {boolean} Whether scrolled past threshold
 */
export function useScrollPosition(threshold = 10) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > threshold);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return scrolled;
}

/**
 * Custom hook for local storage with JSON serialization
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {array} [value, setValue]
 */
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}

/**
 * Custom hook for media queries
 * @param {string} query - Media query string
 * @returns {boolean} Whether media query matches
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}
