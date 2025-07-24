"use client";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";

export const AppContext = createContext<any>(null);

export const Context = ({ children }: any) => {
  const [image, setImage] = useState<File>();
  const [userData, setUserData] = useState<any>(null);
  const [chatData, setChatData] = useState(null);

  const LoadUserData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userInfo = userSnap.data();
      console.log(userInfo);
      setUserData(userInfo);

      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      setInterval(async () => {
        if (auth) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000); // after every 1 minute
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);
      const snap = onSnapshot(chatRef, async (snapshot: any) => {
        const chats = snapshot.data().chatData;
        const tempData:any = [];
        for (const chat of chats) {
          const userRef = doc(db, "users", chat.rId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          tempData.push({ ...chat, userData });
        }
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));

        return () =>  snap();
      });
    }
  }, [userData]);

  const value = {
    image,
    setImage,
    LoadUserData,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
