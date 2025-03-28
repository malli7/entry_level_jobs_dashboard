"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  hasResume?: boolean;
  resumeText?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const userData = userSnap.exists() ? userSnap.data() : {};

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
      ...userData,
    };
  };

  const updateUserDocument = async (
    firebaseUser: FirebaseUser,
    additionalData?: Record<string, any>
  ) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        createdAt: new Date(),
        hasResume: false,
        ...additionalData,
      });
    } else if (additionalData) {
      // Update existing user document with additional data
      await updateDoc(userRef, additionalData);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Ensure user document exists in Firestore
          await updateUserDocument(firebaseUser);

          const userData = await getUserData(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Ensure user document exists in Firestore
    await updateUserDocument(userCredential.user);

    const userData = await getUserData(userCredential.user);
    return userData;
  };

  const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    // Update or create user document
    await updateUserDocument(userCredential.user);

    const userData = await getUserData(userCredential.user);
    return userData;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string
  ): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile with name if provided
    if (name) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });
    }

    // Send email verification
    await sendEmailVerification(userCredential.user);

    // Create user document in Firestore with hasResume set to false
    await updateUserDocument(userCredential.user, {
      displayName: name,
      hasResume: false,
    });
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error("No user logged in");
    await sendEmailVerification(auth.currentUser);
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("No account found with this email address.");
      }

      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.message === "No account found with this email address.") {
        throw new Error(error.message);
      } else {
        throw new Error(
          "Failed to send password reset email. Please try again."
        );
      }
    }
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
  };

  const updateUserProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) throw new Error("No user logged in");

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, data);
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signInWithGoogle,
        signUpWithEmail,
        resendVerificationEmail,
        resetPassword,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
