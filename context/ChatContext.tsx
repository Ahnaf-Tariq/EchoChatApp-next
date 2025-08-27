"use client";
import { auth, db } from "@/lib/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createContext, ReactNode, useContext, useRef, useState } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  lastSeen: number;
  typing: boolean;
  typingTo: string | null;
  active: boolean;
}

interface ChatContextType {
  chatAppName: string;
  currentState: string;
  setCurrentState: (state: string) => void;
  loadUserData: (uid: string) => Promise<void>;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  loginInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [currentState, setCurrentState] = useState<string>("Sign In");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const loginInputRef = useRef<HTMLInputElement | null>(null);
  const chatAppName = "Echo";

  const loadUserData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      setInterval(async () => {
        if (auth) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000); // update user's last seen after every 1 minute
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const value = {
    chatAppName,
    currentState,
    setCurrentState,
    loadUserData,
    selectedUser,
    setSelectedUser,
    loginInputRef,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// custom context hook
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
