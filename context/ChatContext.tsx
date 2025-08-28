"use client";
import { auth, db } from "@/lib/firebase.config";
import { AuthState } from "@/types/enums";
import { ChatContextType, User } from "@/types/interfaces";
import { doc, updateDoc } from "firebase/firestore";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: PropsWithChildren) => {
  const [currentState, setCurrentState] = useState<AuthState>(AuthState.signin);
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
