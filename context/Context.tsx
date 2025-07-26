"use client";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createContext, useState } from "react";

export const AppContext = createContext<any>(null);

export const Context = ({ children }: any) => {
  const [image, setImage] = useState<File>();

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
      }, 60000); // after every 1 minute
    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    image,
    setImage,
    LoadUserData,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
