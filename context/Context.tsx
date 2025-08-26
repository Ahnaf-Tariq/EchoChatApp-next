"use client";
import { auth, db } from "@/lib/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createContext, ReactNode, useRef, useState } from "react";

export const AppContext = createContext<any>(null);
interface User {
  id: string;
  username: string;
  email: string;
  lastSeen: number;
  typing: boolean;
  typingTo: string | null;
  active: boolean;
}

export const Context = ({ children }: { children: ReactNode }) => {
  const [currentState, setCurrentState] = useState<string>("Sign In");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const loginInputRef = useRef<HTMLInputElement | null>(null);
  const chatAppName = "Echo";

  const LoadUserData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userInfo = userSnap.data();
      console.log(userInfo);

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
      console.log(error);
    }
  };

  const value = {
    chatAppName,
    currentState,
    setCurrentState,
    LoadUserData,
    selectedUser,
    setSelectedUser,
    loginInputRef,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
