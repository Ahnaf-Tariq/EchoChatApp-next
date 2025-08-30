"use client";
import { useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase.config";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { doc, updateDoc } from "firebase/firestore";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import Image from "next/image";
import Button from "./ui/button";

const Navbar = () => {
  const { chatAppName, loginInputRef, setSelectedUser, setSelectedGroup } =
    useChat();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  const logOut = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser?.uid || "");
      await updateDoc(userRef, { active: false });

      await signOut(auth);
      setSelectedUser(null);
      setSelectedGroup(null);
      router.replace("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const signIn = () => {
    loginInputRef.current?.focus();
  };

  const handleAuthAction = () => {
    if (user) {
      logOut();
    } else {
      signIn();
    }
  };

  useEffect(() => {
    const getUser = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser)
    );

    return () => getUser();
  }, []);

  return (
    <nav className="shadow-sm bg-white">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-blue-500">
          <IoChatboxEllipsesOutline className="size-4 sm:size-5" />
          {chatAppName}
        </h1>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <Image
                className="rounded-full border-2 border-gray-100 cursor-pointer"
                src={"/assests/avatar.webp"}
                alt="profile"
                width={40}
                height={40}
              />
            </div>
          )}

          <Button isLoggedIn={user ? true : false} onClick={handleAuthAction} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
