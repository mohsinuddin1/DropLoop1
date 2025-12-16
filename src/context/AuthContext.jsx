import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore, if not create
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString()
                });
            }

            return user;
        } catch (error) {
            console.error("Google Sign In Error", error);
            if (error.code === 'permission-denied') {
                throw new Error('Failed to create user profile. Please contact support if this persists.');
            }
            throw error;
        }
    };

    const signupWithEmail = async (email, password, name, phoneNumber) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // Send email verification
            await sendEmailVerification(user);

            // Update display name
            await updateProfile(user, { displayName: name });

            // Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: name,
                email: email,
                phoneNumber: phoneNumber || null,
                photoURL: null,
                createdAt: new Date().toISOString()
            });

            return user;
        } catch (error) {
            console.error("Signup Error", error);
            // Provide more helpful error messages
            if (error.code === 'permission-denied') {
                throw new Error('Failed to create user profile. Please contact support if this persists.');
            }
            throw error;
        }
    };

    const loginWithEmail = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Check if email is verified
        if (!result.user.emailVerified) {
            // Sign out the user immediately
            await signOut(auth);
            throw new Error('Please verify your email before logging in. Check your inbox for the verification email.');
        }

        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        loading,
        loginWithGoogle,
        signupWithEmail,
        loginWithEmail,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
